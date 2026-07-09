import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

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
      status: "pending",
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

    return orderId
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

    return orders.sort((a, b) => b.createdAt - a.createdAt)
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
        return { ...order, customer, items }
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