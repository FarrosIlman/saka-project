import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Lock, User, Loader2, Sparkles, ArrowRight } from 'lucide-react';

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

  const styles = `
    .login-page {
      min-height: 100vh;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    /* Background Orbs */
    .bg-decoration {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.3;
      animation: drift 20s infinite alternate ease-in-out;
    }

    .orb-1 { width: 500px; height: 500px; background: #bae6fd; top: -10%; left: -10%; }
    .orb-2 { width: 450px; height: 450px; background: #e0e7ff; bottom: -5%; right: -5%; animation-delay: -5s; }

    @keyframes drift {
      from { transform: translate(0, 0) rotate(0deg); }
      to { transform: translate(60px, 60px) rotate(10deg); }
    }

    /* Main Container */
    .login-container {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 32px;
      padding: 48px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.7);
      z-index: 10;
    }

    .login-header { text-align: center; margin-bottom: 40px; }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f0f9ff;
      border: 1px solid #e0f2fe;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 700;
      color: #0369a1;
      margin-bottom: 24px;
    }

    .login-logo { 
      width: 72px; 
      height: auto; 
      margin-bottom: 20px;
    }

    .login-title {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.05em;
      margin-bottom: 8px;
    }

    .login-subtitle {
      color: #64748b;
      font-size: 16px;
    }

    .form-group { margin-bottom: 24px; }
    
    .label-text {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 10px;
      margin-left: 4px;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
      z-index: 10;
    }

    .login-input {
      width: 100%;
      padding: 16px 52px 16px 52px; /* Space seimbang kiri untuk icon, kanan untuk mata */
      background: #ffffff;
      border: 2px solid #f1f5f9;
      border-radius: 16px;
      font-size: 15px;
      color: #1e293b;
      transition: all 0.3s;
    }

    .login-input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
    }

    /* POSISI MATA YANG PAS */
    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: #94a3b8;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s;
      z-index: 20;
    }

    .password-toggle:hover {
      color: #64748b;
      background: #f1f5f9;
    }

    .btn-login {
      width: 100%;
      margin-top: 8px;
      padding: 18px;
      background: #0f172a;
      color: white;
      border: none;
      border-radius: 18px;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .btn-login:hover:not(:disabled) {
      background: #1e293b;
      transform: translateY(-3px);
      box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.2);
    }

    .login-footer {
      margin-top: 36px;
      text-align: center;
      font-size: 15px;
      color: #64748b;
    }

    .login-footer a {
      color: #0ea5e9;
      text-decoration: none;
      font-weight: 800;
      margin-left: 6px;
    }

    .login-footer a:hover { text-decoration: underline; }

    @media (max-width: 480px) {
      .login-container { padding: 40px 24px; }
    }
  `;

  return (
    <div className="login-page">
      <style>{styles}</style>
      
      <div className="bg-decoration">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="login-container">
        <header className="login-header">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>SAKA Platform</span>
          </div>
          <img 
            src="/assets/images/saka.png" 
            alt="Logo" 
            className="login-logo"
            onError={(e) => (e.target.src = "https://via.placeholder.com/80")} 
          />
          <h1 className="login-title">Selamat Datang</h1>
          <p className="login-subtitle">Silakan masuk ke akun belajar Anda</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label-text">Username</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                className="login-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username anda"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label-text">Password</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <footer className="login-footer">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </footer>
      </div>
    </div>
  );
}