import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { levelAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ArrowLeft, Save, Plus, Pencil, Trash2, Loader2, Settings, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LevelEditPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, question: null });

  useEffect(() => {
    fetchLevel();
  }, [levelId]);

  const fetchLevel = async () => {
    try {
      const response = await levelAPI.getAllLevels();
      const foundLevel = response.data.find((l) => l._id === levelId);
      if (foundLevel) {
        setLevel(foundLevel);
        setQuestions(foundLevel.questions);
      }
    } catch (err) {
      showToast.error('Failed to fetch level details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLevel = async (e) => {
    e.preventDefault();
    try {
      await levelAPI.updateLevel(levelId, level);
      showToast.success(`Level "${level.title}" updated successfully`);
    } catch (err) {
      showToast.error('Failed to update level');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await levelAPI.createQuestion(levelId, editingQuestion);
      showToast.success('Question created successfully');
      setEditingQuestion(null);
      fetchLevel();
    } catch (err) {
      showToast.error('Failed to create question');
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await levelAPI.updateQuestion(editingQuestion._id, editingQuestion);
      showToast.success('Question updated successfully');
      setEditingQuestion(null);
      fetchLevel();
    } catch (err) {
      showToast.error('Failed to update question');
    }
  };

  const handleDeleteQuestion = (question) => {
    setDeleteModal({ isOpen: true, question });
  };

  const confirmDeleteQuestion = async () => {
    try {
      await levelAPI.deleteQuestion(deleteModal.question._id);
      showToast.success('Question deleted successfully');
      setDeleteModal({ isOpen: false, question: null });
      fetchLevel();
    } catch (err) {
      showToast.error('Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="animate-spin text-sky-500" size={48} />
      </div>
    );
  }

  if (!level) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-bold text-slate-500">Level not found</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/content/levels')}
          className="p-3 bg-white border-2 border-slate-200 rounded-full text-slate-500 hover:border-sky-400 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight mb-1">
            Edit Level {level.levelNumber}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{level.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Level Details */}
        <div className="lg:col-span-1">
          <div className="glass-card bg-white p-6 sticky top-24">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-sky-500" /> Level Configuration
            </h2>
            <form onSubmit={handleUpdateLevel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text" required
                  value={level.title}
                  onChange={(e) => setLevel({ ...level, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Theme</label>
                <input
                  type="text" required
                  value={level.theme}
                  onChange={(e) => setLevel({ ...level, theme: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Image URL</label>
                <input
                  type="url" required
                  value={level.imageUrl}
                  onChange={(e) => setLevel({ ...level, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-medium text-sm"
                />
                {level.imageUrl && (
                  <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                    <img src={level.imageUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-sky-50 text-sky-600 font-bold rounded-xl hover:bg-sky-500 hover:text-white transition-colors">
                  <Save size={18} /> Update Level Config
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Questions */}
        <div className="lg:col-span-2">
          <div className="glass-card bg-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <HelpCircle size={24} className="text-sky-500" /> 
                Task Questions <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-sm">{questions.length}</span>
              </h2>
              <button
                onClick={() => setEditingQuestion({
                  questionText: '',
                  imageUrl: '',
                  options: ['', '', ''],
                  correctAnswer: '',
                })}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center"
              >
                <Plus size={18} /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <HelpCircle size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-500">Belum ada soal untuk level ini.</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    key={question._id} 
                    className="p-5 border-2 border-slate-100 rounded-2xl bg-slate-50/50 hover:border-sky-200 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="w-8 h-8 shrink-0 bg-sky-100 text-sky-600 font-black rounded-lg flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-bold text-slate-800 pt-0.5">
                            {question.questionText}
                          </h3>
                        </div>
                        
                        <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Options</span>
                            <div className="flex flex-wrap gap-1.5">
                              {question.options.map((opt, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md border border-slate-200">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 shadow-sm">
                            <span className="block text-[10px] font-black text-sky-500/70 uppercase tracking-widest mb-1">Correct Answer</span>
                            <span className="font-bold text-sky-700 text-sm">{question.correctAnswer}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto pl-11 sm:pl-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => setEditingQuestion(question)}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-2 p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} /> <span className="sm:hidden font-bold text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question)}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-2 p-2.5 bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} /> <span className="sm:hidden font-bold text-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit/Add Question */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden my-8"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">
                {editingQuestion._id ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={editingQuestion._id ? handleUpdateQuestion : handleCreateQuestion} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Question Text</label>
                <textarea
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  rows="3" required
                  placeholder="Enter the question..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={editingQuestion.imageUrl}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Options (Required 3)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {editingQuestion.options.map((option, index) => (
                    <input
                      key={index}
                      type="text" required
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[index] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-medium text-sm text-center"
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Set Correct Answer</label>
                <select
                  value={editingQuestion.correctAnswer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-bold text-slate-700 cursor-pointer"
                >
                  <option value="" disabled>Select correct answer</option>
                  {editingQuestion.options.map((option, index) => (
                    option && <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingQuestion(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                  {editingQuestion._id ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, question: null })}
        onConfirm={confirmDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Yes, Delete"
        type="danger"
      />
    </motion.div>
  );
}