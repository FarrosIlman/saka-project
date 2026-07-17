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
import { motion, AnimatePresence } from 'framer-motion';

export default function LevelManagementPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, level: null });
  const [createModal, setCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTheme, setFilterTheme] = useState('all');
  const [newLevel, setNewLevel] = useState({ levelNumber: '', title: '', theme: '', phase: 1, imageUrl: '', materialText: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchLevels(); }, []);

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
        phase: Number(newLevel.phase),
        imageUrl: newLevel.imageUrl,
        materialText: newLevel.materialText
      });
      showToast.success(`Level "${newLevel.title}" created successfully`);
      setCreateModal(false);
      setNewLevel({ levelNumber: '', title: '', theme: '', phase: 1, imageUrl: '', materialText: '' });
      fetchLevels();
    } catch (err) { 
      showToast.error(err.response?.data?.message || 'Failed to create level');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Loader2 className="animate-spin text-sky-500" size={48} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight mb-2">
            <Layers className="text-sky-500" size={28} />
            Content Management
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium">Kelola kurikulum dan tantangan berbicara untuk siswa.</p>
        </div>
        <button 
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all text-sm sm:text-base"
        >
          <Plus size={18} /> New Level
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card bg-white/80 p-4 mb-8 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or level number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {availableThemes.length > 0 && (
          <select
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
            className={`py-3 px-4 border-2 rounded-xl text-sm font-bold cursor-pointer transition-colors outline-none ${filterTheme !== 'all' ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-slate-50 border-slate-100 text-slate-600 focus:border-sky-500'}`}
          >
            <option value="all">All Themes</option>
            {availableThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        )}

        {(searchTerm || filterTheme !== 'all') && (
          <button
            onClick={() => { setSearchTerm(''); setFilterTheme('all'); }}
            className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <X size={16} /> Clear Filters
          </button>
        )}

        <div className="px-4 py-3 bg-sky-50 text-sky-600 font-black rounded-xl text-sm border border-sky-100">
          {filteredLevels.length} Level{filteredLevels.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Level Grid */}
      {filteredLevels.length === 0 ? (
        <div className="glass-card bg-white/50 p-16 text-center border-dashed">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-xl font-bold text-slate-600 mb-2">No levels found</p>
          <p className="text-slate-500">
            {searchTerm || filterTheme !== 'all' ? 'Try adjusting your search or filters' : 'Create your first level to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredLevels.map((level) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={level._id} 
                className="glass-card bg-white group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20 shadow-sm">
                    Level {level.levelNumber}
                  </div>
                  <img src={level.imageUrl} alt={level.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-1">Phase {level.phase || 1}</div>
                  <h3 className="text-lg font-black text-slate-900 mb-1 line-clamp-1">{level.title}</h3>
                  <p className="text-xs font-bold text-slate-500 mb-3">{level.theme}</p>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-5">
                    <BookOpen size={14} />
                    <span>{level.questions?.length || 0} Task Available</span>
                  </div>

                  <div className="mt-auto flex gap-2 pt-3 border-t border-slate-100">
                    <button 
                      onClick={() => navigate(`/admin/content/levels/${level._id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-sky-50 text-sky-600 text-sm font-bold rounded-xl hover:bg-sky-500 hover:text-white transition-colors"
                    >
                      <Pencil size={14} /> Edit Tasks
                    </button>
                    <button 
                      onClick={() => handleDelete(level)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"
                      title="Delete Level"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, level: null })}
        onConfirm={confirmDelete}
        title="Delete Level"
        message={`Hapus level "${deleteModal.level?.title}"? Seluruh soal di dalamnya akan hilang permanen.`}
        confirmText="Hapus Permanen"
        type="danger"
      />

      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-slate-900">Create New Level</h2>
              <button onClick={() => setCreateModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateLevel} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Level Number</label>
                <input 
                  type="number" required 
                  value={newLevel.levelNumber} 
                  onChange={e => setNewLevel({...newLevel, levelNumber: e.target.value})} 
                  placeholder="Ex: 1" 
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg focus:border-sky-500 focus:outline-none transition-colors text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Level Title</label>
                <input 
                  type="text" required 
                  value={newLevel.title} 
                  onChange={e => setNewLevel({...newLevel, title: e.target.value})} 
                  placeholder="Ex: Greeting & Introduction" 
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg focus:border-sky-500 focus:outline-none transition-colors text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Theme Description</label>
                <input 
                  type="text" required 
                  value={newLevel.theme} 
                  onChange={e => setNewLevel({...newLevel, theme: e.target.value})} 
                  placeholder="Ex: Basic communication skills" 
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg focus:border-sky-500 focus:outline-none transition-colors text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phase</label>
                <input 
                  type="number" required min="1"
                  value={newLevel.phase} 
                  onChange={e => setNewLevel({...newLevel, phase: e.target.value})} 
                  placeholder="Ex: 1" 
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg focus:border-sky-500 focus:outline-none transition-colors text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail URL</label>
                <input 
                  type="url" required 
                  value={newLevel.imageUrl} 
                  onChange={e => setNewLevel({...newLevel, imageUrl: e.target.value})} 
                  placeholder="https://..." 
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg focus:border-sky-500 focus:outline-none transition-colors text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Material/Tips (Optional)</label>
                <textarea 
                  value={newLevel.materialText} 
                  onChange={e => setNewLevel({...newLevel, materialText: e.target.value})} 
                  placeholder="Tips singkat sebelum memulai kuis..." 
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg focus:border-sky-500 focus:outline-none transition-colors text-sm font-medium resize-none h-20"
                ></textarea>
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors text-sm">
                  Create Level Now
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}