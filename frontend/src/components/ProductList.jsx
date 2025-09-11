import React, { useState, useMemo } from 'react'

export default function ProductList({ products = [], onEdit, onDelete, onSelectionChange }) {
  const [selectedId, setSelectedId] = useState(null)
  const [checked, setChecked] = useState(() => new Set())
  const [sortBy, setSortBy] = useState('id')
  const [sortDir, setSortDir] = useState('asc') // 'asc' or 'desc'

  // computed, stable sorted list for display
  const sorted = useMemo(() => {
    const arr = Array.isArray(products) ? products.slice() : []
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const A = a && a[sortBy]
      const B = b && b[sortBy]
      // numeric sort for id and price
      if (sortBy === 'id' || sortBy === 'price') {
        const na = Number(A ?? 0)
        const nb = Number(B ?? 0)
        return (na - nb) * dir
      }
      // string compare for name/description
      const sa = (A || '').toString().toLowerCase()
      const sb = (B || '').toString().toLowerCase()
      if (sa < sb) return -1 * dir
      if (sa > sb) return 1 * dir
      return 0
    })
    return arr
  }, [products, sortBy, sortDir])

  function headerClick(col) {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  // notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) onSelectionChange(Array.from(checked))
  }, [checked])

  return (
    <table className="products">
      <thead>
        <tr>
          <th style={{ width: 36 }}>
            <input
              type="checkbox"
              aria-label="select-all"
              checked={sorted.length > 0 && checked.size === sorted.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setChecked(new Set(sorted.map(s => s.id)))
                } else {
                  setChecked(new Set())
                }
              }}
            />
          </th>
          <th onClick={() => headerClick('id')} className={sortBy === 'id' ? `sorted ${sortDir}` : ''} role="button" tabIndex={0} title="Sort by ID">ID {sortBy === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
          <th onClick={() => headerClick('name')} className={sortBy === 'name' ? `sorted ${sortDir}` : ''} role="button" tabIndex={0} title="Sort by name">Name {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
          <th onClick={() => headerClick('description')} className={sortBy === 'description' ? `sorted ${sortDir}` : ''} role="button" tabIndex={0} title="Sort by description">Description {sortBy === 'description' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
          <th onClick={() => headerClick('price')} className={sortBy === 'price' ? `sorted ${sortDir}` : ''} role="button" tabIndex={0} title="Sort by price">Price {sortBy === 'price' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(p => {
          const isSelected = selectedId === p.id
          const isChecked = checked.has(p.id)
          return (
      <tr key={p.id} className={isSelected ? 'selected' : ''} onClick={() => setSelectedId(p.id)} tabIndex={0} aria-selected={isSelected}>
              <td style={{ width: 36 }}>
                <input type="checkbox" aria-label={`select-${p.id}`} checked={isChecked} onChange={(e) => { e.stopPropagation(); const next = new Set(checked); if (e.target.checked) next.add(p.id); else next.delete(p.id); setChecked(next); }} />
              </td>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.price}</td>
              <td>
        <button type="button" className="btn btn-edit" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(p) }}>
                  <svg className="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#333"/><path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#333"/></svg>
                  <span className="vis">Edit</span>
                </button>
                <button type="button" className="btn btn-delete" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(p.id) }}>
                  <svg className="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z" fill="#fff"/><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#fff"/></svg>
                  <span className="vis">Delete</span>
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
