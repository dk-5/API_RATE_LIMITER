import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.5rem',
  marginBottom: '1.5rem'
}

const planCard = (selected) => ({
  background: selected ? 'rgba(99,102,241,0.08)' : 'var(--bg-primary)',
  border: selected ? '2px solid var(--accent)' : '2px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.5rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
  flex: 1,
  minWidth: '200px'
})

const planConfigs = {
  free: { rateLimit: 10, windowSize: 60, price: '$0/mo', features: ['10 requests/min', '1 API key', 'Basic analytics'] },
  pro: { rateLimit: 100, windowSize: 60, price: '$19/mo', features: ['100 requests/min', '5 API keys', 'Advanced analytics', 'Custom rate limits'] },
  enterprise: { rateLimit: 1000, windowSize: 60, price: '$99/mo', features: ['1000 requests/min', 'Unlimited keys', 'Full analytics', 'Custom limits', 'Priority support'] }
}

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'free')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpgrade = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await api.put('/dashboard/plan', { plan: selectedPlan })
      updateUser({ plan: selectedPlan })
      setMessage(res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your account and plan</p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Account</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Email</label>
            <div style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>{user?.email}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Current Plan</label>
            <div style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600 }}>{user?.plan}</div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Plan & Billing</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {Object.entries(planConfigs).map(([key, config]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              style={planCard(selectedPlan === key)}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{key}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{config.price}</div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {config.features.map((f, i) => (
                  <li key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '2px 0' }}>✓ {f}</li>
                ))}
              </ul>
              {user?.plan === key && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--success)' }}>Current Plan</div>
              )}
            </div>
          ))}
        </div>

        {message && (
          <div style={{
            background: message.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            border: message.includes('Failed') ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.3)',
            color: message.includes('Failed') ? 'var(--danger)' : 'var(--success)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>{message}</div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading || selectedPlan === user?.plan}
          style={{
            padding: '0.7rem 2rem',
            background: selectedPlan !== user?.plan ? 'var(--accent)' : 'var(--bg-hover)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: selectedPlan !== user?.plan ? '#fff' : 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: selectedPlan !== user?.plan ? 'pointer' : 'default'
          }}
        >
          {loading ? 'Updating...' : selectedPlan === user?.plan ? 'Current Plan' : `Switch to ${selectedPlan}`}
        </button>
      </div>
    </div>
  )
}
