import { useState } from 'react';
import axios from 'axios';
import RegistrationBanner from '../components/RegistrationBanner';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/api/users/register`, {
        email,
        password,
      });

      console.log('Registration successful:', response.data);
      setMessage(`Success! Account created for ${response.data.email}.`);
      setEmail('');
      setPassword('');
      
      setTimeout(() => {
        if(onRegisterSuccess) {
          onRegisterSuccess();
        }
      }, 1500);

    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setMessage(`Error: ${err.response?.data?.msg || 'Registration failed'}`);
    }
  };

  const messageStyle = {
    marginTop: '1rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: message.startsWith('Error') ? '#d93025' : '#1a73e8',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f0f2f5',
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        padding: '2rem',
        gap: '1.5rem',
      }}
    >
      <RegistrationBanner />
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '2.1rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          minWidth: '300px',
          maxWidth: '340px',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          gap: '0.75rem',
        }}
      >
        <h2 style={{ textAlign: 'center', color: '#333', margin: '0 0 1.25rem 0', fontWeight: 600, letterSpacing: '-0.01em' }}>
          Create Your Account
        </h2>
        
        <label htmlFor="email" style={{ marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 500, color: '#4a5460', letterSpacing: '-0.005em' }}>
          Email
        </label>
        <input
          type="email"
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '12px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxSizing: 'border-box',
            width: '100%',
            fontFamily: 'inherit',
          }}
        />

        <label htmlFor="password" style={{ marginTop: '0.75rem', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 500, color: '#4a5460', letterSpacing: '-0.005em' }}>
          Password
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            style={{
              padding: '12px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxSizing: 'border-box',
              width: '100%',
              fontFamily: 'inherit',
              paddingRight: '44px',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              padding: 0,
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button
          type="submit"
          style={{
            marginTop: '2rem',
            padding: '12px',
            border: 'none',
            borderRadius: '999px',
            backgroundColor: '#6a5acd',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          Create Account
        </button>

        {message && (
          <p style={messageStyle}>{message}</p>
        )}

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#4a5460', fontWeight: 400 }}>
          Already have an account?{' '}
          <span 
            onClick={onSwitchToLogin} 
            style={{ color: '#6a5acd', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.005em' }}
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
}
export default Register;
