// client/src/pages/Dashboard.jsx

import React from 'react';

function Dashboard() {
  return (
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
  );
}

export default Dashboard;