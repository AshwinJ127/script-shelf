import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Scripts from '../pages/Scripts';

const Settings = ({ theme, setLightTheme, setDarkTheme }) => (
  <div className="dashboard-content">
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Account Preferences</h2>
      <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
        Manage how ScriptShelf behaves for your account.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button style={{ flex: '1 1 200px' }}>Update Profile</button>
        <button style={{ flex: '1 1 200px' }}>Change Password</button>
        <button style={{ flex: '1 1 200px' }}>Manage Devices</button>
      </div>
    </div>

    <div className="card">
      <h3>Snippet Management</h3>
      <p style={{ color: '#718096', marginBottom: '1rem' }}>Quick actions for your snippet library.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button>Export Snippets</button>
        <button>Import Snippets</button>
        <button>Clear Drafts</button>
      </div>
    </div>

    <div className="card">
      <h3>Appearance</h3>
      <p style={{ color: '#718096', marginBottom: '1rem' }}>Switch between layout or theme presets.</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          style={{ flex: 1 }} 
          onClick={setLightTheme}
        >
          Light Theme
        </button>
        <button 
          style={{ flex: 1 }} 
          onClick={setDarkTheme}
        >
          Dark Theme
        </button>
      </div>
    </div>

    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h3>Notifications</h3>
      <p style={{ color: '#718096', marginBottom: '1rem' }}>Choose events you want to be notified about.</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button style={{ flex: '1 1 200px' }}>Snippet Reminders</button>
        <button style={{ flex: '1 1 200px' }}>Shared Updates</button>
        <button style={{ flex: '1 1 200px' }}>Weekly Summary</button>
      </div>
    </div>
  </div>
);
const Help = () => <div className="card"><h1>Help & Support</h1><p>Help documentation will go here.</p></div>;

function ActivePage({ activeItem, setActiveItem, languageFilter, navigateToScriptsWithLanguage, selectedSnippetId, navigateToSnippet, theme, setLightTheme, setDarkTheme }) {
  switch (activeItem) {
    case 'scripts':
      return <Scripts languageFilter={languageFilter} selectedSnippetId={selectedSnippetId} theme={theme} />;
    case 'settings':
      return <Settings theme={theme} setLightTheme={setLightTheme} setDarkTheme={setDarkTheme} />;
    case 'help':
      return <Help />;
    case 'dashboard':
    default:
      return <Dashboard navigateTo={setActiveItem} navigateToScriptsWithLanguage={navigateToScriptsWithLanguage} navigateToSnippet={navigateToSnippet} />;
  }
}

function MainLayout({ onLogout }) {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [languageFilter, setLanguageFilter] = useState(null);
  const [selectedSnippetId, setSelectedSnippetId] = useState(null);
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || 'light';
    // Apply theme immediately to prevent flash
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
    return initialTheme;
  });

  // Apply theme to HTML element when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setLightTheme = () => {
    setTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
  };

  const getActivePageLabel = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'scripts', label: 'Scripts' },
      { id: 'settings', label: 'Settings' },
      { id: 'help', label: 'Help' }
    ];
    return menuItems.find(item => item.id === activeItem)?.label || 'Dashboard';
  };

  const handleNavigateToScriptsWithLanguage = (language) => {
    setLanguageFilter(language);
    setSelectedSnippetId(null);
    setActiveItem('scripts');
  };

  const handleNavigateToSnippet = (snippetId) => {
    setSelectedSnippetId(snippetId);
    setLanguageFilter(null);
    setActiveItem('scripts');
  };

  const handleSetActiveItem = (item) => {
    setActiveItem(item);
    // Clear filters when navigating away from scripts
    if (item !== 'scripts') {
      setLanguageFilter(null);
      setSelectedSnippetId(null);
    }
  };

  return (
    <div
      className="app-layout"
      style={{ display: 'flex', height: '100vh', width: '100vw' }}
    >
      {/* Pass the onLogout prop down to the Sidebar */}
      <Sidebar 
        activeItem={activeItem} 
        setActiveItem={handleSetActiveItem} 
        onLogout={onLogout} 
      />

      <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
        <header className="main-header">
          <h1>{getActivePageLabel()}</h1>
        </header>
        <ActivePage 
          activeItem={activeItem} 
          setActiveItem={handleSetActiveItem}
          languageFilter={languageFilter}
          navigateToScriptsWithLanguage={handleNavigateToScriptsWithLanguage}
          selectedSnippetId={selectedSnippetId}
          navigateToSnippet={handleNavigateToSnippet}
          theme={theme}
          setLightTheme={setLightTheme}
          setDarkTheme={setDarkTheme}
        />
      </div>
    </div>
  );
}

export default MainLayout;