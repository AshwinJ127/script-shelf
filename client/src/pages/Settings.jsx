import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const apiUrl = import.meta.env.VITE_API_URL;

function Settings({ theme, onThemeChange }) {
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
      await axios.put(
        `${apiUrl}/api/users/profile`,
        { email },
        getAuthHeaders()
      );
      setProfileMessage('Profile updated successfully!');
      setShowProfileForm(false);
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
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
      await axios.put(
        `${apiUrl}/api/users/password`,
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

    </div>
  );
}

export default Settings;