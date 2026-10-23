import { mutation, query, action, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { Resend } from "resend"

export const createOrder = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not synced yet")

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    if (cartItems.length === 0) throw new Error("Cart is empty")

    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId)
        if (!product) throw new Error("Product not found")
        return { ...item, product }
      })
    )

    const total = itemsWithProducts.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    for (const item of itemsWithProducts) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name}`)
      }
    }

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      status: "paid",
      total,
      createdAt: Date.now(),
    })

    for (const item of itemsWithProducts) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      })

      await ctx.db.patch(item.productId, {
        stock: item.product.stock - item.quantity,
      })
    }

    for (const item of cartItems) {
      await ctx.db.delete(item._id)
    }

    // Schedule automatic email dispatch to customer
    const customerEmail = identity.email || user.email
    if (customerEmail) {
      const itemsList = itemsWithProducts
        .map((i) => `${i.quantity}x ${i.product.name}`)
        .join(", ")

      await ctx.scheduler.runAfter(0, internal.orders.sendReceiptEmail, {
        customerEmail,
        orderId: String(orderId),
        total,
        itemsSummary: itemsList,
      })
    }

    return orderId
  },
})

// Internal action to call Resend API
export const sendReceiptEmail = action({
  args: {
    customerEmail: v.string(),
    orderId: v.string(),
    total: v.number(),
    itemsSummary: v.string(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY)

    try {
      await resend.emails.send({
        from: "NeuraTech <onboarding@resend.dev>", // Replace with your domain once verified
        to: args.customerEmail,
        subject: `Your NeuraTech Order Receipt [${args.orderId}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #a855f7; margin: 0; font-size: 24px;">NeuraTech.</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Official Purchase Confirmation</p>
            </div>
            <div style="padding: 20px; color: #334155;">
              <h2>Thank you for your purchase!</h2>
              <p>Your payment has been successfully confirmed and processed.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p><strong>Order ID:</strong> ${args.orderId}</p>
              <p><strong>Items:</strong> ${args.itemsSummary}</p>
              <p><strong>Total Paid:</strong> KSh ${args.total.toLocaleString()}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">If you have any questions, reach out to support@neuratech.co.ke.</p>
            </div>
          </div>
        `,
      })
      console.log(`[Email Dispatch Success] Sent receipt to ${args.customerEmail}`)
    } catch (err) {
      console.error("[Email Dispatch Failure]", err)
    }
  },
})

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const withItems = await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect()

        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const product = await ctx.db.get(item.productId)
            return { ...item, product }
          })
        )

        return { ...order, items: itemsWithProducts }
      })
    )

    return withItems.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      throw new Error("Not authorized")
    }

    const orders = await ctx.db.query("orders").collect()

    const withDetails = await Promise.all(
      orders.map(async (order) => {
        const customer = await ctx.db.get(order.userId)
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect()
        const itemsWithProducts = await Promise.all(
          items.map(async (item) => ({
            ...item,
            product: await ctx.db.get(item.productId),
          }))
        )
        return { ...order, customer, items: itemsWithProducts }
      })
    )

    return withDetails.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      throw new Error("Not authorized")
    }

    await ctx.db.patch(args.orderId, { status: args.status })
  },
})

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") throw new Error("Not authorized")

    const orders = await ctx.db.query("orders").collect()
    const products = await ctx.db.query("products").collect()
    const allUsers = await ctx.db.query("users").collect()

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0)

    const totalOrders = orders.length
    const pendingOrders = orders.filter((o) => o.status === "pending").length
    const lowStockProducts = products.filter((p) => p.stock < 5)
    const totalCustomers = allUsers.filter((u) => u.role === "customer" || !u.role).length

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      totalCustomers,
      totalProducts: products.length,
    }
  },
})

export const savePaymentRequest = internalMutation({
  args: { orderId: v.id("orders"), checkoutRequestId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { checkoutRequestId: args.checkoutRequestId })
  },
})

export const markOrderPaidByCheckoutId = internalMutation({
  args: { checkoutRequestId: v.string(), success: v.boolean() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_checkout_request", (q) =>
        q.eq("checkoutRequestId", args.checkoutRequestId)
      )
      .unique()

    if (!order) return

    await ctx.db.patch(order._id, {
      status: args.success ? "paid" : "cancelled",
    })
  },
})

export const getOrderReceipt = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const order = await ctx.db.get(args.orderId)
    if (!order) return null

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect()

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId)
        return { ...item, product }
      })
    )

    return { ...order, items: itemsWithProducts }
  },
})