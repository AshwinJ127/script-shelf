import { useState } from 'react'
import './App.css'
import Dashboard from './dashboard'

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
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Dashboard />
      </div>
    </div>
  )
}

export default App
