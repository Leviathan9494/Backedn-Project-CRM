import React, { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from './api'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import headerImg from '../Generated image 1.png'
import colorRef from '../Generated image 1.png'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  async function load(q) {
    setLoading(true)
    try {
      const res = await getProducts(typeof q === 'undefined' ? query : q)
      setProducts(res || [])
    } finally {
      setLoading(false)
    }
  }

  // initial load
  useEffect(() => { load() }, [])

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
        <div className="logo-wrap">
          <img src={headerImg} alt="PRM logo" className="logo" />
          <div className="brand">PRM</div>
        </div>
        <nav className="top-nav">
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Dashboard</button>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Settings</button>
        </nav>
        <div className="header-right">
          <p>Backend: <a href={`${API_URL}/swagger`} target="_blank">Swagger UI</a></p>
          <img src={colorRef} alt="color ref" className="color-ref" />
        </div>
      </header>

      <div className="topbar">
        <input placeholder="Search products" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <button onClick={() => { setQuery(searchTerm); load(searchTerm) }}>Search</button>
        <button onClick={() => { setSearchTerm(''); setQuery(''); load('') }}>Clear</button>
        <button onClick={() => load()}>Refresh</button>
      </div>

      {tab === 'dashboard' && (
        <div className="page"><Dashboard /></div>
      )}
      {tab === 'products' && (
        <div className="layout">
          <div className="left">
            <h2>Create Product</h2>
            <ProductForm onSubmit={handleCreate} />
          </div>
          <div className="right">
            <h2>Products</h2>
            {error && <div className="error">Error: {error}</div>}
            {loading ? <p>Loading...</p> : (
              products && products.length > 0 ? (
                <ProductList products={products} onEdit={setEditing} onDelete={handleDelete} />
              ) : (
                <div className="empty">No products found. Try creating one or refresh.</div>
              )
            )}
          </div>
        </div>
      )}
      {tab === 'settings' && (
        <div className="page"><Settings /></div>
      )}

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
