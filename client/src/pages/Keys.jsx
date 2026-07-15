import { useState, useEffect } from 'react'
import api from '../api/axios'
import ConfigModal from '../components/ConfigModal'

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
}

const thStyle = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--border)',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const tdStyle = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--border)',
  fontSize: '0.85rem'
}

const badgeStyle = (active) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontWeight: 600,
  background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
  color: active ? 'var(--success)' : 'var(--danger)'
})

const planBadge = (plan) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  background: plan === 'enterprise' ? 'rgba(245,158,11,0.15)' : plan === 'pro' ? 'rgba(99,102,241,0.15)' : 'rgba(107,114,128,0.15)',
  color: plan === 'enterprise' ? 'var(--warning)' : plan === 'pro' ? 'var(--accent)' : 'var(--text-muted)'
})

const btnStyle = (primary) => ({
  padding: '6px 14px',
  borderRadius: 'var(--radius-sm)',
  border: primary ? 'none' : '1px solid var(--border)',
  background: primary ? 'var(--accent)' : 'transparent',
  color: primary ? '#fff' : 'var(--text-secondary)',
  fontSize: '0.8rem',
  fontWeight: 500,
  cursor: 'pointer'
})

export default function Keys() {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [configKey, setConfigKey] = useState(null)
  const [error, setError] = useState('')

  const fetchKeys = async () => {
    try {
      const res = await api.get('/dashboard/keys')
      setKeys(res.data.keys)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchKeys() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/key', { apikey: newKey })
      setNewKey('')
      setShowCreate(false)
      fetchKeys()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create key')
    }
  }

  const handleConfigSave = async (config) => {
    try {
      await api.put(`/dashboard/keys/${configKey._id}/config`, config)
      setConfigKey(null)
      fetchKeys()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update config')
    }
  }

  const handleDelete = async (keyId) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return
    try {
      await api.delete(`/dashboard/keys/${keyId}`)
      fetchKeys()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete key')
    }
  }

  const maskedKey = (hashed) => {
    return hashed ? '••••••••••••••••' : 'Unknown'
  }

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>API Keys</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your API keys and rate limits</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={btnStyle(true)}>
          {showCreate ? 'Cancel' : '+ New Key'}
        </button>
      </div>

      {showCreate && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Create API Key</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Enter your API key string"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              required
              style={{
                flex: 1,
                padding: '0.6rem 0.75rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            />
            <button type="submit" style={btnStyle(true)}>Create</button>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Key ID</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Rate Limit</th>
              <th style={thStyle}>Window</th>
              <th style={thStyle}>Total Requests</th>
              <th style={thStyle}>Today</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No API keys yet. Create one above.</td></tr>
            ) : keys.map(key => (
              <tr key={key._id}>
                <td style={tdStyle}><code style={{ fontSize: '0.8rem' }}>{key._id.slice(0, 12)}...</code></td>
                <td style={tdStyle}><span style={planBadge(key.plan)}>{key.plan}</span></td>
                <td style={tdStyle}>{key.rateLimit}/req</td>
                <td style={tdStyle}>{key.windowSize}s</td>
                <td style={tdStyle}>{key.totalRequests.toLocaleString()}</td>
                <td style={tdStyle}>{key.todayRequests}</td>
                <td style={tdStyle}><span style={badgeStyle(key.isActive)}>{key.isActive ? 'Active' : 'Inactive'}</span></td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setConfigKey(key)} style={btnStyle(false)}>Configure</button>
                    <button onClick={() => handleDelete(key._id)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {configKey && (
        <ConfigModal
          keyData={configKey}
          onSave={handleConfigSave}
          onClose={() => setConfigKey(null)}
        />
      )}
    </div>
  )
}
