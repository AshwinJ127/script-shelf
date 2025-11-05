import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const apiUrl = import.meta.env.VITE_API_URL;

function Dashboard() {
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

  return (
    <div className="dashboard-content"> 
      <div className="card">
        <h3>Welcome to Script Shelf</h3>
        <p>This is your personal script management dashboard. Here's a quick overview of your library.</p>
      </div>
      
      <div className="card">
        <div className="stat-item" style={{ textAlign: 'center' }}>
          <span className="stat-number">
            {isLoading ? '...' : totalSnippets}
          </span>
          <span className="stat-label"> Total Snippets</span>
        </div>
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
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem 0.25rem',
                  borderBottom: index === sortedLanguages.length - 1 ? 'none' : '1px solid #e2e8f0' 
                }}
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