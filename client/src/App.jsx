// client/src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';
import AuthPage from './pages/Auth';
import MainLayout from './components/MainLayout'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated) {
    return <MainLayout />;
  }

  return (
    <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />
  );
}

export default App;