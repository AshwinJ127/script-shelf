// client/src/pages/Register.jsx

import { useState } from 'react';
import axios from 'axios';

// The Register component is now in its own file
function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/users/register`, {
        email,
        password,
      });

      console.log('Registration successful:', response.data);
      setMessage(`Success! Account created for ${response.data.email}.`);
      setEmail('');
      setPassword('');

    } catch (err) {
      console.error('Registration error:', err.response.data);
      setMessage(`Error: ${err.response.data.msg || 'Registration failed'}`);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f4f7f6',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <h2>Create Your Account</h2>
        <label htmlFor="email" style={{ marginTop: '1rem' }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.5rem', marginTop: '0.25rem' }}
        />

        <label htmlFor="password" style={{ marginTop: '1rem' }}>
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
          style={{ padding: '0.5rem', marginTop: '0.25rem' }}
        />

        <button
          type="submit"
          style={{ marginTop: '1.5rem', padding: '0.75rem', cursor: 'pointer' }}
        >
          Create Account
        </button>

        {message && (
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>{message}</p>
        )}
      </form>
    </div>
  );
}

export default Register;