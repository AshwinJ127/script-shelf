import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Scripts from '../pages/Scripts';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const Settings = ({ theme, onThemeChange }) => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/users/profile`, getAuthHeaders());
      setEmail(res.data.email);
    } catch (err) {
      console.error('Error fetching profile:', err);
      console.error('Error response:', err.response?.data);
      // Set a default message if fetch fails
      if (err.response?.status === 401) {
        setProfileMessage('Authentication failed. Please log out and log back in.');
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    setProfileMessage('');

    try {
      const res = await axios.put(
        `${apiUrl}/api/users/profile`,
        { email },
        getAuthHeaders()
      );
      setProfileMessage('Profile updated successfully!');
      setShowProfileForm(false);
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Failed to update profile';
      setProfileMessage(errorMsg);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoadingPassword(true);
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match');
      setIsLoadingPassword(false);
      return;
    }

    try {
      const url = `${apiUrl}/api/users/password`;
      console.log('Updating password at URL:', url);
      console.log('API URL:', apiUrl);
      console.log('Auth token present:', !!localStorage.getItem('authToken'));
      
      await axios.put(
        url,
        { currentPassword, newPassword },
        getAuthHeaders()
      );
      setPasswordMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      console.error('Update password error:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error URL:', err.config?.url);
      const errorMsg = err.response?.data?.msg || err.message || 'Failed to update password';
      setPasswordMessage(errorMsg);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
  <div className="dashboard-content">
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Account Preferences</h2>
      <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
        Manage how ScriptShelf behaves for your account.
      </p>
        
        {/* Update Profile Section */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Update Profile</h3>
          {!showProfileForm ? (
            <button 
              onClick={() => setShowProfileForm(true)}
              style={{ 
                padding: '0.75rem 1.5rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Update Profile
            </button>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#111827' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {profileMessage && (
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  backgroundColor: profileMessage.includes('success') ? '#d4edda' : '#f8d7da',
                  color: profileMessage.includes('success') ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  {profileMessage}
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={isLoadingProfile}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoadingProfile ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    opacity: isLoadingProfile ? 0.6 : 1
                  }}
                >
                  {isLoadingProfile ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileForm(false);
                    setProfileMessage('');
                    fetchProfile();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e2e8f0',
                    color: '#4a5568',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Section */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Change Password</h3>
          {!showPasswordForm ? (
            <button 
              onClick={() => setShowPasswordForm(true)}
              style={{ 
                padding: '0.75rem 1.5rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#111827' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#111827' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#111827' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {passwordMessage && (
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  backgroundColor: passwordMessage.includes('success') ? '#d4edda' : '#f8d7da',
                  color: passwordMessage.includes('success') ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  {passwordMessage}
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={isLoadingPassword}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoadingPassword ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    opacity: isLoadingPassword ? 0.6 : 1
                  }}
                >
                  {isLoadingPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordMessage('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e2e8f0',
                    color: '#4a5568',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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
            type="button"
            onClick={() => onThemeChange('light')}
            style={{
              flex: 1,
              backgroundColor: theme === 'light' ? '#667eea' : 'var(--bg-secondary)',
              color: theme === 'light' ? '#ffffff' : 'var(--text-secondary)',
              border: theme === 'light' ? 'none' : '1px solid var(--border-color)',
              boxShadow: theme === 'light' ? '0 10px 25px rgba(94, 109, 255, 0.25)' : 'none'
            }}
          >
            Light Theme
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            style={{
              flex: 1,
              backgroundColor: theme === 'dark' ? '#1f2937' : 'var(--bg-secondary)',
              color: theme === 'dark' ? '#f9fafb' : 'var(--text-secondary)',
              border: theme === 'dark' ? 'none' : '1px solid var(--border-color)',
              boxShadow: theme === 'dark' ? '0 10px 30px rgba(15,23,42,0.6)' : 'none'
            }}
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
};

const Help = () => <div className="card"><h1>Help & Support</h1><p>Help documentation will go here.</p></div>;

function ActivePage({ activeItem, setActiveItem, languageFilter, navigateToScriptsWithLanguage, selectedSnippetId, navigateToSnippet, theme, onThemeChange }) {
  switch (activeItem) {
    case 'scripts':
      return <Scripts languageFilter={languageFilter} selectedSnippetId={selectedSnippetId} />;
    case 'settings':
      return <Settings theme={theme} onThemeChange={onThemeChange} />;
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
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Persist theme
    localStorage.setItem('theme', theme);

    // Apply theme class to body for global background + variables
    if (typeof document !== 'undefined') {
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${theme}-theme`);
    }
  }, [theme]);

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
      className={`app-layout ${theme}-theme`}
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
          onThemeChange={setTheme}
        />
      </div>
    </div>
  );
}

export default MainLayout;