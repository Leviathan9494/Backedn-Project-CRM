import React, { useEffect, useState, useRef } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from './api'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import headerImg from './components/Generated image 1.png'
import colorRef from './components/Generated image 1.png'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('products')
  const [animKey, setAnimKey] = useState(0)
  const [theme, setTheme] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('theme') || 'light') : 'light')

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

  // live search: debounce user typing
  const firstSearchRef = useRef(true)
  useEffect(() => {
    // skip the initial run (we already loaded once on mount)
    if (firstSearchRef.current) {
      firstSearchRef.current = false
      return
    }

    const t = setTimeout(() => {
      setQuery(searchTerm)
      load(searchTerm)
    }, 300)

    return () => clearTimeout(t)
  }, [searchTerm])

  // trigger small animation when tab changes
  useEffect(() => {
    setAnimKey(k => k + 1)
  }, [tab])

  // apply theme to document and persist
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    } catch (e) {
      // ignore server env
    }
  }, [theme])

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
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')} title="Dashboard">
            <svg className="nav-icon" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            <span className="nav-label">Dashboard</span>
          </button>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')} title="Products">
            <svg className="nav-icon" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zm0 7.3L4.2 7 12 4.7 19.8 7 12 9.3zM2 17l10 5 10-5V9l-10 5L2 9v8z"/></svg>
            <span className="nav-label">Products</span>
          </button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')} title="Settings">
            <svg className="nav-icon" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19.14 12.936a7.952 7.952 0 0 0 0-1.872l2.036-1.58a.5.5 0 0 0 .12-.64l-1.928-3.34a.5.5 0 0 0-.585-.22l-2.4.96a8.06 8.06 0 0 0-1.62-.94l-.36-2.52A.5.5 0 0 0 14 1h-4a.5.5 0 0 0-.497.424l-.36 2.52a8.06 8.06 0 0 0-1.62.94l-2.4-.96a.5.5 0 0 0-.585.22L1.7 8.844a.5.5 0 0 0 .12.64l2.036 1.58a7.952 7.952 0 0 0 0 1.872L1.82 14.516a.5.5 0 0 0-.12.64l1.928 3.34a.5.5 0 0 0 .585.22l2.4-.96c.5.38 1.04.7 1.62.94l.36 2.52A.5.5 0 0 0 10 23h4a.5.5 0 0 0 .497-.424l.36-2.52c.58-.24 1.12-.56 1.62-.94l2.4.96a.5.5 0 0 0 .585-.22l1.928-3.34a.5.5 0 0 0-.12-.64l-2.036-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/></svg>
            <span className="nav-label">Settings</span>
          </button>
        </nav>
        <div className="header-right">
          <p>Backend: <a href={`${API_URL}/swagger`} target="_blank">Swagger UI</a></p>
          <button className="btn" title="Toggle theme" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? (
              <svg className="icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zM20.24 4.84l1.79-1.79-1.79-1.79-1.8 1.79 1.8 1.79zM17 13a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"/></svg>
            ) : (
              <svg className="icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <img src={colorRef} alt="color ref" className="color-ref" />
        </div>
      </header>

      <div className="topbar">
        <input placeholder="Search products" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <button className="btn btn-primary" onClick={() => { setQuery(searchTerm); load(searchTerm) }}>
          <svg className="icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>
          <span>Search</span>
        </button>
        <button className="btn" onClick={() => { setSearchTerm(''); setQuery(''); load('') }}>
          <svg className="icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 6l12 12M6 18L18 6"/></svg>
          <span>Clear</span>
        </button>
        <button className="btn" onClick={() => load()}>
          <svg className="icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17.65 6.35A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.95-4.24L13 10h7V3l-2.35 3.35z"/></svg>
          <span>Refresh</span>
        </button>
      </div>

      {tab === 'dashboard' && (
        <div className={`page ${'enter'}`} key={`page-${animKey}`}><Dashboard /></div>
      )}
      {tab === 'products' && (
        <div className={`layout ${'enter'}`} key={`layout-${animKey}`}>
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
