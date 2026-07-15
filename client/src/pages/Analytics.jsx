import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import api from '../api/axios'

const chartCardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.5rem',
  marginBottom: '1.5rem'
}

const dayNames = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Analytics() {
  const [topEndpoints, setTopEndpoints] = useState([])
  const [heatmap, setHeatmap] = useState([])
  const [period, setPeriod] = useState('24h')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [epRes, hmRes] = await Promise.all([
          api.get(`/dashboard/top-endpoints?period=${period}`),
          api.get('/dashboard/heatmap')
        ])
        setTopEndpoints(epRes.data.endpoints || [])
        setHeatmap(hmRes.data.heatmap || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [period])

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading...</div>

  const barData = topEndpoints.map(ep => ({
    name: `${ep._id.method} ${ep._id.endpoint?.split('/').pop() || ep._id.endpoint}`,
    total: ep.total,
    allowed: ep.allowed,
    blocked: ep.blocked,
    avgTime: Math.round(ep.avgResponseTime || 0)
  }))

  const radarData = heatmap.map(h => ({
    day: dayNames[h._id.day] || h._id.day,
    hour: h._id.hour,
    requests: h.total
  }))

  const heatmapByDay = {}
  heatmap.forEach(h => {
    const day = dayNames[h._id.day]
    if (!heatmapByDay[day]) heatmapByDay[day] = 0
    heatmapByDay[day] += h.total
  })
  const radarDayData = Object.entries(heatmapByDay).map(([day, total]) => ({ day, requests: total }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Deep dive into your API usage</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['24h', '7d', '30d'].map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setLoading(true) }}
              style={{
                padding: '5px 14px',
                borderRadius: '6px',
                border: 'none',
                background: period === p ? 'var(--accent)' : 'var(--bg-hover)',
                color: period === p ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={chartCardStyle}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Top Endpoints</h3>
          {barData.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem', fontSize: '0.85rem' }}>No endpoint data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Bar dataKey="allowed" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="blocked" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={chartCardStyle}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Weekly Traffic Pattern</h3>
          {radarDayData.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem', fontSize: '0.85rem' }}>No heatmap data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarDayData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Radar name="Requests" dataKey="requests" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={chartCardStyle}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Endpoint Details</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Endpoint</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Method</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allowed</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blocked</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Response</th>
            </tr>
          </thead>
          <tbody>
            {topEndpoints.map((ep, i) => (
              <tr key={i}>
                <td style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>{ep._id.endpoint}</td>
                <td style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}><code>{ep._id.method}</code></td>
                <td style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>{ep.total}</td>
                <td style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--success)' }}>{ep.allowed}</td>
                <td style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--danger)' }}>{ep.blocked}</td>
                <td style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>{Math.round(ep.avgResponseTime || 0)}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
