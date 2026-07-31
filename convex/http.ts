import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"

const http = httpRouter()

http.route({
  path: "/mpesa-callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json()

    const stkCallback = body?.Body?.stkCallback
    if (!stkCallback) {
      return new Response("Invalid payload", { status: 400 })
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID
    const resultCode = stkCallback.ResultCode

    await ctx.runMutation(internal.orders.markOrderPaidByCheckoutId, {
      checkoutRequestId,
      success: resultCode === 0,
    })

    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }),
})

export default http