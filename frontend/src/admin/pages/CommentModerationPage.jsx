import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Trash2, Search, Filter, AlertTriangle, 
  CheckSquare, Square, RefreshCw, Star, ThumbsUp, 
  CornerDownRight, User, Loader2, Sparkles, ShieldAlert,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { commentAPI, levelAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function CommentModerationPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  
  const [comments, setComments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [stats, setStats] = useState({ totalComments: 0, totalReplies: 0, flaggedCount: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 15 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  
  // Multi-select & Expand
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  
  // Delete Modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'comment', // 'comment' | 'reply' | 'bulk'
    commentId: null,
    replyId: null,
    title: '',
    message: '',
    confirmText: 'Hapus'
  });

  // Fetch all levels for dropdown filter
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await levelAPI.getAllLevels();
        setLevels(res.data || []);
      } catch (err) {
        console.error('Failed to fetch levels:', err);
      }
    };
    fetchLevels();
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        levelNumber: selectedLevel || undefined,
        onlyFlagged: onlyFlagged ? 'true' : 'false'
      };
      
      const res = await commentAPI.getAdminComments(params);
      if (res.data?.success) {
        setComments(res.data.comments || []);
        setStats(res.data.stats || { totalComments: 0, totalReplies: 0, flaggedCount: 0 });
        setPagination(res.data.pagination || { total: 0, page: 1, pages: 1, limit: 15 });
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      showToast.error('Gagal memuat daftar komentar');
    } finally {
      setLoading(false);
    }
  }, [search, selectedLevel, onlyFlagged, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComments(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchComments]);

  // Expand / collapse replies
  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map(c => c._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Delete Handlers
  const openDeleteCommentModal = (comment) => {
    const authorName = comment.author?.username || 'Siswa';
    setModalConfig({
      isOpen: true,
      type: 'comment',
      commentId: comment._id,
      replyId: null,
      title: 'Hapus Komentar?',
      message: `Apakah Anda yakin ingin menghapus komentar dari "${authorName}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Komentar'
    });
  };

  const openDeleteReplyModal = (commentId, reply) => {
    const replyAuthor = reply.author?.username || 'Siswa';
    setModalConfig({
      isOpen: true,
      type: 'reply',
      commentId,
      replyId: reply._id,
      title: 'Hapus Balasan Komentar?',
      message: `Apakah Anda yakin ingin menghapus balasan dari "${replyAuthor}"?`,
      confirmText: 'Ya, Hapus Balasan'
    });
  };

  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setModalConfig({
      isOpen: true,
      type: 'bulk',
      commentId: null,
      replyId: null,
      title: 'Hapus Beberapa Komentar Sekaligus?',
      message: `Anda akan menghapus ${selectedIds.length} komentar terpilih secara permanen. Lanjutkan?`,
      confirmText: `Hapus ${selectedIds.length} Komentar`
    });
  };

  const handleConfirmDelete = async () => {
    const { type, commentId, replyId } = modalConfig;
    setModalConfig(prev => ({ ...prev, isOpen: false }));

    try {
      if (type === 'comment' && commentId) {
        await commentAPI.deleteComment(commentId);
        showToast.success('Komentar berhasil dihapus');
        setSelectedIds(prev => prev.filter(id => id !== commentId));
        fetchComments(pagination.page);
      } else if (type === 'reply' && commentId && replyId) {
        await commentAPI.deleteReply(commentId, replyId);
        showToast.success('Balasan berhasil dihapus');
        fetchComments(pagination.page);
      } else if (type === 'bulk' && selectedIds.length > 0) {
        await commentAPI.bulkDeleteComments(selectedIds);
        showToast.success(`${selectedIds.length} komentar berhasil dihapus`);
        setSelectedIds([]);
        fetchComments(1);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <MessageSquare className="text-sky-500" size={28} />
            Moderasi Diskusi & Komentar
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">
            Pantau dan bersihkan komentar siswa dari kata-kata tidak pantas di setiap level.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={openBulkDeleteModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-500/20 transition-all"
            >
              <Trash2 size={16} />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => fetchComments(pagination.page)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl shadow-sm transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-sky-500' : 'text-slate-400'} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>
        </motion.div>
      </header>

      {/* KPI Stats */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Komentar</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalComments}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <CornerDownRight size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Balasan</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalReplies}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 ${stats.flaggedCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} rounded-xl flex items-center justify-center shrink-0`}>
            {stats.flaggedCount > 0 ? <ShieldAlert size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kata Kasar Terdeteksi</span>
            <p className={`text-2xl font-black ${stats.flaggedCount > 0 ? 'text-amber-600' : 'text-emerald-600'} mt-0.5`}>
              {stats.flaggedCount} {stats.flaggedCount > 0 ? 'Perlu Ditinjau' : 'Bersih'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter & Search Bar */}
      <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari isi komentar / nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none w-full"
            >
              <option value="">Semua Level Kuis</option>
              {levels.map(lvl => (
                <option key={lvl._id} value={lvl.levelNumber}>
                  Level {lvl.levelNumber}: {lvl.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setOnlyFlagged(!onlyFlagged)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              onlyFlagged 
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle size={15} />
            <span>Hanya Kata Kasar ({stats.flaggedCount})</span>
          </button>
        </div>
      </motion.div>

      {/* Comments List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Table Header / Selection Bar */}
        <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSelectAll}
              disabled={comments.length === 0}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              {selectedIds.length > 0 && selectedIds.length === comments.length ? (
                <CheckSquare size={18} className="text-sky-500" />
              ) : (
                <Square size={18} className="text-slate-300" />
              )}
              <span>Pilih Semua ({comments.length})</span>
            </button>
          </div>
          <span>Total: {pagination.total} Komentar</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
            <Loader2 className="animate-spin text-sky-500 mb-3" size={40} />
            <p className="text-slate-400 font-bold text-sm animate-pulse">Memuat komentar diskusi...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8">
            <div className="w-16 h-16 bg-sky-50 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-800">Tidak ada komentar ditemukan</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              {search || selectedLevel || onlyFlagged 
                ? 'Tidak ada komentar yang cocok dengan filter atau kata kunci pencarian.'
                : 'Belum ada komentar diskusi dari siswa pada level ini.'}
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isSelected = selectedIds.includes(comment._id);
            const isExpanded = expandedReplies.has(comment._id);
            const author = comment.author || {};
            const levelInfo = comment.level || {};
            const createdDate = new Date(comment.createdAt).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short'
            });

            return (
              <motion.div
                key={comment._id}
                layout
                className={`bg-white rounded-2xl border transition-all ${
                  comment.hasFlaggedContent
                    ? 'border-amber-200 bg-amber-50/10 shadow-sm'
                    : isSelected 
                      ? 'border-sky-300 bg-sky-50/10 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 shadow-sm'
                } p-5`}
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => toggleSelectOne(comment._id)} 
                      className="mt-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare size={20} className="text-sky-500" />
                      ) : (
                        <Square size={20} className="text-slate-300" />
                      )}
                    </button>

                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.username} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-sm sm:text-base">
                          {author.username || 'Anonymous'}
                        </span>
                        {author.role === 'admin' ? (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                            Siswa
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                          <Sparkles size={12} className="text-amber-500" />
                          Level {levelInfo.levelNumber || '?'}: {levelInfo.title || 'Unknown Level'}
                        </span>

                        {comment.hasFlaggedContent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold animate-pulse">
                            <AlertTriangle size={12} />
                            Kata Kasar
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-400 font-medium block mt-0.5">
                        {createdDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDeleteCommentModal(comment)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Hapus Komentar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mt-3.5 pl-8 sm:pl-13">
                  <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {comment.content}
                  </p>

                  {/* Badwords Warning Tag */}
                  {comment.detectedBadWords && comment.detectedBadWords.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 inline-flex">
                      <AlertTriangle size={14} />
                      <span>Terdeteksi kata kasar: <strong>{comment.detectedBadWords.join(', ')}</strong></span>
                    </div>
                  )}

                  {/* Metadata: Rating & Helpful */}
                  <div className="flex items-center gap-4 mt-3 text-xs font-bold text-slate-400">
                    {comment.rating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} className="fill-amber-400" />
                        <span>{comment.rating}/5</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      <span>{comment.helpful || 0} Membantu</span>
                    </div>

                    {comment.replies && comment.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(comment._id)}
                        className="flex items-center gap-1 text-sky-600 hover:text-sky-700 ml-auto transition-colors font-bold"
                      >
                        <CornerDownRight size={14} />
                        <span>{comment.replies.length} Balasan</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>

                  {/* Replies List (Collapsible) */}
                  <AnimatePresence>
                    {isExpanded && comment.replies && comment.replies.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3.5 space-y-2.5 border-l-2 border-sky-200 pl-4"
                      >
                        {comment.replies.map((reply) => {
                          const replyAuthor = reply.author || {};
                          const replyDate = new Date(reply.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          });

                          return (
                            <div 
                              key={reply._id}
                              className="bg-white p-3 rounded-xl border border-slate-100 flex items-start justify-between gap-3 shadow-xs"
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                                  {replyAuthor.avatar ? (
                                    <img src={replyAuthor.avatar} alt={replyAuthor.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={14} className="text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-slate-800">
                                      {replyAuthor.username || 'Anonymous'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {replyDate}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 font-medium mt-1">
                                    {reply.content}
                                  </p>

                                  {reply.detectedBadWords && reply.detectedBadWords.length > 0 && (
                                    <div className="mt-1 text-[11px] font-bold text-rose-600">
                                      ⚠️ Kata kasar: {reply.detectedBadWords.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => openDeleteReplyModal(comment._id, reply)}
                                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Hapus Balasan"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 pb-8">
            <span className="text-xs font-bold text-slate-400">
              Halaman {pagination.page} dari {pagination.pages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchComments(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchComments(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText="Batal"
        type="danger"
      />
    </motion.div>
  );
}
