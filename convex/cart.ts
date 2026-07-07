import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const addToCart = mutation({
  args: { productId: v.id("products"), quantity: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("User not synced yet")

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { quantity: existing.quantity + args.quantity })
      return existing._id
    }

    return await ctx.db.insert("cartItems", {
      userId: user._id,
      productId: args.productId,
      quantity: args.quantity,
    })
  },
})

export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return []

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const withProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId)
        return { ...item, product }
      })
    )

    return withProducts
  },
})

export const removeFromCart = mutation({
  args: { cartItemId: v.id("cartItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartItemId)
  },
})

export const updateQuantity = mutation({
  args: { cartItemId: v.id("cartItems"), quantity: v.number() },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId)
      return
    }
    await ctx.db.patch(args.cartItemId, { quantity: args.quantity })
  },
})