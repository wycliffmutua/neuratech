import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function MyOrders({ onClose }: { onClose: () => void }) {
  const orders = useQuery(api.orders.getMyOrders)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="fixed inset-0 z-30 bg-slate-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg font-medium"
          >
            Back to Store
          </button>
        </div>

        {orders?.length === 0 && (
          <p className="text-slate-400 text-center py-16">
            You haven't placed any orders yet.
          </p>
        )}

        <div className="space-y-4">
          {orders?.map((order) => {
            const isExpanded = expandedId === order._id
            return (
              <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  className="w-full flex justify-between items-center p-5 text-left"
                >
                  <div>
                    <p className="text-sm text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="font-semibold text-lg text-indigo-600">
                      KSh {order.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyles[order.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-3">
                    {(!order.items || order.items.length === 0) && (
                      <p className="text-sm text-slate-400">
                        No item details available for this order.
                      </p>
                    )}
                    {order.items?.map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <img
                          src={item.product?.images[0]}
                          alt={item.product?.name}
                          className="w-12 h-12 object-contain bg-slate-100 rounded-lg p-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.product?.name ?? 'Product unavailable'}
                          </p>
                          <p className="text-xs text-slate-400">
                            Qty: {item.quantity} × KSh {item.priceAtPurchase.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MyOrders