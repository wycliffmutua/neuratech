import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  images: '',
}

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'products' | 'users'>('products')
  const products = useQuery(api.products.listProducts)
  const createProduct = useMutation(api.products.createProduct)
  const updateProduct = useMutation(api.products.updateProduct)
  const deleteProduct = useMutation(api.products.deleteProduct)

  const users = useQuery(api.users.listAllUsers)
  const setUserRole = useMutation(api.users.setUserRole)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<Id<'products'> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      }

      if (editingId) {
        await updateProduct({ productId: editingId, ...payload })
      } else {
        await createProduct(payload)
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const startEdit = (product: NonNullable<typeof products>[number]) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      images: product.images.join(', '),
    })
  }

  return (
    <div className="fixed inset-0 z-30 bg-slate-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg font-medium"
          >
            Back to Store
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'products' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Users
          </button>
        </div>

        {tab === 'products' && (
          <>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-8 shadow-sm space-y-4">
              <h2 className="font-semibold text-lg">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  placeholder="Category (e.g. Headphones)"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Price (KSh)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border border-slate-300 rounded-lg px-3 py-2 w-full"
                rows={3}
                required
              />
              <input
                placeholder="Image URLs (comma-separated, e.g. /images/headphones.jpg)"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="border border-slate-300 rounded-lg px-3 py-2 w-full"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium"
                >
                  {editingId ? 'Save Changes' : 'Add Product'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-200 hover:bg-slate-300 px-5 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product._id} className="border-t border-slate-100">
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">KSh {product.price.toLocaleString()}</td>
                      <td className="p-3">{product.stock}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct({ productId: product._id })}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u._id} className="border-t border-slate-100">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role ?? 'customer'}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.role === 'admin' ? (
                        <button
                          onClick={() => setUserRole({ userId: u._id, role: 'customer' })}
                          className="text-slate-500 hover:underline"
                        >
                          Demote to Customer
                        </button>
                      ) : (
                        <button
                          onClick={() => setUserRole({ userId: u._id, role: 'admin' })}
                          className="text-indigo-600 hover:underline"
                        >
                          Promote to Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel