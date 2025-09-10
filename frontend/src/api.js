const API = 'http://localhost:8000'

function authHeaders() {
  try {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch (_e) {
    return {}
  }
}

export async function signup({ username, password }) {
  const res = await fetch(`${API}/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) })
  const body = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, body }
}

export async function login({ username, password }) {
  const res = await fetch(`${API}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) })
  const body = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, body }
}

export async function getProducts(q) {
  // If q is a numeric id, call the single-item endpoint
  if (q && /^\d+$/.test(String(q).trim())) {
    const id = Number(q.trim())
    const res = await fetch(`${API}/products/${id}`)
    if (res.status === 404) return []
    if (!res.ok) throw new Error('Failed to fetch product')
    const single = await res.json()
    return Array.isArray(single) ? single : [single]
  }

  const url = new URL(API + '/products')
  if (q) url.searchParams.set('q', q)
  const res = await fetch(url.toString(), { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error('Failed to fetch products')
  const body = await res.json()
  // backend sometimes returns { value: [...] } from lowdb wrapper
  if (body && typeof body === 'object' && Array.isArray(body.value)) return body.value
  return body
}

export async function getProduct(id) {
  const res = await fetch(`${API}/products/${id}`, { headers: { ...authHeaders() } })
  if (!res.ok) return null
  return res.json()
}

export async function createProduct(payload) {
  console.log('API create', payload)
  const res = await fetch(`${API}/products`, { method: 'POST', headers: { 'content-type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) })
  const body = await res.json().catch(() => null)
  console.log('API create response', res.status, body)
  if (!res.ok) throw new Error('Failed to create')
  return body
}

export async function updateProduct(id, payload) {
  console.log('API update', id, payload)
  const res = await fetch(`${API}/products/${id}`, { method: 'PUT', headers: { 'content-type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) })
  const body = await res.json().catch(() => null)
  console.log('API update response', res.status, body)
  if (!res.ok) throw new Error('Failed to update')
  return body
}

export async function deleteProduct(id) {
  const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { ...authHeaders() } })
  return res.status === 204
}
