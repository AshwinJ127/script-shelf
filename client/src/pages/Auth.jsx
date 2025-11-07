// client/src/pages/AuthPage.jsx

import { useState } from 'react';
import Login from './Login';
import Register from './Register';

function AuthPage({ onLoginSuccess }) {
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
        onRegisterSuccess={() => setShowLogin(true)} 
        onSwitchToLogin={() => setShowLogin(true)} 
      />
    );
  }
}

export default AuthPage;

