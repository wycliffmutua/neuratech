import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'

function ProductDetail({
  productId,
  onBack,
}: {
  productId: Id<'products'>
  onBack: () => void
}) {
  const product = useQuery(api.products.getProduct, { productId })
  const addToCart = useMutation(api.cart.addToCart)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (product === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    )
  }

  if (product === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Product not found.</p>
        <button onClick={onBack} className="text-indigo-600 hover:underline">
          Back to store
        </button>
      </div>
    )
  }

  const handleAddToCart = async () => {
    await addToCart({ productId: product._id, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-indigo-600 text-sm font-medium mb-6"
        >
          &larr; Back to store
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Image */}
          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-6"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-2">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">{product.name}</h1>
            <p className="text-slate-500 mb-6">{product.description}</p>

            <p className="text-3xl font-bold text-indigo-600 mb-1">
              KSh {product.price.toLocaleString()}
            </p>
            <p
              className={`text-sm mb-6 ${
                product.stock > 0 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>

            {/* Specs table */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} className="border-t border-slate-100">
                        <td className="py-2 text-slate-500">{key}</td>
                        <td className="py-2 text-slate-900 font-medium">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div className="mt-auto flex items-center gap-4">
                <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium"
                >
                  {added ? 'Added ✓' : 'Add to Cart'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail