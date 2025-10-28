import { useState } from 'react'
import './App.css'

// 1. Sidebar now receives activeItem and setActiveItem as props
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
                onClick={() => setActiveItem(item.id)} // Uses the prop
                className={`nav-item ${activeItem === item.id ? 'active' : ''}`} // Uses the prop
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
  // 2. State is now managed in the parent App component
  const [activeItem, setActiveItem] = useState('dashboard')

  // Helper to get the label for the header
  const getActivePageLabel = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'scripts', label: 'Scripts' },
      { id: 'settings', label: 'Settings' },
      { id: 'help', label: 'Help' }
    ]
    return menuItems.find(item => item.id === activeItem)?.label || 'Dashboard'
  }

  return (
    <div className="app">
      {/* 3. Pass state and setter down to Sidebar */}
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="main-content">
        <header className="main-header">
          {/* 4. Header now dynamically updates based on state */}
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