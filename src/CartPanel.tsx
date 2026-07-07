import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'

function CartPanel({ onClose }: { onClose: () => void }) {
  const cart = useQuery(api.cart.getCart)
  const updateQuantity = useMutation(api.cart.updateQuantity)
  const removeFromCart = useMutation(api.cart.removeFromCart)
  const createOrder = useMutation(api.orders.createOrder)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const total = cart?.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  ) ?? 0

  const handleCheckout = async () => {
    setError(null)
    setCheckingOut(true)
    try {
      await createOrder({})
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-20 flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">Order placed!</h2>
          <p className="text-slate-500 mb-6">Your order has been created successfully.</p>
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
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium"
            >
              {checkingOut ? 'Placing order...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPanel