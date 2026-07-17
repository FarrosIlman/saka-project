import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Lock, User, Loader2, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { register, user, isAdmin } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(isAdmin() ? '/admin/dashboard' : '/levels', { replace: true });
    }
  }, [user, navigate, isAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      showError('Password tidak cocok');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      showError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }
    
    try {
      const result = await register(formData);
      if (!result.success) {
        showError(result.message || 'Pendaftaran gagal');
        setLoading(false);
      } else {
        showSuccess('Pendaftaran berhasil! Mengalihkan ke login...');
      }
    } catch (err) {
      console.error('Register error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Terjadi kesalahan pendaftaran';
      showError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col md:flex-row-reverse overflow-x-hidden overflow-y-auto">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-200/40 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-200/40 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      </div>

      {/* Right Panel (now on the left visually) - Branding */}
      <div className="hidden md:flex md:w-1/2 relative z-10 bg-slate-900 text-white flex-col justify-center p-12 lg:p-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-emerald-500 to-transparent"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-8">
            <Sparkles size={16} className="text-emerald-400" />
            <span>SAKA Platform</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Mulai <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">Petualanganmu.</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed mb-10">
            Daftar sekarang dan bergabunglah dengan ribuan siswa lainnya untuk belajar bahasa Inggris dengan cara yang seru!
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <BookOpen size={20} className="text-sky-400"/>
            Gratis akses modul selamanya
          </div>
        </motion.div>
      </div>

      {/* Left Panel - Form */}
      <div className="w-full flex-1 md:w-1/2 flex items-center justify-center p-4 sm:p-6 relative z-10 min-h-screen md:min-h-0">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md glass-card p-6 sm:p-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex md:hidden items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold mb-6">
              <Sparkles size={14} /> SAKA Platform
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Buat Akun</h2>
            <p className="text-slate-500">Mulai petualangan belajarmu sekarang.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="Min. 3 karakter"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="Min. 6 karakter"
                  required
                  disabled={loading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 px-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Konfirmasi Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input 
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="Ulangi password"
                  required
                  disabled={loading}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-2 px-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <><span>Daftar Sekarang</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline decoration-2 underline-offset-4 transition-all">
              Masuk di sini
            </Link>
          </p>
          
          <div className="mt-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-xs font-medium text-slate-500 text-center">
            💡 Tips: Gunakan username unik agar pendaftaran lancar.
          </div>
        </motion.div>
      </div>
    </div>
  );
}