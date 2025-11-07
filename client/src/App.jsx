import { useState } from 'react';
import './App.css';
import MainLayout from './components/MainLayout';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
  };

  return <MainLayout onLogout={handleLogout} />;
}

export default App;
