import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { categories } from './data/categories'

function App() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const products = useQuery(api.products.listProducts)
  const cart = useQuery(api.cart.getCart)
  const addToCart = useMutation(api.cart.addToCart)

  const filteredProducts = activeCategory
    ? products?.filter((p) => p.category === activeCategory)
    : products

  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">NeuraTech</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Category bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeCategory === null
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.flatMap((cat) => cat.subcategories).map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveCategory(sub)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === sub
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">
          {activeCategory ?? 'Our Products'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts?.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="aspect-square bg-slate-100">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
                <p className="text-slate-500 text-sm mb-3 line-clamp-2 flex-1">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-indigo-600">
                    KSh {product.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => addToCart({ productId: product._id, quantity: 1 })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-lg font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredProducts?.length === 0 && (
          <p className="text-slate-400 text-center py-12">No products in this category yet.</p>
        )}
      </main>
    </div>
  )
}

export default App