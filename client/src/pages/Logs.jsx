import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
}

const thStyle = {
  textAlign: 'left',
  padding: '0.65rem 1rem',
  borderBottom: '1px solid var(--border)',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const tdStyle = {
  padding: '0.65rem 1rem',
  borderBottom: '1px solid var(--border)',
  fontSize: '0.8rem'
}

const statusBadge = (allowed) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontWeight: 600,
  background: allowed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
  color: allowed ? 'var(--success)' : 'var(--danger)'
})

const filterBtn = (active) => ({
  padding: '5px 12px',
  borderRadius: '6px',
  border: 'none',
  background: active ? 'var(--accent)' : 'var(--bg-hover)',
  color: active ? '#fff' : 'var(--text-secondary)',
  fontSize: '0.75rem',
  fontWeight: 500,
  cursor: 'pointer'
})

const pageBtn = (active) => ({
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: active ? 'var(--accent)' : 'transparent',
  color: active ? '#fff' : 'var(--text-secondary)',
  fontSize: '0.8rem',
  cursor: 'pointer'
})

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const params = { page, limit: 30 }
      if (status) params.status = status
      const res = await api.get('/dashboard/logs', { params })
      setLogs(res.data.logs)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchLogs])

  const formatTime = (d) => {
    const date = new Date(d)
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Request Logs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{pagination.total} total requests</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => setAutoRefresh(!autoRefresh)} style={filterBtn(autoRefresh)}>
            {autoRefresh ? '● Live' : '○ Live'}
          </button>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button onClick={() => { setStatus(''); setPage(1) }} style={filterBtn(!status)}>All</button>
            <button onClick={() => { setStatus('allowed'); setPage(1) }} style={filterBtn(status === 'allowed')}>Allowed</button>
            <button onClick={() => { setStatus('blocked'); setPage(1) }} style={filterBtn(status === 'blocked')}>Blocked</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading...</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Method</th>
                <th style={thStyle}>Endpoint</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Allowed</th>
                <th style={thStyle}>Response</th>
                <th style={thStyle}>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No logs found</td></tr>
              ) : logs.map(log => (
                <tr key={log._id}>
                  <td style={tdStyle}>{formatTime(log.createdAt)}</td>
                  <td style={tdStyle}><code style={{ fontSize: '0.75rem' }}>{log.method}</code></td>
                  <td style={tdStyle}>{log.endpoint}</td>
                  <td style={tdStyle}>{log.statusCode}</td>
                  <td style={tdStyle}><span style={statusBadge(log.allowed)}>{log.allowed ? 'Allowed' : 'Blocked'}</span></td>
                  <td style={tdStyle}>{log.responseTime}ms</td>
                  <td style={tdStyle}><code style={{ fontSize: '0.75rem' }}>{log.ipAddress}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={pageBtn(p === page)}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
