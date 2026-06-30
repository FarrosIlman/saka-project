import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Lock, User, Loader2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, user, isAdmin } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(isAdmin() ? '/admin/dashboard' : '/levels', { replace: true });
    }
  }, [user, navigate, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(username, password);
      if (!result.success) {
        showError(result.message);
        setLoading(false);
      }
    } catch (err) {
      showError("Terjadi kesalahan koneksi.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-sky-200/40 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-200/40 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      </div>

      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative z-10 bg-slate-900 text-white flex-col justify-center p-12 lg:p-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-500 to-transparent"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-8">
            <Sparkles size={16} className="text-sky-400" />
            <span>SAKA Platform</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Kembali <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Berpetualang.</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed mb-10">
            Masuk ke akunmu untuk melanjutkan misi belajar bahasa Inggris yang menyenangkan hari ini!
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <ShieldCheck size={20} className="text-emerald-400"/>
            Akses aman dan terenkripsi
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md glass-card p-8 sm:p-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex md:hidden items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-bold mb-6">
              <Sparkles size={14} /> SAKA Platform
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Selamat Datang!</h2>
            <p className="text-slate-500">Silakan masuk ke akun belajarmu.</p>
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  placeholder="Masukkan username"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  placeholder="••••••••"
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <><span>Masuk Sekarang</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-sky-600 font-bold hover:text-sky-700 hover:underline decoration-2 underline-offset-4 transition-all">
              Daftar sekarang
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}