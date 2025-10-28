import './App.css'

function Sidebar() {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'scripts', label: 'Scripts', icon: '📜' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help', icon: '❓' }
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Script Shelf</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <a href="#" className="nav-item">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function App() {
  // Removed the unused useState hook

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <header className="main-header">
          <h1>Dashboard</h1>
        </header>
        <div className="dashboard-content">
          <div className="card">
            <h3>Welcome to Script Shelf</h3>
            <p>Your personal script management dashboard</p>
            {/* Removed the placeholder counter button */}
          </div>
          <div className="card">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">Total Scripts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">3</span>
                <span className="stat-label">Recent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App