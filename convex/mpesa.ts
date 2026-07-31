"use node"

import { action } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"

async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to get M-Pesa access token")
  }

  const data = await response.json()
  return data.access_token
}

function getTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  )
}

export const initiateSTKPush = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const shortcode = process.env.MPESA_SHORTCODE!
    const passkey = process.env.MPESA_PASSKEY!
    const timestamp = getTimestamp()
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
      "base64"
    )

    const accessToken = await getAccessToken()

    // Normalize phone number to 254XXXXXXXXX format
    let phone = args.phoneNumber.replace(/\D/g, "")
    if (phone.startsWith("0")) phone = "254" + phone.slice(1)
    if (phone.startsWith("7") || phone.startsWith("1")) phone = "254" + phone

    const callbackUrl = `https://useful-sparrow-524.convex.site/mpesa-callback`

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(args.amount),
          PartyA: phone,
          PartyB: shortcode,
          PhoneNumber: phone,
          CallBackURL: callbackUrl,
          AccountReference: args.orderId,
          TransactionDesc: "NeuraTech Order Payment",
        }),
      }
    )

    const data = await response.json()

    if (data.ResponseCode !== "0") {
      throw new Error(data.errorMessage || "STK Push failed to initiate")
    }

    // Save the CheckoutRequestID so we can match the callback to this order later
    await ctx.runMutation(internal.orders.savePaymentRequest, {
      orderId: args.orderId,
      checkoutRequestId: data.CheckoutRequestID,
    })

    return { checkoutRequestId: data.CheckoutRequestID }
  },
})