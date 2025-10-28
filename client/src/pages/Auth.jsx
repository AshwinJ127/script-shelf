// client/src/pages/AuthPage.jsx

import { useState } from 'react';
import Login from './Login';
import Register from './Register';

// This component acts as a container for both Login and Register
// It receives the onLoginSuccess prop from App.jsx and passes it down to Login
function AuthPage({ onLoginSuccess }) {
  // We'll default to showing the login form
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return (
      <Login 
        onLoginSuccess={onLoginSuccess} 
        onSwitchToRegister={() => setShowLogin(false)} 
      />
    );
  } else {
    return (
      <Register 
        // After successful registration, switch the user back to the login form
        onRegisterSuccess={() => setShowLogin(true)} 
        onSwitchToLogin={() => setShowLogin(true)} 
      />
    );
  }
}

export default AuthPage;