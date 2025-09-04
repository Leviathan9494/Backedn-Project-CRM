import React from 'react'

export default function ProductList({ products = [], onEdit, onDelete }) {
  return (
    <table className="products">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.name}</td>
            <td>{p.description}</td>
            <td>{p.price}</td>
            <td>
              <button className="btn btn-edit" title="Edit" onClick={() => onEdit && onEdit(p)}>Edit</button>
              <button className="btn btn-delete" title="Delete" onClick={() => onDelete && onDelete(p.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
