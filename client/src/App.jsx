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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <MainLayout onLogout={handleLogout} />;
  }

  return (
    <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />
  );
}

export default App;