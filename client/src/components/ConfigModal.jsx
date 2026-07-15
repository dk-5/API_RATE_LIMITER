import { useState } from 'react'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}

const modalStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  width: '400px',
  maxWidth: '90vw'
}

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  marginBottom: '1rem'
}

const btnStyle = (primary) => ({
  padding: '0.6rem 1.25rem',
  borderRadius: 'var(--radius-sm)',
  border: primary ? 'none' : '1px solid var(--border)',
  background: primary ? 'var(--accent)' : 'transparent',
  color: primary ? '#fff' : 'var(--text-secondary)',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer'
})

export default function ConfigModal({ keyData, onSave, onClose }) {
  const [rateLimit, setRateLimit] = useState(keyData.rateLimit || 10)
  const [windowSize, setWindowSize] = useState(keyData.windowSize || 60)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ rateLimit: Number(rateLimit), windowSize: Number(windowSize) })
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Configure Rate Limits</h3>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
            Max Requests per Window
          </label>
          <input
            type="number"
            value={rateLimit}
            onChange={e => setRateLimit(e.target.value)}
            min={1}
            style={inputStyle}
          />
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
            Window Size (seconds)
          </label>
          <input
            type="number"
            value={windowSize}
            onChange={e => setWindowSize(e.target.value)}
            min={1}
            max={3600}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={btnStyle(false)}>Cancel</button>
            <button type="submit" style={btnStyle(true)}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
