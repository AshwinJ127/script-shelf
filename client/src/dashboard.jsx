import React from 'react'
import './dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Script Shelf</h1>
        <p>Your personal script collection and automation hub</p>
        <p>Built by shreyanshcoder</p>
      </header>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Scripts</h3>
          <div className="metric-value">47</div>
          <div className="metric-change positive">+5 this week</div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary">Create New Script</button>
            <button className="action-btn secondary">Browse Scripts</button>
            <button className="action-btn secondary">Run All Scripts</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard