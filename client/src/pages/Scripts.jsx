// client/src/pages/Scripts.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const apiUrl = import.meta.env.VITE_API_URL || "https://script-shelf.onrender.com";

function Scripts() {
  const [snippets, setSnippets] = useState([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/snippets`, getAuthHeaders());
      setSnippets(res.data);
    } catch (err) {
      console.error('Error fetching snippets:', err);
    }
  };

  const clearForm = () => {
    setTitle('');
    setCode('');
    setLanguage('javascript');
    setEditingSnippet(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const snippetData = { title, code, language };

    try {
      if (editingSnippet) {
        await axios.put(`${apiUrl}/api/snippets/${editingSnippet.id}`, snippetData, getAuthHeaders());
      } else {
        await axios.post(`${apiUrl}/api/snippets`, snippetData, getAuthHeaders());
      }
      fetchSnippets();
      clearForm();
    } catch (err) {
      console.error('Error saving snippet:', err);
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

  const filteredSnippets = snippets.filter(snippet => 
    snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="scripts-content" style={{ display: 'flex', gap: '2rem', padding: '1rem', alignItems: 'flex-start' }}>
      
      <div className="card" style={{ flex: 1, height: 'fit-content' }}>
        <h3>{editingSnippet ? 'Edit Snippet' : 'Create New Snippet'}</h3>
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
          <button type="submit" style={{ padding: '10px 15px' }}>
            {editingSnippet ? 'Update Snippet' : 'Save Snippet'}
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

        {snippets.length === 0 ? (
          <p>You haven't saved any snippets yet.</p>
        ) : filteredSnippets.length === 0 ? (
          <p>No snippets found matching "{searchTerm}".</p>
        ) : (
          filteredSnippets.map(snippet => (
            <div key={snippet.id} className="snippet-item" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{snippet.title} ({snippet.language})</h4>
                <div>
                  <button onClick={() => startEdit(snippet)} style={{ padding: '5px 10px' }}>Edit</button>
                  <button onClick={() => handleDelete(snippet.id)} style={{ marginLeft: '0.5rem', padding: '5px 10px' }}>
                    Delete
                  </button>
                </div>
              </div>
              <pre style={{ backgroundColor: '#f4f4f4', padding: '0.5rem', overflowX: 'auto', borderRadius: '4px', marginTop: '1rem' }}>
                <code>{snippet.code}</code>
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Scripts;

