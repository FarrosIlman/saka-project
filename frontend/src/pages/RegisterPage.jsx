import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SakaLogo from '../assets/images/saka.png';
import { Eye, EyeOff, Lock, User, Loader2, Sparkles, UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        showError(result.message);
        setLoading(false);
      } else {
        showSuccess('Pendaftaran berhasil! Mengalihkan ke login...');
        // Navigasi biasanya otomatis melalui useEffect jika context update user, 
        // jika tidak, gunakan: navigate('/login')
      }
    } catch (err) {
      showError("Terjadi kesalahan pendaftaran.");
      setLoading(false);
    }
  };

  const styles = `
    .register-page {
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

    .register-container {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 32px;
      padding: 48px;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.7);
      z-index: 10;
      position: relative;
    }

    .register-header { text-align: center; margin-bottom: 32px; }

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

    .register-logo { width: 72px; height: auto; margin-bottom: 20px; }

    .register-title {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.05em;
      margin-bottom: 8px;
    }

    .register-subtitle {
      color: #64748b;
      font-size: 16px;
    }

    .register-form { display: flex; flex-direction: column; gap: 20px; }
    
    .label-text {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 8px;
      margin-left: 4px;
    }

    .input-wrapper { position: relative; }

    .input-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
      z-index: 10;
    }

    .register-input {
      width: 100%;
      padding: 14px 52px 14px 52px;
      background: #ffffff;
      border: 2px solid #f1f5f9;
      border-radius: 16px;
      font-size: 15px;
      color: #1e293b;
      transition: all 0.3s;
    }

    .register-input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
    }

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

    .btn-register {
      width: 100%;
      margin-top: 10px;
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

    .btn-register:hover:not(:disabled) {
      background: #1e293b;
      transform: translateY(-3px);
      box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.2);
    }

    .btn-register:disabled { opacity: 0.7; cursor: not-allowed; }

    .register-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 15px;
      color: #64748b;
    }

    .register-footer a {
      color: #0ea5e9;
      text-decoration: none;
      font-weight: 800;
      margin-left: 6px;
    }

    .register-tip {
      margin-top: 32px;
      padding: 16px;
      background: rgba(14, 165, 233, 0.05);
      border-radius: 16px;
      font-size: 13px;
      color: #475569;
      text-align: center;
      border: 1px dashed rgba(14, 165, 233, 0.2);
    }

    @media (max-width: 480px) {
      .register-container { padding: 40px 24px; }
      .register-title { font-size: 28px; }
    }
  `;

  return (
    <div className="register-page">
      <style>{styles}</style>
      
      <div className="bg-decoration">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="register-container">
        <header className="register-header">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>SAKA Platform</span>
          </div>
          <img 
            src={SakaLogo} 
            alt="Logo" 
            className="register-logo" 
          />
          <h1 className="register-title">Buat Akun</h1>
          <p className="register-subtitle">Mulai petualangan belajarmu sekarang</p>
        </header>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="label-text">Username</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                className="register-input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Min. 3 karakter"
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
                className="register-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 karakter"
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

          <div className="form-group">
            <label className="label-text">Konfirmasi Password</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                className="register-input"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex="-1"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <footer className="register-footer">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </footer>

        <div className="register-tip">
          <p>💡 <strong>Tips:</strong> Gunakan username yang unik agar pendaftaran lebih lancar.</p>
        </div>
      </div>
    </div>
  );
}