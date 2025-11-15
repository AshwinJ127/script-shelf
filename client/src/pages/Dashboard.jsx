import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const apiUrl = import.meta.env.VITE_API_URL;

function Dashboard({ navigateTo, navigateToScriptsWithLanguage, navigateToSnippet }) {
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    fetchSnippets();
  }, []);

  const totalSnippets = snippets.length;

  const languageCounts = snippets.reduce((counts, snippet) => {
    const lang = snippet.language || 'text';
    counts[lang] = (counts[lang] || 0) + 1;
    return counts;
  }, {});

  const sortedLanguages = Object.entries(languageCounts).sort(([, countA], [, countB]) => countB - countA);
  
  // Recently saved snippets (latest 5)
  const recentSnippets = [...snippets]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-content"> 
      
      <div className="card">
        <div className="stat-item" style={{ textAlign: 'center' }}>
          <span className="stat-number">
            {isLoading ? '...' : totalSnippets}
          </span>
          <span className="stat-label"> Total Snippets</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3>Quick Actions</h3>
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigateTo('scripts')}>
            Create New Snippet
          </button>
          <button onClick={() => navigateTo('scripts')}>
            Edit Existing Snippet
          </button>
        </div>
      </div>

      {/* Recently Saved Snippets */}
      <div className="card">
        <h3>Recently Saved</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : recentSnippets.length === 0 ? (
          <p>No recent snippets.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentSnippets.map((s) => (
              <li 
                key={s.id} 
                onClick={() => navigateToSnippet && navigateToSnippet(s.id)}
                style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  borderRadius: '4px',
                  marginBottom: '0.25rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{s.title}</strong>
                    <span style={{ marginLeft: '0.5rem', color: '#718096', textTransform: 'capitalize' }}>({s.language || 'text'})</span>
                  </div>
                  <span style={{ color: '#718096', fontSize: '0.875rem' }}>{formatDate(s.created_at)}</span>
                </div>
                {s.code ? (
                  <div style={{ marginTop: '0.5rem', color: '#4a5568', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.code.slice(0, 120)}{s.code.length > 120 ? '…' : ''}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Breakdown by Language</h3>
        {isLoading ? (
          <p>Loading stats...</p>
        ) : sortedLanguages.length === 0 ? (
          <p>No snippets found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sortedLanguages.map(([language, count], index) => (
              <li 
                key={language} 
                onClick={() => navigateToScriptsWithLanguage && navigateToScriptsWithLanguage(language)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem 0.25rem',
                  borderBottom: index === sortedLanguages.length - 1 ? 'none' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span 
                  className="stat-label" 
                  style={{ 
                    textTransform: 'capitalize', 
                    fontSize: '0.95rem',
                    color: '#2d3748',
                    fontWeight: 600
                  }}
                >
                  {language}
                </span>
                
                <span 
                  className="stat-number" 
                  style={{ 
                    fontSize: '1.1rem', 
                    marginBottom: 0,
                    color: '#718096'
                  }}
                >
                  {count} {count === 1 ? 'snippet' : 'snippets'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;