import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Get the currently logged-in user's record, or null if not synced yet
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    return user
  },
})

// Create the user record in Convex if it doesn't exist yet
export const createUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (existing) return existing._id

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? "Unknown",
      imageUrl: identity.pictureUrl,
      role: "customer",
    })

    return userId
  },
})

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Not authenticated")

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique()

  if (!user || user.role !== "admin") throw new Error("Not authorized")
  return user
}

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.db.query("users").collect()
  },
})

export const setUserRole = mutation({
  args: { userId: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.patch(args.userId, { role: args.role })
  },
})
export const getCustomersWithOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!admin || admin.role !== "admin") throw new Error("Not authorized")

    const customers = await ctx.db.query("users").collect()

    const withOrders = await Promise.all(
      customers
        .filter((u) => u.role === "customer" || !u.role)
        .map(async (customer) => {
          const orders = await ctx.db
            .query("orders")
            .withIndex("by_user", (q) => q.eq("userId", customer._id))
            .collect()

          return {
            ...customer,
            orders: orders.sort((a, b) => b.createdAt - a.createdAt),
            totalSpent: orders
              .filter((o) => o.status !== "cancelled")
              .reduce((sum, o) => sum + o.total, 0),
          }
        })
    )

    return withOrders.sort((a, b) => b.totalSpent - a.totalSpent)
  },
})