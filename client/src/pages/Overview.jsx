import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/axios'
import StatCard from '../components/StatCard'

const headerStyle = {
  marginBottom: '2rem'
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '2rem'
}

const chartCardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.5rem',
  marginBottom: '1.5rem'
}

const COLORS = ['#22c55e', '#ef4444']

export default function Overview() {
  const [overview, setOverview] = useState(null)
  const [usage, setUsage] = useState([])
  const [period, setPeriod] = useState('24h')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, usageRes] = await Promise.all([
          api.get('/dashboard/overview'),
          api.get(`/dashboard/usage?period=${period}`)
        ])
        setOverview(ovRes.data)
        setUsage(usageRes.data.usage || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period])

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading...</div>
  if (!overview) return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Failed to load overview</div>

  const pieData = [
    { name: 'Allowed', value: overview.allowedToday || 0 },
    { name: 'Blocked', value: overview.blockedToday || 0 }
  ]

  const chartData = usage.map(u => ({
    time: u._id?.split('T')?.[1] || u._id,
    total: u.total,
    allowed: u.allowed,
    blocked: u.blocked
  }))

  return (
    <div>
      <div style={headerStyle}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your API at a glance</p>
      </div>

      <div style={gridStyle}>
        <StatCard label="Requests Today" value={overview.totalToday} />
        <StatCard label="Allowed" value={overview.allowedToday} color="var(--success)" />
        <StatCard label="Blocked" value={overview.blockedToday} color="var(--danger)" />
        <StatCard label="Active Keys" value={overview.activeKeys} sub={`${overview.totalKeys} total`} />
        <StatCard label="Lifetime Requests" value={overview.totalLifetime.toLocaleString()} />
        <StatCard label="Unique Endpoints" value={overview.uniqueEndpoints} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={chartCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Request Traffic</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['24h', '7d', '30d'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: period === p ? 'var(--accent)' : 'var(--bg-hover)',
                    color: period === p ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} />
              <Line type="monotone" dataKey="allowed" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCardStyle}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Today's Split</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem' }}>
            <span><span style={{ color: '#22c55e', marginRight: 6 }}>●</span>Allowed</span>
            <span><span style={{ color: '#ef4444', marginRight: 6 }}>●</span>Blocked</span>
          </div>
        </div>
      </div>
    </div>
  )
}
