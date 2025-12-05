import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/' },
    { id: 'scripts', label: 'Scripts', path: '/scripts' },
    { id: 'settings', label: 'Settings', path: '/settings' },
    { id: 'help', label: 'Help', path: '/help' }
  ];
  
  return (
    <div className="sidebar top-nav"> 
      <div className="sidebar-left">
        <h2>Script Shelf</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-right">
        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="nav-item">
          <span className="nav-label">Logout</span>
        </a>
      </div>
    </div>
  );
}

export default Sidebar;