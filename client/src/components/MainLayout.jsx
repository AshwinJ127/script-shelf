import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

function MainLayout({ onLogout, theme }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path.startsWith('/scripts')) return 'scripts';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/help')) return 'help';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  const handleSetActiveItem = (id) => {
    const path = id === 'dashboard' ? '/' : `/${id}`;
    navigate(path);
  };

  const getActivePageLabel = () => {
    const labels = {
      dashboard: 'Dashboard',
      scripts: 'Scripts',
      settings: 'Settings',
      help: 'Help'
    };
    return labels[activeItem] || 'Dashboard';
  };

  return (
    <div
      className={`app-layout ${theme}-theme`}
      style={{ display: 'flex', height: '100vh', width: '100vw' }}
    >
      <Sidebar 
        activeItem={activeItem} 
        setActiveItem={handleSetActiveItem} 
        onLogout={onLogout} 
      />

      <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
        <header className="main-header">
          <h1>{getActivePageLabel()}</h1>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;