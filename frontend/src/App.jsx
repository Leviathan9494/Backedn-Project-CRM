import React, { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from './api'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await getProducts(query)
      setProducts(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [query])

  async function handleCreate(payload) {
    const created = await createProduct(payload)
    setProducts((s) => [created, ...s])
  }

  async function handleUpdate(id, payload) {
    const updated = await updateProduct(id, payload)
    setProducts((s) => s.map(p => p.id === id ? updated : p))
    setEditing(null)
  }

  async function handleDelete(id) {
    const ok = await deleteProduct(id)
    if (ok) setProducts((s) => s.filter(p => p.id !== id))
  }

  return (
    <div className="container">
      <h1>PRM — Product Management</h1>
      <p>Backend: <a href={`${API_URL}/swagger`} target="_blank">Swagger UI</a></p>

      <div className="topbar">
        <input placeholder="Search products" value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="layout">
        <div className="left">
          <h2>Create Product</h2>
          <ProductForm onSubmit={handleCreate} />
        </div>
        <div className="right">
          <h2>Products</h2>
          {loading ? <p>Loading...</p> : (
            <ProductList products={products} onEdit={setEditing} onDelete={handleDelete} />
          )}
        </div>
      </div>

      {editing && (
        <div className="modal">
          <div className="modal-inner">
            <h3>Edit Product</h3>
            <ProductForm initial={editing} onSubmit={(data) => handleUpdate(editing.id, data)} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}

    </div>
  )
}
