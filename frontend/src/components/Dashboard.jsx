import React, { useEffect, useState } from 'react'
import { getProducts } from '../api'

export default function Dashboard() {
  const [count, setCount] = useState(0)
  const [expensive, setExpensive] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const items = await getProducts()
        setCount(Array.isArray(items) ? items.length : 0)
        if (items && items.length) {
          const max = items.reduce((a, b) => (a.price > b.price ? a : b), items[0])
          setExpensive(max)
        }
      } catch (_e) {
        setCount(0)
      }
    })()
  }, [])

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="cards">
        <div className="card">
          <div className="card-title">Total products</div>
          <div className="card-value">{count}</div>
        </div>
        <div className="card">
          <div className="card-title">Most expensive</div>
          <div className="card-value">{expensive ? `${expensive.name} — $${expensive.price}` : '—'}</div>
        </div>
      </div>
    </div>
  )
}
