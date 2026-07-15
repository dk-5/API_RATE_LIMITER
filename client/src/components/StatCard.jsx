const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.25rem',
  minWidth: '180px'
}

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem'
}

const valueStyle = (color) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: color || 'var(--text-primary)',
  lineHeight: 1.2
})

const subStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginTop: '0.25rem'
}

export default function StatCard({ label, value, sub, color }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle(color)}>{value}</div>
      {sub && <div style={subStyle}>{sub}</div>}
    </div>
  )
}
