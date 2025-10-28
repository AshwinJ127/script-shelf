import { useState } from 'react'
import './App.css'

function Sidebar({ activeItem, setActiveItem }) {
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
              <a
                href="#"
                onClick={() => setActiveItem(item.id)}
                className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              >
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
  const [activeItem, setActiveItem] = useState('dashboard')

  const getActivePageLabel = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard' },
      { ids: 'scripts', label: 'Scripts' },
      { id: 'settings', label: 'Settings' },
      { id: 'help', label: 'Help' }
    ]
    return menuItems.find(item => item.id === activeItem)?.label || 'Dashboard'
  }

  return (
    // 1. Added width: '100vw' to fill the viewport width
    <div
      className="app-layout"
      style={{ display: 'flex', height: '100vh', width: '100vw' }}
    >
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
        <header className="main-header">
          <h1>{getActivePageLabel()}</h1>
        </header>
        <div className="dashboard-content">
          <div className="card">
            <h3>Welcome to Script Shelf</h3>
            <p>Your personal script management dashboard</p>
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