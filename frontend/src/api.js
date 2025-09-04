const API = 'http://localhost:8000'

export async function getProducts(q) {
  const url = new URL(API + '/products')
  if (q) url.searchParams.set('q', q)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function getProduct(id) {
  const res = await fetch(`${API}/products/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function createProduct(payload) {
  const res = await fetch(`${API}/products`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Failed to create')
  return res.json()
}

export async function updateProduct(id, payload) {
  const res = await fetch(`${API}/products/${id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Failed to update')
  return res.json()
}

export async function deleteProduct(id) {
  const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' })
  return res.status === 204
}
