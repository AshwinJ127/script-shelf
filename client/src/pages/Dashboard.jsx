// client/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const apiUrl = import.meta.env.VITE_API_URL || "https://script-shelf.onrender.com";

function Dashboard({ navigateTo }) {
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/snippets`, getAuthHeaders());
      setSnippets(res.data);
    } catch (err) {
      console.error('Error fetching snippets:', err);
    }
    setIsLoading(false);
  };

  const totalSnippets = snippets.length;

  const languageCounts = snippets.reduce((counts, snippet) => {
    const lang = snippet.language || 'text';
    counts[lang] = (counts[lang] || 0) + 1;
    return counts;
  }, {});

  const sortedLanguages = Object.entries(languageCounts).sort(([, countA], [, countB]) => countB - countA);

  // Get recent snippets (last 5)
  const recentSnippetsList = snippets
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-content" style={{ padding: '1rem' }}>
      
      {/* Total Snippets Count */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="stat-item" style={{ textAlign: 'center' }}>
          <span className="stat-number">
            {isLoading ? '...' : totalSnippets}
          </span>
          <span className="stat-label">Total Snippets</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigateTo('scripts')} style={{ flex: 1, padding: '10px 15px' }}>
            Create New Snippet
          </button>
          <button onClick={() => navigateTo('scripts')} style={{ flex: 1, padding: '10px 15px' }}>
            View All Scripts
          </button>
        </div>
      </div>

      {/* Recent Snippets */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Recent Snippets</h3>
          {snippets.length > 5 && (
            <button 
              onClick={() => navigateTo('scripts')}
              style={{ padding: '5px 10px', fontSize: '0.875rem' }}
            >
              View All →
            </button>
          )}
        </div>

        {snippets.length === 0 ? (
          <p>You haven't saved any snippets yet.</p>
        ) : recentSnippetsList.length === 0 ? (
          <p>No recent snippets found.</p>
        ) : (
          recentSnippetsList.map(snippet => (
            <div 
              key={snippet.id} 
              className="snippet-item" 
              style={{ 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                padding: '1rem', 
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => navigateTo('scripts')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>
                  {snippet.title} ({snippet.language})
                </h4>
                <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                  {formatDate(snippet.created_at)}
                </span>
              </div>
              <pre style={{ 
                backgroundColor: '#f4f4f4', 
                padding: '0.5rem', 
                overflowX: 'auto', 
                borderRadius: '4px', 
                marginTop: '1rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                <code>{snippet.code.substring(0, 150)}{snippet.code.length > 150 ? '...' : ''}</code>
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
