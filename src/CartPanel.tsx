import { useState, useEffect } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'

function CartPanel({ onClose }: { onClose: () => void }) {
  const cart = useQuery(api.cart.getCart)
  const updateQuantity = useMutation(api.cart.updateQuantity)
  const removeFromCart = useMutation(api.cart.removeFromCart)
  const createOrder = useMutation(api.orders.createOrder)
  const initiateSTKPush = useAction(api.mpesa.initiateSTKPush)

  const [step, setStep] = useState<'cart' | 'phone' | 'waiting' | 'success' | 'failed'>('cart')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<Id<'orders'> | null>(null)
  const [paidAmount, setPaidAmount] = useState(0)

  const myOrders = useQuery(
    api.orders.getMyOrders,
    step === 'waiting' ? {} : 'skip'
  )

  const total = cart?.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  ) ?? 0

  useEffect(() => {
    if (step !== 'waiting' || !pendingOrderId || !myOrders) return
    const order = myOrders.find((o) => o._id === pendingOrderId)
    if (order?.status === 'paid') {
      setStep('success')
    } else if (order?.status === 'cancelled') {
      setStep('failed')
    }
  }, [myOrders, step, pendingOrderId])

  const handleProceedToPhone = () => {
    setError(null)
    setStep('phone')
  }

  const handlePay = async () => {
    setError(null)
    if (!/^(0|254|\+254)?[71]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      setError('Enter a valid Safaricom number (e.g. 0712345678)')
      return
    }

    const amountToPay = total
    setPaidAmount(amountToPay)

    try {
      const orderId = await createOrder({})
      setPendingOrderId(orderId)
      setStep('waiting')
      await initiateSTKPush({ phoneNumber: phone, amount: amountToPay, orderId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed to start')
      setStep('phone')
    }
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">Payment received!</h2>
          <p className="text-slate-500 mb-6">Your order has been paid and confirmed.</p>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (step === 'failed') {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Payment not completed</h2>
          <p className="text-slate-500 mb-6">
            The M-Pesa payment was cancelled or failed. Your order is saved — you can retry from My Orders.
          </p>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (step === 'waiting') {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="text-5xl mb-4 animate-pulse">📱</div>
          <h2 className="text-xl font-bold mb-2">Check your phone</h2>
          <p className="text-slate-500">
            Enter your M-Pesa PIN on the prompt sent to {phone} to complete payment of{' '}
            <span className="font-semibold text-indigo-600">KSh {paidAmount.toLocaleString()}</span>.
          </p>
        </div>
      </div>
    )
  }

  if (step === 'phone') {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col p-6">
          <button
            onClick={() => setStep('cart')}
            className="text-slate-400 hover:text-slate-700 text-sm mb-6 self-start"
          >
            &larr; Back to cart
          </button>
          <h2 className="text-xl font-bold mb-2">Pay with M-Pesa</h2>
          <p className="text-slate-500 text-sm mb-6">
            Enter the phone number to receive the payment prompt.
          </p>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <input
            type="tel"
            placeholder="0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 mb-4"
          />
          <p className="text-sm text-slate-500 mb-6">
            Amount: <span className="font-semibold text-indigo-600">KSh {total.toLocaleString()}</span>
          </p>
          <button
            onClick={handlePay}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium"
          >
            Send Payment Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-20 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart?.length === 0 && (
            <p className="text-slate-400 text-center py-12">Your cart is empty.</p>
          )}
          {cart?.map((item) => (
            <div key={item._id} className="flex gap-4 items-center">
              <img
                src={item.product?.images[0]}
                alt={item.product?.name}
                className="w-16 h-16 object-contain bg-slate-100 rounded-lg p-1"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product?.name}</p>
                <p className="text-indigo-600 font-semibold text-sm">
                  KSh {item.product?.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity - 1 })}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200"
                  >
                    −
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity + 1 })}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeFromCart({ cartItemId: item._id })}
                className="text-slate-400 hover:text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {cart && cart.length > 0 && (
          <div className="p-6 border-t border-slate-200">
            {error && (
              <p className="text-red-500 text-sm mb-3">{error}</p>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg text-indigo-600">
                KSh {total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleProceedToPhone}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium"
            >
              Checkout with M-Pesa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPanel
