import { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Scripts from '../pages/Scripts';

const Settings = () => <div className="card"><h1>Settings</h1><p>User settings will go here.</p></div>;
const Help = () => <div className="card"><h1>Help & Support</h1><p>Help documentation will go here.</p></div>;

function ActivePage({ activeItem, setActiveItem }) {
  switch (activeItem) {
    case 'scripts':
      return <Scripts />;
    case 'settings':
      return <Settings />;
    case 'help':
      return <Help />;
    case 'dashboard':
    default:
      return <Dashboard navigateTo={setActiveItem} />;
  }
}

function MainLayout({ onLogout }) {
  const [activeItem, setActiveItem] = useState('dashboard');

  const getActivePageLabel = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'scripts', label: 'Scripts' },
      { id: 'settings', label: 'Settings' },
      { id: 'help', label: 'Help' }
    ];
    return menuItems.find(item => item.id === activeItem)?.label || 'Dashboard';
  };

  return (
    <div
      className="app-layout"
      style={{ display: 'flex', height: '100vh', width: '100vw' }}
    >
      {/* Pass the onLogout prop down to the Sidebar */}
      <Sidebar 
        activeItem={activeItem} 
        setActiveItem={setActiveItem} 
        onLogout={onLogout} 
      />

      <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
        <header className="main-header">
          <h1>{getActivePageLabel()}</h1>
        </header>
        <ActivePage activeItem={activeItem} setActiveItem={setActiveItem} />
      </div>
    </div>
  );
}

export default MainLayout;
