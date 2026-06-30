import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2, Save, User, Lock, Shield, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserEditPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(userId);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await adminAPI.getUsers({ search: '' });
      const user = response.data.users.find((u) => u._id === userId);
      if (user) {
        setFormData({
          username: user.username,
          password: '',
          role: user.role,
        });
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      showToast.error('Gagal mengambil data user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await adminAPI.updateUser(userId, formData);
        showToast.success(`User "${formData.username}" berhasil diupdate`);
      } else {
        await adminAPI.createUser(formData);
        showToast.success(`User "${formData.username}" berhasil dibuat`);
      }
      navigate('/admin/users');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal menyimpan user';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="animate-spin text-sky-500" size={48} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/users')}
          className="p-3 bg-white border-2 border-slate-200 rounded-full text-slate-500 hover:border-sky-400 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight mb-1">
            {isEditMode ? 'Edit User' : 'Create User'}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {isEditMode ? 'Update informasi pengguna yang sudah ada' : 'Tambahkan pengguna baru ke platform'}
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-bold flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <User size={16} className="text-sky-500" /> Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="Masukkan username"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Lock size={16} className="text-sky-500" /> Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!isEditMode}
              placeholder={isEditMode ? 'Kosongkan jika tidak ingin mengubah password' : 'Masukkan password'}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
            />
            {isEditMode && (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                Membiarkan input ini kosong tidak akan merubah password pengguna saat ini.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Shield size={16} className="text-sky-500" /> Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-sky-500 focus:outline-none transition-colors font-bold text-slate-700 cursor-pointer appearance-none"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isEditMode ? (
                <><Save size={20} /> Update User</>
              ) : (
                <><UserPlus size={20} /> Create User</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}