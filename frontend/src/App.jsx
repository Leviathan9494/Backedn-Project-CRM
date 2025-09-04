import React, { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from './api'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'
import headerImg from '../Generated image 1.png'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null)

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
    try {
      setError(null)
      const created = await createProduct(payload)
      // reload list to ensure consistent source of truth
      await load()
      return created
    } catch (err) {
      console.error('create failed', err)
      setError(err.message || String(err))
      return null
    }
  }

  async function handleUpdate(id, payload) {
    try {
      setError(null)
      const updated = await updateProduct(id, payload)
      await load()
      setEditing(null)
      return updated
    } catch (err) {
      console.error('update failed', err)
      setError(err.message || String(err))
      return null
    }
  }

  async function handleDelete(id) {
    try {
      setError(null)
      const ok = await deleteProduct(id)
      if (ok) await load()
      return ok
    } catch (err) {
      console.error('delete failed', err)
      setError(err.message || String(err))
      return false
    }
  }

  return (
    <div className="container">
      <header className="app-header">
        <img src={headerImg} alt="PRM graphic" className="header-image" />
        <div>
          <h1>PRM — Product Management</h1>
          <p>Backend: <a href={`${API_URL}/swagger`} target="_blank">Swagger UI</a></p>
        </div>
      </header>

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
          {error && <div className="error">Error: {error}</div>}
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
