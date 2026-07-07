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

    // Fetch product details to calculate total and lock in prices
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

    // Check stock availability before committing
    for (const item of itemsWithProducts) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name}`)
      }
    }

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      status: "pending",
      total,
      createdAt: Date.now(),
    })

    // Create order items and decrement stock
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

    // Clear the cart
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