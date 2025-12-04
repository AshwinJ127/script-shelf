import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/Auth'; 
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Scripts from './pages/Scripts';
import Settings from './pages/Settings'; 

const Help = () => (
  <div className="dashboard-content">
    <div className="card">
      <h3>Help & Support</h3>
      <p>Documentation coming soon.</p>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const navigate = useNavigate();

  const [languageFilter, setLanguageFilter] = useState(null);
  const [selectedSnippetId, setSelectedSnippetId] = useState(null);
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleNavigateToScriptsWithLanguage = (language) => {
    setLanguageFilter(language);
    setSelectedSnippetId(null);
    navigate('/scripts');
  };

  const handleNavigateToSnippet = (snippetId) => {
    setSelectedSnippetId(snippetId);
    setLanguageFilter(null);
    navigate('/scripts');
  };

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <Route element={<MainLayout onLogout={handleLogout} theme={theme} />}>
          
          <Route 
            path="/" 
            element={
              <Dashboard 
                navigateToScriptsWithLanguage={handleNavigateToScriptsWithLanguage}
                navigateToSnippet={handleNavigateToSnippet}
              />
            } 
          />
          
          <Route 
            path="/scripts" 
            element={
              <Scripts 
                languageFilter={languageFilter}
                selectedSnippetId={selectedSnippetId}
              />
            } 
          />
          
          <Route 
            path="/settings" 
            element={<Settings theme={theme} onThemeChange={setTheme} />} 
          />
          
          <Route path="/help" element={<Help />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;