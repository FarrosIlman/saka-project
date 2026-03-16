import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { levelAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { 
  Plus, BookOpen, Pencil, Trash2, 
  Layers, Loader2, X, Image as ImageIcon,
  ChevronRight, Sparkles, Search
} from 'lucide-react';

export default function LevelManagementPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, level: null });
  const [createModal, setCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTheme, setFilterTheme] = useState('all');
  const [newLevel, setNewLevel] = useState({ levelNumber: '', title: '', theme: '', imageUrl: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchLevels(); }, []);

  // Apply filters when levels or search changes
  useEffect(() => {
    let filtered = levels;
    
    if (searchTerm) {
      filtered = filtered.filter(level =>
        level.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        level.levelNumber.toString().includes(searchTerm)
      );
    }

    if (filterTheme !== 'all') {
      filtered = filtered.filter(level => level.theme === filterTheme);
    }

    setFilteredLevels(filtered);
  }, [levels, searchTerm, filterTheme]);

  const fetchLevels = async () => {
    try {
      const response = await levelAPI.getAllLevels();
      setLevels(response.data);
      setFilteredLevels(response.data);
    } catch (err) {
      console.error('Failed to fetch levels:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique themes for filter dropdown
  const availableThemes = [...new Set(levels.map(l => l.theme).filter(Boolean))];

  const handleDelete = (level) => setDeleteModal({ isOpen: true, level });

  const confirmDelete = async () => {
    try {
      await levelAPI.deleteLevel(deleteModal.level._id);
      showToast.success(`Level "${deleteModal.level.title}" deleted successfully`);
      setDeleteModal({ isOpen: false, level: null });
      fetchLevels();
    } catch (err) { 
      showToast.error(`Failed to delete level: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateLevel = async (e) => {
    e.preventDefault();
    try {
      await levelAPI.createLevel({
        levelNumber: Number(newLevel.levelNumber),
        title: newLevel.title,
        theme: newLevel.theme,
        imageUrl: newLevel.imageUrl
      });
      showToast.success(`Level "${newLevel.title}" created successfully`);
      setCreateModal(false);
      setNewLevel({ levelNumber: '', title: '', theme: '', imageUrl: '' });
      fetchLevels();
    } catch (err) { 
      showToast.error(err.response?.data?.message || 'Failed to create level');
    }
  };

  const styles = `
    .admin-page { padding: 32px; max-width: 1400px; margin: 0 auto; animation: fadeIn 0.6s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 20px; }
    .title-area h1 { font-size: clamp(24px, 4vw, 32px); font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.04em; }
    .title-area p { color: #64748b; margin-top: 4px; font-size: 15px; }

    .level-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
      gap: 28px; 
    }

    /* Card Styling */
    .glass-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 28px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .glass-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
      border-color: #0ea5e9;
    }

    .image-container {
      width: 100%;
      height: 200px;
      position: relative;
      overflow: hidden;
    }

    .card-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
    .glass-card:hover .card-img { transform: scale(1.1); }

    .level-tag {
      position: absolute; top: 16px; left: 16px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      color: white; padding: 6px 14px;
      border-radius: 100px; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
    }

    .card-body { padding: 24px; display: flex; flex-direction: column; flex-grow: 1; }
    .card-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .card-theme { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.5; }

    .card-footer { 
      margin-top: auto; padding-top: 20px; 
      border-top: 1px solid #f1f5f9;
      display: flex; gap: 10px;
    }

    /* Buttons */
    .btn-primary-saka {
      background: #0f172a; color: white; border: none;
      padding: 12px 24px; border-radius: 14px; font-weight: 700;
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      transition: 0.3s;
    }
    .btn-primary-saka:hover { background: #1e293b; transform: translateY(-2px); }

    .btn-edit-card {
      flex: 1; background: #f0f9ff; color: #0ea5e9;
      border: none; padding: 10px; border-radius: 12px;
      font-weight: 700; font-size: 13px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .btn-edit-card:hover { background: #0ea5e9; color: white; }

    .btn-delete-card {
      background: #fff1f2; color: #e11d48;
      border: none; padding: 10px; border-radius: 12px;
      cursor: pointer; transition: 0.2s;
    }
    .btn-delete-card:hover { background: #e11d48; color: white; }

    /* Modal */
    .saka-modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(8px); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .saka-modal-content {
      background: white; width: 100%; max-width: 500px;
      border-radius: 32px; padding: 32px; animation: modalSlide 0.4s ease;
    }
    @keyframes modalSlide { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

    @media (max-width: 768px) {
      .admin-page { padding: 20px; }
      .header-flex { flex-direction: column; align-items: stretch; text-align: center; }
      .header-flex button { justify-content: center; }
      .level-grid { grid-template-columns: 1fr; }
    }
  `;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Loader2 className="animate-spin text-sky-500" size={48} />
    </div>
  );

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <div className="header-flex">
        <div className="title-area">
          <h1>Content Management</h1>
          <p>Kelola kurikulum dan tantangan berbicara untuk siswa.</p>
        </div>
        <button className="btn-primary-saka" onClick={() => setCreateModal(true)}>
          <Plus size={20} /> New Level
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{
          flex: 1,
          minWidth: '250px',
          position: 'relative'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search by title or level number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {availableThemes.length > 0 && (
          <select
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: filterTheme !== 'all' ? '#f0f9ff' : 'white',
              color: filterTheme !== 'all' ? '#0ea5e9' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <option value="all">All Themes</option>
            {availableThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        )}

        {(searchTerm || filterTheme !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterTheme('all');
            }}
            style={{
              padding: '10px 16px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              color: '#64748b',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e2e8f0';
              e.target.style.color = '#475569';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f1f5f9';
              e.target.style.color = '#64748b';
            }}
          >
            ✕ Clear Filters
          </button>
        )}

        <div style={{
          padding: '8px 16px',
          background: '#f0fdf4',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#16a34a',
          whiteSpace: 'nowrap'
        }}>
          {filteredLevels.length} level{filteredLevels.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filteredLevels.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#94a3b8'
        }}>
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', fontWeight: '600' }}>No levels found</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            {searchTerm || filterTheme !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first level to get started'}
          </p>
        </div>
      ) : (
        <div className="level-grid">
          {filteredLevels.map((level) => (
          <div key={level._id} className="glass-card">
            <div className="image-container">
              <span className="level-tag">Level {level.levelNumber}</span>
              <img src={level.imageUrl} alt={level.title} className="card-img" />
            </div>
            
            <div className="card-body">
              <h3 className="card-title">{level.title}</h3>
              <p className="card-theme">{level.theme}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                <BookOpen size={16} />
                <span>{level.questions?.length || 0} Task Available</span>
              </div>

              <div className="card-footer">
                <button className="btn-edit-card" onClick={() => navigate(`/admin/content/levels/${level._id}/edit`)}>
                  <Pencil size={15} /> Edit Tasks
                </button>
                <button className="btn-delete-card" onClick={() => handleDelete(level)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, level: null })}
        onConfirm={confirmDelete}
        title="Delete Level"
        message={`Hapus level "${deleteModal.level?.title}"? Seluruh soal di dalamnya akan hilang permanen.`}
        confirmText="Hapus Permanen"
      />

      {createModal && (
        <div className="saka-modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="saka-modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Create New Level</h2>
              <X onClick={() => setCreateModal(false)} style={{ cursor: 'pointer', color: '#94a3b8' }} />
            </div>
            
            <form onSubmit={handleCreateLevel}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Level Number</label>
                <input style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px' }} type="number" required value={newLevel.levelNumber} onChange={e => setNewLevel({...newLevel, levelNumber: e.target.value})} placeholder="Ex: 1" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Level Title</label>
                <input style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px' }} type="text" required value={newLevel.title} onChange={e => setNewLevel({...newLevel, title: e.target.value})} placeholder="Ex: Greeting & Introduction" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Theme Description</label>
                <input style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px' }} type="text" required value={newLevel.theme} onChange={e => setNewLevel({...newLevel, theme: e.target.value})} placeholder="Ex: Basic communication skills" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Thumbnail URL</label>
                <input style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px' }} type="url" required value={newLevel.imageUrl} onChange={e => setNewLevel({...newLevel, imageUrl: e.target.value})} placeholder="https://..." />
              </div>
              <button type="submit" className="btn-primary-saka" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                Create Level Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}