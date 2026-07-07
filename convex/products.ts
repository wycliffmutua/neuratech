import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Get all products
export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect()
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

// Create a new product (for you, the admin, to add electronics)
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
    const productId = await ctx.db.insert("products", args)
    return productId
  },
})