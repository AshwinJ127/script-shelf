import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Removed react-syntax-highlighter to prevent build errors
import { 
  Star, 
  Folder, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  Clock, 
  Search, 
  X, 
  ChevronLeft,
  Save
} from 'lucide-react';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { 'x-auth-token': token } };
};

const apiUrl = import.meta.env?.VITE_API_URL || "https://script-shelf.onrender.com";

const mapLanguageToSyntaxHighlighter = (lang) => {
  return lang?.toLowerCase() || 'plaintext';
};

function Scripts() {
  const [snippets, setSnippets] = useState([]);
  const [folders, setFolders] = useState([]);
  const [versions, setVersions] = useState([]);
  
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [view, setView] = useState('list');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'javascript',
    folder_id: '',
    id: null,
    is_favorited: false
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [snipRes, foldRes] = await Promise.all([
        axios.get(`${apiUrl}/api/snippets`, getAuthHeaders()),
        axios.get(`${apiUrl}/api/folders`, getAuthHeaders())
      ]);
      setSnippets(snipRes.data);
      setFolders(foldRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      const res = await axios.post(`${apiUrl}/api/folders`, { name: newFolderName }, getAuthHeaders());
      setFolders([...folders, res.data]);
      setNewFolderName('');
    } catch (err) {
      console.error('Folder create failed', err);
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete folder? Snippets inside will be kept but unorganized.')) return;
    
    try {
      await axios.delete(`${apiUrl}/api/folders/${id}`, getAuthHeaders());
      setFolders(folders.filter(f => f.id !== id));
      if (selectedFolderId === id) setSelectedFolderId(null);
    } catch (err) {
      console.error('Folder delete failed', err);
    }
  };

  const handleSaveSnippet = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      code: formData.code,
      language: formData.language,
      folder_id: formData.folder_id || null,
      is_favorited: formData.is_favorited
    };

    try {
      if (formData.id) {
        await axios.put(`${apiUrl}/api/snippets/${formData.id}`, payload, getAuthHeaders());
      } else {
        await axios.post(`${apiUrl}/api/snippets`, payload, getAuthHeaders());
      }
      await fetchInitialData();
      setView('list');
      resetForm();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save snippet');
    }
  };

  const handleDeleteSnippet = async (id) => {
    if (!window.confirm('Delete this snippet permanently?')) return;
    try {
      await axios.delete(`${apiUrl}/api/snippets/${id}`, getAuthHeaders());
      setSnippets(snippets.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const toggleFavorite = async (snippet) => {
    try {
      const updatedSnippets = snippets.map(s => 
        s.id === snippet.id ? { ...s, is_favorited: !s.is_favorited } : s
      );
      setSnippets(updatedSnippets);

      await axios.put(`${apiUrl}/api/snippets/${snippet.id}`, {
        ...snippet,
        is_favorited: !snippet.is_favorited
      }, getAuthHeaders());
    } catch (err) {
      console.error('Favorite toggle failed', err);
      fetchInitialData();
    }
  };

  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`${apiUrl}/api/snippets/${id}/versions`, getAuthHeaders());
      setVersions(res.data);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('History fetch failed', err);
    }
  };

  const handleCopy = async (code, id) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEdit = (snippet) => {
    setFormData({
      id: snippet.id,
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      folder_id: snippet.folder_id || '',
      is_favorited: snippet.is_favorited
    });
    setView('form');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      language: 'javascript',
      folder_id: selectedFolderId || '',
      id: null,
      is_favorited: false
    });
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesFolder = selectedFolderId ? s.folder_id === selectedFolderId : true;
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    // Container that fits within main-content but handles its own 2-column layout
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      
      {/* --- FOLDER SIDEBAR --- */}
      <div style={{ 
        width: '280px', 
        borderRight: '1px solid var(--border-color)', 
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        backgroundColor: 'rgba(255,255,255,0.4)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => { setView('form'); resetForm(); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Plus size={18} /> New Snippet
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          <div 
            onClick={() => setSelectedFolderId(null)}
            style={{ 
                cursor: 'pointer', 
                padding: '0.75rem 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                transition: 'all 0.2s ease',
                color: selectedFolderId === null ? 'var(--text-accent)' : 'var(--text-secondary)',
                background: selectedFolderId === null ? 'rgba(90, 103, 216, 0.1)' : 'transparent',
                borderRight: selectedFolderId === null ? '3px solid var(--text-accent)' : '3px solid transparent',
                fontWeight: selectedFolderId === null ? 600 : 500
              }}          >
            <Folder size={18} /> All Snippets
          </div>

          {folders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              style={{ 
                    cursor: 'pointer', 
                    padding: '0.75rem 1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    // Logic for specific folders
                    color: selectedFolderId === folder.id ? 'var(--text-accent)' : 'var(--text-secondary)',
                    background: selectedFolderId === folder.id ? 'rgba(90, 103, 216, 0.1)' : 'transparent',
                    borderRight: selectedFolderId === folder.id ? '3px solid var(--text-accent)' : '3px solid transparent',
                    fontWeight: selectedFolderId === folder.id ? 600 : 500
                  }}            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Folder size={18} /> {folder.name}
              </div>
              <Trash2 
                size={14} 
                onClick={(e) => handleDeleteFolder(folder.id, e)}
                style={{ opacity: 0.6, cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>

        {/* New Folder Input Area */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="New Folder"
              // No inline styles needed; App.css input[type="text"] handles it
            />
            <button 
              type="submit"
              disabled={!newFolderName}
              style={{ padding: '0.75rem', width: 'auto' }}
            >
              <Plus size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* --- SNIPPET LIST / FORM AREA --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {view === 'list' ? (
          <>
            {/* Search Header */}
            <div style={{ 
              padding: '1.5rem 2rem', 
              borderBottom: '1px solid var(--border-color)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search snippets..."
                  style={{ paddingLeft: '2.5rem' }} // Only inline style needed for icon spacing
                />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {filteredSnippets.length} snippets
              </div>
            </div>

            {/* List Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              {isLoading ? (
                <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Loading...</div>
              ) : filteredSnippets.length === 0 ? (
                <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No snippets found.</div>
              ) : (
                filteredSnippets.map(snippet => (
                  <div key={snippet.id} className="snippet-item">
                    <div className="snippet-item-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                          onClick={() => toggleFavorite(snippet)}
                          style={{ background: 'transparent', boxShadow: 'none', padding: 0, minWidth: 'auto' }}
                        >
                          <Star 
                            size={20} 
                            fill={snippet.is_favorited ? "#fbbf24" : "none"} 
                            color={snippet.is_favorited ? "#fbbf24" : "var(--text-secondary)"} 
                          />
                        </button>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{snippet.title}</h4>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 10px', 
                          background: 'rgba(90, 103, 216, 0.1)', 
                          borderRadius: '12px', 
                          color: 'var(--text-accent)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          letterSpacing: '0.05em'
                        }}>
                          {snippet.language}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={() => fetchHistory(snippet.id)} title="History"><Clock size={16} /></button>
                        <button type="button" onClick={() => handleCopy(snippet.code, snippet.id)} title="Copy">
                          {copiedId === snippet.id ? <span style={{fontSize: '0.8rem'}}>Copied</span> : <Copy size={16} />}
                        </button>
                        <button type="button" onClick={() => openEdit(snippet)} title="Edit"><Edit2 size={16} /></button>
                        <button type="button" onClick={() => handleDeleteSnippet(snippet.id)} title="Delete" style={{color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2'}}><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <pre>
                      <code>{snippet.code}</code>
                    </pre>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Form View */
          <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
            <button 
              type="button"
              onClick={() => setView('list')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', padding: '0.5rem 1rem' }}
            >
              <ChevronLeft size={18} /> Back
            </button>
            
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>
                {formData.id ? 'Edit Snippet' : 'Create New Snippet'}
              </h3>

              <form onSubmit={handleSaveSnippet}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label>Title</label>
                    <input 
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label>Language</label>
                    <select 
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="sql">SQL</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="text">Plain Text</option>
                    </select>
                  </div>
                  <div>
                    <label>Folder</label>
                    <select 
                      value={formData.folder_id}
                      onChange={e => setFormData({ ...formData, folder_id: e.target.value })}
                    >
                      <option value="">No Folder</option>
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label>Code</label>
                  <textarea 
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    required
                    rows={12}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} /> Save Snippet
                  </button>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                    <input 
                      type="checkbox"
                      checked={formData.is_favorited}
                      onChange={e => setFormData({ ...formData, is_favorited: e.target.checked })}
                      style={{ width: 'auto' }}
                    />
                    Mark as Favorite
                  </label>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Version History</h3>
              <button type="button" onClick={() => setShowHistoryModal(false)} style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '4px' }}>
                <X size={20} color="var(--text-primary)" />
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
              {versions.length === 0 ? (
                <p>No previous versions found.</p>
              ) : (
                versions.map((v, i) => (
                  <div key={v.id} style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>Version {versions.length - i}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(v.edited_at).toLocaleString()}
                      </span>
                    </div>
                    <pre style={{ maxHeight: '150px', overflow: 'hidden', opacity: 0.8 }}>
                      <code>{v.code}</code>
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scripts;