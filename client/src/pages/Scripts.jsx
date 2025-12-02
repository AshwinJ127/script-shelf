import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

const apiUrl = import.meta.env.VITE_API_URL || "https://script-shelf.onrender.com";

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

function Scripts() {
  // Data State
  const [snippets, setSnippets] = useState([]);
  const [folders, setFolders] = useState([]);
  const [versions, setVersions] = useState([]);
  
  // UI State
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null = All Snippets
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Form State
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
      // Optimistic update
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
      // Revert on fail
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
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      
      {/* --- LEFT SIDEBAR (FOLDERS) --- */}
      <div style={{ 
        width: '260px', 
        borderRight: '1px solid #e2e8f0', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <button 
            onClick={() => { setView('form'); resetForm(); }}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: '#6366f1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Plus size={18} /> New Snippet
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          <div 
            onClick={() => setSelectedFolderId(null)}
            style={{ 
              padding: '0.75rem 1.5rem', 
              cursor: 'pointer',
              background: selectedFolderId === null ? '#e0e7ff' : 'transparent',
              color: selectedFolderId === null ? '#4338ca' : '#64748b',
              fontWeight: selectedFolderId === null ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Folder size={18} /> All Snippets
          </div>

          {folders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              style={{ 
                padding: '0.75rem 1.5rem', 
                cursor: 'pointer',
                background: selectedFolderId === folder.id ? '#e0e7ff' : 'transparent',
                color: selectedFolderId === folder.id ? '#4338ca' : '#64748b',
                fontWeight: selectedFolderId === folder.id ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                group: 'folder-item'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Folder size={18} /> {folder.name}
              </div>
              <Trash2 
                size={14} 
                onClick={(e) => handleDeleteFolder(folder.id, e)}
                style={{ opacity: 0.5, cursor: 'pointer' }}
                className="delete-icon" 
              />
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '8px' }}>
            <input 
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="New Folder"
              style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <button 
              type="submit"
              disabled={!newFolderName}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}
            >
              <Plus size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        
        {view === 'list' ? (
          <>
            {/* List Header */}
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e2e8f0', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem' 
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search snippets..."
                  style={{ 
                    width: '100%', 
                    padding: '0.6rem 0.6rem 0.6rem 2.2rem', 
                    borderRadius: '6px', 
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                {filteredSnippets.length} snippets
              </div>
            </div>

            {/* List Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
              {isLoading ? <div style={{textAlign: 'center', marginTop: '2rem', color: '#64748b'}}>Loading...</div> : 
               filteredSnippets.length === 0 ? <div style={{textAlign: 'center', marginTop: '2rem', color: '#64748b'}}>No snippets found.</div> :
               
               filteredSnippets.map(snippet => (
                <div key={snippet.id} style={{ 
                  background: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  marginBottom: '1.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid #f1f5f9', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button 
                        onClick={() => toggleFavorite(snippet)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star 
                          size={20} 
                          fill={snippet.is_favorited ? "#fbbf24" : "none"} 
                          color={snippet.is_favorited ? "#fbbf24" : "#94a3b8"} 
                        />
                      </button>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{snippet.title}</h3>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        background: '#f1f5f9', 
                        borderRadius: '12px', 
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}>
                        {snippet.language}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => fetchHistory(snippet.id)}
                        title="View History"
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        <Clock size={18} />
                      </button>
                      <button 
                        onClick={() => handleCopy(snippet.code, snippet.id)}
                        title="Copy Code"
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: copiedId === snippet.id ? '#10b981' : '#64748b' }}
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={() => openEdit(snippet)}
                        title="Edit Snippet"
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSnippet(snippet.id)}
                        title="Delete Snippet"
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    <SyntaxHighlighter 
                      language={mapLanguageToSyntaxHighlighter(snippet.language)} 
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.9rem' }}
                    >
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Form View */
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <button 
              onClick={() => setView('list')}
              style={{ 
                background: 'none', 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px', 
                color: '#64748b', 
                cursor: 'pointer',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}
            >
              <ChevronLeft size={18} /> Back to List
            </button>
            
            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
              {formData.id ? 'Edit Snippet' : 'Create New Snippet'}
            </h2>

            <form onSubmit={handleSaveSnippet} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Title</label>
                  <input 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Language</label>
                  <select 
                    value={formData.language}
                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="text">Plain Text</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Folder</label>
                  <select 
                    value={formData.folder_id}
                    onChange={e => setFormData({ ...formData, folder_id: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">No Folder</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Code</label>
                <textarea 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  required
                  rows={15}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  type="submit"
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    background: '#6366f1', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontWeight: 500
                  }}
                >
                  <Save size={18} /> Save Snippet
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={formData.is_favorited}
                    onChange={e => setFormData({ ...formData, is_favorited: e.target.checked })}
                  />
                  Mark as Favorite
                </label>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* History Modal Overlay */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{ background: 'white', width: '500px', maxHeight: '80vh', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Version History</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ overflowY: 'auto' }}>
              {versions.length === 0 ? (
                <p style={{ color: '#64748b' }}>No previous versions found.</p>
              ) : (
                versions.map((v, i) => (
                  <div key={v.id} style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Version {versions.length - i}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      {new Date(v.edited_at).toLocaleString()}
                    </div>
                    <pre style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', overflowX: 'auto' }}>
                      {v.code.substring(0, 100)}...
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