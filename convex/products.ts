import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Helper: check if current user is admin
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

// Get all products
export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect()
  },
})

// Get a single product by ID
export const getProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId)
  },
})

// Get products by category
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect()
  },
})

// Create a new product (admin only)
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    category: v.string(),
    images: v.array(v.string()),
    specs: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const productId = await ctx.db.insert("products", args)
    return productId
  },
})

// Update an existing product (admin only)
export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    category: v.string(),
    images: v.array(v.string()),
    specs: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const { productId, ...data } = args
    await ctx.db.patch(productId, data)
  },
})

// Delete a product (admin only)
export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.delete(args.productId)
  },
})