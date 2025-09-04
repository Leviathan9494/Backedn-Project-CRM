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
        <button type="submit" className="btn btn-primary">
          <svg className="icon" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M5 13l4 4L19 7"/></svg>
          <span>Save</span>
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            <svg className="icon" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M18 6L6 18M6 6l12 12"/></svg>
            <span>Cancel</span>
          </button>
        )}
      </div>
    </form>
  )
}
