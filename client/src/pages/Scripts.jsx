// client/src/pages/Scripts.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const apiUrl = import.meta.env.VITE_API_URL || "https://script-shelf.onrender.com";

// Map language names to syntax highlighter language identifiers
const mapLanguageToSyntaxHighlighter = (lang) => {
  const languageMap = {
    'javascript': 'javascript',
    'python': 'python',
    'sql': 'sql',
    'css': 'css',
    'html': 'html',
    'text': 'plaintext'
  };
  return languageMap[lang?.toLowerCase()] || 'plaintext';
};

function Scripts({ languageFilter, selectedSnippetId }) {
  const [snippets, setSnippets] = useState([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedSnippetId, setHighlightedSnippetId] = useState(null);


  useEffect(() => {
    // Log API URL for debugging
    console.log('API URL:', apiUrl);
    console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
    fetchSnippets();
  }, []);

  // Scroll to and highlight the selected snippet when it loads
  useEffect(() => {
    if (selectedSnippetId && snippets.length > 0) {
      // Wait a bit for the DOM to render
      setTimeout(() => {
        const snippetElement = document.getElementById(`snippet-${selectedSnippetId}`);
        if (snippetElement) {
          snippetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedSnippetId(selectedSnippetId);
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedSnippetId(null);
          }, 3000);
        }
      }, 100);
    }
  }, [selectedSnippetId, snippets]);

  const fetchSnippets = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Log for debugging
      console.log('Fetching snippets from:', `${apiUrl}/api/snippets`);
      console.log('Auth token present:', !!localStorage.getItem('authToken'));
      
      // Add timeout to prevent hanging
      const config = {
        ...getAuthHeaders(),
        timeout: 10000 // 10 second timeout
      };
      
      const res = await axios.get(`${apiUrl}/api/snippets`, config);
      setSnippets(res.data || []);
      console.log('Snippets loaded:', res.data?.length || 0);
    } catch (err) {
      console.error('Error fetching snippets:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        request: err.request,
        code: err.code
      });
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError(`Request timed out. Check if server is running at ${apiUrl}`);
      } else if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log out and log back in.');
        } else if (err.response.status === 500) {
          setError('Server error. Please check if the server is running.');
        } else {
          setError(`Error loading snippets: ${err.response.data?.msg || err.message}`);
        }
      } else if (err.request) {
        setError(`Cannot connect to server. Check if the server is running at ${apiUrl}. Make sure your local server is running on port 5050.`);
      } else {
        setError(`Error: ${err.message || 'Unknown error occurred'}`);
      }
      // Set empty array on error so UI doesn't show "no snippets" when it's actually a connection issue
      setSnippets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setTitle('');
    setCode('');
    setLanguage('javascript');
    setEditingSnippet(null);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    const snippetData = { title, code, language };
    
    // Log for debugging
    console.log('Saving snippet to:', `${apiUrl}/api/snippets`);
    console.log('Auth token present:', !!localStorage.getItem('authToken'));

    try {
      // Add timeout to prevent hanging
      const config = {
        ...getAuthHeaders(),
        timeout: 10000 // 10 second timeout
      };
      
      if (editingSnippet) {
        await axios.put(`${apiUrl}/api/snippets/${editingSnippet.id}`, snippetData, config);
        setSuccessMessage('Snippet updated successfully!');
      } else {
        await axios.post(`${apiUrl}/api/snippets`, snippetData, config);
        setSuccessMessage('Snippet saved successfully!');
      }
      
      // Refresh the list
      await fetchSnippets();
      clearForm();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving snippet:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        request: err.request
      });
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError(`Request timed out. Check if server is running at ${apiUrl}`);
      } else if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log out and log back in.');
        } else if (err.response.status === 400) {
          setError(err.response.data?.msg || 'Invalid data. Please check your input.');
        } else if (err.response.status === 500) {
          setError('Server error. Please check if the server is running.');
        } else {
          setError(`Error saving snippet: ${err.response.data?.msg || err.message}`);
        }
      } else if (err.request) {
        setError(`Cannot connect to server. Check if the server is running at ${apiUrl}. Make sure your local server is running on port 5050.`);
      } else {
        setError(`Error: ${err.message || 'Unknown error occurred'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (snippet) => {
    setEditingSnippet(snippet);
    setTitle(snippet.title);
    setCode(snippet.code);
    setLanguage(snippet.language);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await axios.delete(`${apiUrl}/api/snippets/${id}`, getAuthHeaders());
        fetchSnippets();
      } catch (err) {
        console.error('Error deleting snippet:', err);
      }
    }
  };

  const handleCopy = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedId(snippet.id);
      // Reset the "Copied!" message after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      // Fallback for browsers that don't support Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = snippet.code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(snippet.id);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
        alert('Failed to copy to clipboard. Please select and copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredSnippets = snippets.filter(snippet => {
    // Always show the selected snippet, even if it would be filtered out
    if (selectedSnippetId && snippet.id === selectedSnippetId) {
      return true;
    }
    
    // First, apply language filter if provided (exact match)
    if (languageFilter) {
      const matchesLanguage = snippet.language?.toLowerCase() === languageFilter.toLowerCase();
      if (!matchesLanguage) {
        return false;
      }
    }
    
    // Then apply search term filter if provided
    if (searchTerm) {
      return snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             snippet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
             snippet.language.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // If no filters, show all
    return true;
  });

  return (
    <div className="scripts-content" style={{ display: 'flex', gap: '2rem', padding: '1rem', alignItems: 'flex-start' }}>
      
      <div className="card" style={{ flex: 1, height: 'fit-content' }}>
        <h3>{editingSnippet ? 'Edit Snippet' : 'Create New Snippet'}</h3>
        {error && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '1rem', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '1rem', 
            backgroundColor: '#efe', 
            color: '#3c3', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>Language</label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
              <option value="text">Plain Text</option>
            </select>
          </div>
          <div>
            <label>Code</label>
            <textarea 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              required 
              rows="10" 
              style={{ width: '100%', fontFamily: 'monospace', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 15px' }} disabled={isLoading}>
            {isLoading ? 'Saving...' : editingSnippet ? 'Update Snippet' : 'Save Snippet'}
          </button>
          {editingSnippet && (
            <button type="button" onClick={clearForm} style={{ marginLeft: '1rem', padding: '10px 15px' }}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="card" style={{ flex: 2 }}>
        <h3>My Snippet Library</h3>

        <input 
          type="text"
          placeholder="Search by title, language, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />

        {isLoading ? (
          <p>Loading snippets...</p>
        ) : snippets.length === 0 ? (
          <p>You haven't saved any snippets yet.</p>
        ) : filteredSnippets.length === 0 ? (
          <p>No snippets found matching "{searchTerm}".</p>
        ) : (
          filteredSnippets.map(snippet => (
            <div 
              key={snippet.id} 
              id={`snippet-${snippet.id}`}
              className="snippet-item" 
              style={{ 
                border: highlightedSnippetId === snippet.id ? '2px solid #6a5acd' : '1px solid #eee', 
                borderRadius: '8px', 
                padding: '1rem', 
                marginBottom: '1rem',
                backgroundColor: highlightedSnippetId === snippet.id ? '#f0f4ff' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>{snippet.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#718096' }}>
                    <span style={{ textTransform: 'capitalize' }}>{snippet.language || 'text'}</span>
                    {snippet.created_at && (
                      <>
                        <span>•</span>
                        <span>Created {formatDate(snippet.created_at)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleCopy(snippet)} 
                    style={{ 
                      padding: '5px 10px',
                      backgroundColor: copiedId === snippet.id ? '#4caf50' : (theme === 'dark' ? '#4a4a4a' : '#6a5acd'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {copiedId === snippet.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={() => startEdit(snippet)} 
                    style={{ marginLeft: '0.5rem', padding: '5px 10px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(snippet.id)} 
                    style={{ marginLeft: '0.5rem', padding: '5px 10px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', borderRadius: '4px', overflow: 'hidden' }}>
                <SyntaxHighlighter
                  language={mapLanguageToSyntaxHighlighter(snippet.language)}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}
                  showLineNumbers={false}
                >
                  {snippet.code || ''}
                </SyntaxHighlighter>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Scripts;