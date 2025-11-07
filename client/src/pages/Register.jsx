import { useState } from 'react';
import axios from 'axios';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

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
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '2.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          minWidth: '350px',
          maxWidth: '400px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ textAlign: 'center', color: '#333', margin: '0 0 1.5rem 0' }}>
          Create Your Account
        </h2>
        
        <label htmlFor="email" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '12px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            width: '100%',
          }}
        />

        <label htmlFor="password" style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
          style={{
            padding: '12px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            width: '100%',
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: '2rem',
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#6a5acd',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Create Account
        </button>

        {message && (
          <p style={messageStyle}>{message}</p>
        )}

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
          Already have an account?{' '}
          <span 
            onClick={onSwitchToLogin} 
            style={{ color: '#6a5acd', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
