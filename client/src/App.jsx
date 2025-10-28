// client/src/App.jsx

import { useState, useEffect } from 'react';
import './App.css'; // Your global styles
import AuthPage from './pages/Auth'; // <-- Import the new AuthPage
import MainLayout from './components/MainLayout'; // <-- Import your main app layout

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  // This effect checks for a token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // In a real app, you'd also verify this token with your backend here
    }
  }, []);

  if (isAuthenticated) {
    // If they are logged in, show the main app
    return <MainLayout />;
  }

  // If not logged in, show the AuthPage.
  // We pass it the function to update our state when login is successful.
  return (
    <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />
  );
}

export default App;