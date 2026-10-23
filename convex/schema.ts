import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    category: v.string(),
    images: v.array(v.string()),
    specs: v.optional(v.record(v.string(), v.string())),
  }).index("by_category", ["category"]),

  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    subtotal: v.optional(v.number()),
    shippingFee: v.optional(v.number()),
    total: v.number(),
    shippingAddress: v.optional(v.string()),
    distanceKm: v.optional(v.number()),
    customerEmail: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    checkoutRequestId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_checkout_request", ["checkoutRequestId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    priceAtPurchase: v.number(),
  }).index("by_order", ["orderId"]),
});
