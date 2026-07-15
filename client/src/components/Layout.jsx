import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Overview', icon: '◈' },
  { to: '/keys', label: 'API Keys', icon: '⚿' },
  { to: '/logs', label: 'Logs', icon: '☰' },
  { to: '/analytics', label: 'Analytics', icon: '◇' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

const layoutStyle = {
  display: 'flex',
  minHeight: '100vh'
}

const sidebarStyle = {
  width: '240px',
  background: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border)',
  padding: '1.5rem 0',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  height: '100vh',
  overflowY: 'auto'
}

const logoStyle = {
  padding: '0 1.5rem',
  marginBottom: '2rem',
  fontSize: '1.1rem',
  fontWeight: 700,
  color: 'var(--accent)',
  letterSpacing: '-0.02em'
}

const navLinkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.65rem 1.5rem',
  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
  background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
  borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.15s',
  textDecoration: 'none'
})

const contentStyle = {
  flex: 1,
  marginLeft: '240px',
  padding: '2rem',
  minHeight: '100vh'
}

const userSectionStyle = {
  marginTop: 'auto',
  padding: '1rem 1.5rem',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem'
}

const badgeStyle = (plan) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  background: plan === 'enterprise' ? 'rgba(245,158,11,0.15)' : plan === 'pro' ? 'rgba(99,102,241,0.15)' : 'rgba(107,114,128,0.15)',
  color: plan === 'enterprise' ? 'var(--warning)' : plan === 'pro' ? 'var(--accent)' : 'var(--text-muted)'
})

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <div style={logoStyle}>⚡ RateLimiter</div>
        <nav>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} style={navLinkStyle}>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={userSectionStyle}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            <span style={badgeStyle(user?.plan)}>{user?.plan || 'free'}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem'
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main style={contentStyle}>
        <Outlet />
      </main>
    </div>
  )
}
