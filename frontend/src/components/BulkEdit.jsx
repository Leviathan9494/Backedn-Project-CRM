import React, { useState } from 'react'

export default function BulkEdit({ selectedIds = [], onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('') // allow relative string like "+=10"
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const update = {}
    if (name.trim() !== '') update.name = name.trim()
    if (description.trim() !== '') update.description = description.trim()
    if (price.trim() !== '') {
      // allow numeric or relative string like "+=10" or "-=5"
      const p = price.trim()
      const relMatch = p.match(/^([+\-]=)\s*(\d+(?:\.\d+)?)$/)
      if (relMatch) {
        update.price = `${relMatch[1]}${Number(relMatch[2])}`
      } else if (/^\d+(?:\.\d+)?$/.test(p)) {
        // absolute number -> normalize
        update.price = Number(p)
      } else {
        setError('Price must be a number or relative change like "+=10"')
        return
      }
    }
    if (Object.keys(update).length === 0) {
      setError('Nothing to update')
      return
    }
    if (onSubmit) await onSubmit(selectedIds, update)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Bulk edit ({selectedIds.length} selected)</h3>
      {error && <div className="error">{error}</div>}
      <label>Name (leave empty to keep)</label>
      <input value={name} onChange={e => setName(e.target.value)} />
      <label>Description (leave empty to keep)</label>
      <input value={description} onChange={e => setDescription(e.target.value)} />
      <label>Price (number or relative: "+=10" or "-=5")</label>
      <input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 19.99 or +=5" />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Apply to selected</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
