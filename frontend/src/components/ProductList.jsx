import React, { useState } from 'react'

export default function ProductList({ products = [], onEdit, onDelete }) {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <table className="products">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {products.map(p => {
          const isSelected = selectedId === p.id
          return (
            <tr key={p.id} className={isSelected ? 'selected' : ''} onClick={() => setSelectedId(p.id)} tabIndex={0} aria-selected={isSelected}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.price}</td>
              <td>
                <button className="btn btn-edit" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(p) }}>
                  <svg className="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#333"/><path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#333"/></svg>
                  <span className="vis">Edit</span>
                </button>
                <button className="btn btn-delete" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(p.id) }}>
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
