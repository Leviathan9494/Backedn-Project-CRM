import React, { useState } from 'react'
import { login } from '../api'

export default function Login({ onSuccess, onCancel }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await login({ username, password })
    setLoading(false)
    if (!res.ok) {
      setError(res.body?.error || 'invalid credentials')
      return
    }
    try { localStorage.setItem('token', res.body.token) } catch (_e) {}
    if (onSuccess) onSuccess(res.body)
  }

  return (
    <form className="form" onSubmit={submit}>
      <h3>Login</h3>
      {error && <div className="error">{error}</div>}
      <label>Username</label>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <label>Password</label>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Login</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
