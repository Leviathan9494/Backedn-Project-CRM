import React, { useState } from 'react'

export default function ProductForm({ initial = {}, onSubmit, onCancel }) {
  const [name, setName] = useState(initial.name || '')
  const [description, setDescription] = useState(initial.description || '')
  const [price, setPrice] = useState(initial.price || 0)

  function submit(e) {
    e.preventDefault()
    onSubmit({ name, description, price: Number(price) })
    setName('')
    setDescription('')
    setPrice(0)
  }

  return (
    <form onSubmit={submit} className="form">
      <label>Name</label>
      <input value={name} onChange={e => setName(e.target.value)} />

      <label>Description</label>
      <input value={description} onChange={e => setDescription(e.target.value)} />

      <label>Price</label>
      <input type="number" value={price} onChange={e => setPrice(e.target.value)} />

      <div className="form-actions">
        <button type="submit">Save</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
