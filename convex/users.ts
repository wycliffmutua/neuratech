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
    })

    return userId
  },
})