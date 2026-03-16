import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI, progressAPI } from '../services/api';
import { AchievementBadge } from '../components/AchievementBadge';
import { ExportButton } from '../components/ExportButton';
import { SkeletonCard, SkeletonLoader } from '../components/SkeletonLoader';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, User, Mail, Calendar, Trophy, Target,
  Lock, Eye, EyeOff, Loader2, Save, LogOut, Zap, TrendingUp, Award, Download
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchProgress();
    fetchAchievements();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfileData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Fallback data saat API error
      setProfileData({
        username: user?.username || 'User',
        email: 'user@saka.local',
        createdAt: new Date().toISOString(),
        totallevelsCompleted: 0,
        averageScore: 0,
        streak: 0,
      });
      // Hanya show toast error jika bukan 404
      if (err.status !== 404) {
        showError(err.message || 'Gagal memuat profil');
      }
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await progressAPI.getProgress();
      // Transform data untuk charts
      const chartData = response.data?.levelProgress?.map((level, idx) => ({
        name: `Level ${level.levelNumber}`,
        score: level.highScore || 0,
        status: level.status,
        attempts: level.attempts || 1
      })) || [];
      setProgressData({ levelProgress: chartData, raw: response.data });
    } catch (err) {
      console.error('Failed to load progress:', err);
      setProgressData({ levelProgress: [], raw: null });
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await progressAPI.getAchievements(user._id);
      setAchievements(response.data || []);
    } catch (err) {
      console.error('Failed to load achievements:', err);
      setAchievements([]);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Password baru tidak cocok');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showError('Password minimal 6 karakter');
      return;
    }

    setUpdating(true);
    try {
      await userAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      success('Password berhasil diubah!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      showError(err.message || 'Gagal mengubah password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    success('Berhasil keluar. Sampai jumpa!');
    navigate('/');
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

    :root {
      --primary: #0ea5e9;
      --slate-900: #0f172a;
      --slate-600: #475569;
      --slate-300: #cbd5e1;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .profile-page {
      min-height: 100vh;
      background: #f8fafc;
      padding: 24px;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 40px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .profile-back-btn {
      background: white;
      border: 1px solid #e2e8f0;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #475569;
    }

    .profile-back-btn:hover {
      background: #f1f5f9;
      border-color: var(--primary);
      color: var(--primary);
    }

    .profile-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.04em;
    }

    .profile-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .profile-card {
      background: white;
      border-radius: 24px;
      padding: 32px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
    }

    .card-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--slate-900);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .profile-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .info-item {
      padding: 16px;
      background: #f8fafc;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }

    .info-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 0.05em;
    }

    .info-value {
      font-size: 18px;
      font-weight: 800;
      color: var(--slate-900);
      word-break: break-all;
    }

    .badge-stats {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .stat-badge {
      flex: 1;
      padding: 16px;
      background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
      color: white;
      border-radius: 16px;
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 800;
      display: block;
    }

    .stat-label {
      font-size: 11px;
      font-weight: 700;
      opacity: 0.85;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 700;
      color: var(--slate-600);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-group input {
      width: 100%;
      padding: 12px 16px 12px 16px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      color: var(--slate-900);
      transition: all 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      display: flex;
      padding: 4px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-save {
      background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
    }

    .btn-logout {
      background: #fef2f2;
      color: #e11d48;
      border: 1px solid #fee2e2;
    }

    .btn-logout:hover:not(:disabled) {
      background: #ffebee;
    }

    .success-message {
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      color: #166534;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-skeleton {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 480px) {
      .profile-card {
        padding: 20px;
      }

      .profile-info-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }

    .charts-section {
      margin-top: 40px;
      padding: 24px;
      background: white;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }

    .achievements-section {
      margin-top: 40px;
      padding: 24px;
      background: white;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }

    .charts-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--slate-900);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .chart-container {
      background: #f8fafc;
      border-radius: 16px;
      padding: 20px;
      border: 1px solid #e2e8f0;
    }

    .chart-label {
      font-size: 14px;
      font-weight: 700;
      color: var(--slate-600);
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chart-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #94a3b8;
      text-align: center;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .stat-card {
      background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
      padding: 20px;
      border-radius: 16px;
      color: white;
      text-align: center;
    }

    .stat-card.secondary {
      background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
    }

    .stat-card.success {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    }

    .stat-number {
      font-size: 28px;
      font-weight: 800;
      display: block;
    }

    .stat-name {
      font-size: 12px;
      font-weight: 700;
      opacity: 0.9;
      margin-top: 8px;
      text-transform: uppercase;
    }

    @media (max-width: 768px) {
      .charts-section {
        padding: 16px;
      }

      .achievements-section {
        padding: 16px;
      }

      .charts-grid {
        gap: 24px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .achievements-grid {
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      }
    }

    @media (max-width: 480px) {
      .charts-section {
        padding: 12px;
        margin-top: 20px;
      }

      .charts-title {
        font-size: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  if (loading) {
    return (
      <div className="profile-page">
        <style>{styles}</style>
        <div className="profile-header">
          <div className="profile-back-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <ArrowLeft size={20} />
          </div>
          <h1 className="profile-title">Profil Saya</h1>
        </div>
        <div className="profile-container">
          <SkeletonCard count={3} />
        </div>
      </div>
    );
  }

  const joinDate = profileData?.createdAt 
    ? new Date(profileData.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="profile-page">
      <style>{styles}</style>

      <div className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate('/levels')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="profile-title">Profil Saya</h1>
      </div>

      <div className="profile-container">
        {/* User Info Card */}
        <div className="profile-card">
          <div className="card-title">
            <User size={20} />
            Informasi Akun
          </div>
          <div className="profile-info-grid">
            <div className="info-item">
              <div className="info-label">Username</div>
              <div className="info-value">{profileData?.username}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">{profileData?.email || 'Belum diset'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Bergabung</div>
              <div className="info-value" style={{ fontSize: '14px' }}>{joinDate}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Status</div>
              <div className="info-value" style={{ color: '#10b981' }}>Aktif</div>
            </div>
          </div>

          <div className="badge-stats">
            <div className="stat-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <div className="stat-value">{profileData?.totallevelsCompleted || 0}</div>
              <div className="stat-label">Level Selesai</div>
            </div>
            <div className="stat-badge" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <div className="stat-value">{profileData?.averageScore || 0}%</div>
              <div className="stat-label">Rata-rata Skor</div>
            </div>
            <div className="stat-badge" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
              <div className="stat-value">{profileData?.streak || 0}</div>
              <div className="stat-label">Hari Berturut</div>
            </div>
          </div>
        </div>

        {/* Password Change Card */}
        <div className="profile-card">
          <div className="card-title">
            <Lock size={20} />
            Keamanan
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Password Saat Ini</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value
                  })}
                  placeholder="Masukkan password saat ini"
                  required
                  disabled={updating}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Password Baru</label>
              <div className="input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value
                  })}
                  placeholder="Masukkan password baru (min. 6 karakter)"
                  required
                  disabled={updating}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Konfirmasi Password</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value
                  })}
                  placeholder="Ulangi password baru"
                  required
                  disabled={updating}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-save"
                disabled={updating || !passwordForm.currentPassword || !passwordForm.newPassword}
              >
                {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {updating ? 'Menyimpan...' : 'Simpan Password'}
              </button>
              <button
                type="button"
                className="btn btn-logout"
                onClick={handleLogout}
                disabled={updating}
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          </form>
        </div>

        {/* Export Section */}
        <div className="profile-card">
          <div className="card-title">
            <Download size={20} />
            Ekspor Data
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
            Unduh progress dan pencapaian Anda dalam format CSV atau PDF
          </p>
          <ExportButton exportType="progress-csv" variant="default" />
        </div>

        {/* Progress Visualization Charts */}
        {progressData && progressData.levelProgress.length > 0 && (
          <div className="charts-section">
            <h2 className="charts-title">
              <TrendingUp size={20} />
              Progress Kamu
            </h2>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{profileData?.totallevelsCompleted || 0}</span>
                <span className="stat-name">Level Selesai</span>
              </div>
              <div className="stat-card secondary">
                <span className="stat-number">{profileData?.averageScore || 0}%</span>
                <span className="stat-name">Rata-rata Skor</span>
              </div>
              <div className="stat-card success">
                <span className="stat-number">{profileData?.streak || 0}</span>
                <span className="stat-name">Hari Beruntun</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid" style={{ marginTop: '32px' }}>
              {/* Score by Level Chart */}
              <div className="chart-container">
                <p className="chart-label">Score Per Level</p>
                {progressData.levelProgress.every(l => l.score === 0) ? (
                  <div className="chart-empty">
                    <Award size={32} style={{ opacity: 0.3 }} />
                    <p>Belum ada score. Mulai kuis untuk melihat progress!</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData.levelProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="score" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Level Status Chart */}
              <div className="chart-container">
                <p className="chart-label">Status Level</p>
                {progressData.levelProgress.length === 0 ? (
                  <div className="chart-empty">
                    <TrendingUp size={32} style={{ opacity: 0.3 }} />
                    <p>Data tidak tersedia</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData.levelProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => {
                          if (typeof value === 'string') return value;
                          return value ? value + '%' : '0%';
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={{ fill: '#0ea5e9', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {achievements && (
          <div className="achievements-section">
            <h2 className="charts-title">
              <Trophy size={20} />
              Prestasi Saya
            </h2>

            {achievements.length > 0 ? (
              <div className="achievements-grid">
                {achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement._id}
                    achievement={achievement}
                    isUnlocked={true}
                  />
                ))}
              </div>
            ) : (
              <div className="chart-empty">
                <Trophy size={32} style={{ opacity: 0.3 }} />
                <p>Belum ada prestasi. Selesaikan level untuk membuka prestasi!</p>
              </div>
            )}

            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                💡 Tip: Selesaikan level dengan skor tinggi untuk membuka berbagai prestasi menarik!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

