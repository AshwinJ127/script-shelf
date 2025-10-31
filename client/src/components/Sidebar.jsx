import React from 'react';

function Sidebar({ activeItem, setActiveItem, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'scripts', label: 'Scripts', icon: '📜' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help', icon: '❓' }
  ];
  
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
      
      {/* Add the logout button at the bottom */}
      <div className="sidebar-footer">
        <a href="#" onClick={onLogout} className="nav-item">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </a>
      </div>
    </div>
  );
}

export default Sidebar;