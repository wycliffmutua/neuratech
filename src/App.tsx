import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

function App() {
  const products = useQuery(api.products.listProducts)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex justify-between items-center p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">NeuraTech</h1>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>

      <main className="p-8">
        <h2 className="text-3xl font-bold mb-6">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div key={product._id} className="bg-gray-900 rounded-xl p-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{product.description}</p>
              <p className="text-xl font-bold">KSh {product.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App