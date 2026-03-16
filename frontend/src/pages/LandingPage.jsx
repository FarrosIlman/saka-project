import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, BookOpen, Mic2, BarChart3, 
  Gamepad2, LayoutDashboard, Palette, 
  ChevronRight, Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate(isAdmin() ? '/admin/dashboard' : '/levels');
    } else {
      navigate('/login');
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :root {
      --primary: #0ea5e9;
      --slate-900: #0f172a;
      --slate-600: #475569;
      --slate-200: #e2e8f0;
      --glass-bg: rgba(255, 255, 255, 0.6);
      --glass-border: rgba(255, 255, 255, 0.8);
    }

    * {
      margin: 0; padding: 0; box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    body {
      background: #fcfcfd;
      color: var(--slate-900);
      overflow-x: hidden;
    }

    .bg-decoration {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      z-index: -1; pointer-events: none;
    }
    .orb {
      position: absolute; border-radius: 50%; filter: blur(120px);
      opacity: 0.3; animation: drift 15s infinite alternate;
    }
    .orb-1 { width: 600px; height: 600px; background: #bae6fd; top: -15%; left: -10%; }
    .orb-2 { width: 500px; height: 500px; background: #e0e7ff; bottom: -10%; right: -5%; }

    @keyframes drift {
      from { transform: translate(0, 0); }
      to { transform: translate(40px, 40px); }
    }

    .hero-section {
      padding: 100px 24px 60px;
      text-align: center;
      display: flex; flex-direction: column; align-items: center;
    }

    .hero-tag {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; background: #fff;
      border: 1px solid var(--slate-200); border-radius: 100px;
      font-size: 12px; font-weight: 600; color: var(--slate-600);
      margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }

    .hero-title {
      font-size: clamp(32px, 8vw, 72px);
      font-weight: 800; line-height: 1.1;
      letter-spacing: -0.05em; color: var(--slate-900);
      margin-bottom: 12px;
    }

    .hero-subtitle {
      font-size: clamp(14px, 2vw, 20px);
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 24px;
      padding: 0 20px;
    }

    .hero-description {
      font-size: clamp(16px, 2vw, 18px); color: var(--slate-600);
      max-width: 600px; margin: 0 auto 40px;
      line-height: 1.6;
    }

    .btn-main {
      padding: 14px 32px; border-radius: 14px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      transition: all 0.2s; display: flex;
      align-items: center; gap: 10px; border: none;
    }

    .btn-primary { background: var(--slate-900); color: white; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

    .btn-outline {
      background: #fff; color: var(--slate-900);
      border: 1px solid var(--slate-200);
    }

    /* Stats Bar - Mobile Friendly */
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      justify-content: center; 
      gap: 20px;
      padding: 40px 24px; background: var(--glass-bg);
      backdrop-filter: blur(10px); border-y: 1px solid var(--slate-200);
    }

    .stat-card { text-align: center; }
    .stat-val { display: block; font-size: clamp(18px, 3vw, 24px); font-weight: 800; color: var(--primary); }
    .stat-lbl { font-size: 10px; color: var(--slate-600); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

    .section { padding: 60px 24px; max-width: 1200px; margin: 0 auto; }

    /* Features Grid Responsive */
    .grid-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .f-card {
      padding: 30px; background: #fff;
      border: 1px solid #f1f5f9; border-radius: 24px;
      transition: all 0.3s ease;
      display: flex; flex-direction: column; height: 100%;
    }

    .f-card:hover {
      border-color: var(--primary); transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.04);
    }

    .f-icon {
      width: 44px; height: 44px; background: #f0f9ff;
      color: var(--primary); border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }

    .f-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
    .f-card p { font-size: 14px; color: var(--slate-600); line-height: 1.5; }

    .audience-box {
      background: var(--glass-bg);
      backdrop-filter: blur(25px) saturate(160%);
      border: 1px solid var(--glass-border);
      border-radius: 32px; padding: 60px 40px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
    }

    .a-card h3 { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
    .a-card p { color: var(--slate-600); font-size: 15px; line-height: 1.6; }

    footer {
      text-align: center; padding: 40px 24px; color: var(--slate-600);
      font-size: 12px; font-weight: 500; border-top: 1px solid #f1f5f9;
    }

    /* MEDIA QUERIES FOR MOBILE RESPONSIVENESS */
    @media (max-width: 1024px) { 
      .grid-features { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) { 
      .hero-section { padding-top: 60px; }
      .grid-features { grid-template-columns: 1fr; }
      .audience-box { grid-template-columns: 1fr; border-radius: 24px; padding: 40px 24px; gap: 30px; }
      .stats-bar { grid-template-columns: repeat(2, 1fr); gap: 30px; }
      
      .btn-main { width: 100%; justify-content: center; }
      .cta-group { flex-direction: column; width: 100%; max-width: 300px; }
    }

    @media (max-width: 480px) {
      .stats-bar { grid-template-columns: 1fr; }
      .hero-tag { font-size: 10px; }
      .hero-subtitle { letter-spacing: 0.05em; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      
      <div className="bg-decoration">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="landing-page">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-tag">
            <Sparkles size={14} style={{color: '#0ea5e9'}} />
            <span>SAKA &bull; Speaking Activity Platform</span>
          </div>
          
          <h1 className="hero-title">SAKA Project</h1>
          <h2 className="hero-subtitle">Smart Application for Kid's Speaking Activity</h2>
          
          <p className="hero-description">
            Platform edukasi digital untuk mengelola kegiatan berbicara Bahasa Inggris secara interaktif antara Guru dan Siswa.
          </p>

          <div className="cta-group" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleGetStarted} className="btn-main btn-primary">
              <Rocket size={18} />
              {user ? 'Dashboard' : 'Mulai Sekarang'}
            </button>
            {!user && (
              <button className="btn-main btn-outline" onClick={() => navigate('/login')}>
                Masuk
              </button>
            )}
          </div>
        </section>

        {/* STATS BAR */}
        <div className="stats-bar">
          <StatItem val="Interactive" lbl="Method" />
          <StatItem val="Structured" lbl="Curriculum" />
          <StatItem val="Real-time" lbl="Analysis" />
          <StatItem val="Admin" lbl="Control" />
        </div>

        {/* FEATURES */}
        <section className="section">
          <div className="grid-features">
            <FeatureCard 
              icon={<BookOpen size={20}/>} 
              title="Level Mastery" 
              desc="Kurikulum bertingkat yang membantu siswa menguasai materi secara bertahap." 
            />
            <FeatureCard 
              icon={<Mic2 size={20}/>} 
              title="Speaking Lab" 
              desc="Ruang latihan khusus untuk mengasah kelancaran pengucapan Bahasa Inggris." 
            />
            <FeatureCard 
              icon={<Gamepad2 size={20}/>} 
              title="Gamified Experience" 
              desc="Meningkatkan motivasi belajar melalui sistem poin dan progres interaktif." 
            />
            <FeatureCard 
              icon={<BarChart3 size={20}/>} 
              title="Data Analytics" 
              desc="Pantau grafik perkembangan kemampuan berbicara siswa secara real-time." 
            />
            <FeatureCard 
              icon={<LayoutDashboard size={20}/>} 
              title="Teacher Control" 
              desc="Kelola distribusi materi dan pantau aktivitas kelas dalam satu dashboard." 
            />
            <FeatureCard 
              icon={<Palette size={20}/>} 
              title="Creative Content" 
              desc="Materi pembelajaran visual yang dirancang khusus untuk usia sekolah." 
            />
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="section" style={{paddingTop: 0}}>
          <div className="audience-box">
            <div className="a-card">
              <span style={{fontSize: '32px', marginBottom: '16px', display: 'block'}}>👦</span>
              <h3>Student</h3>
              <p>Selesaikan tantangan Speaking Activity dan lihat peningkatan kemampuan bicaramu di setiap level.</p>
            </div>
            <div className="a-card">
              <span style={{fontSize: '32px', marginBottom: '16px', display: 'block'}}>👨‍🏫</span>
              <h3>Admin / Guru</h3>
              <p>Monitor hasil latihan siswa secara real-time dan kendalikan aktivitas kelas dalam satu panel.</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="section" style={{textAlign: 'center', paddingBottom: '80px'}}>
          <h2 style={{fontSize: '28px', fontWeight: 800, marginBottom: '32px'}}>Siap mulai belajar?</h2>
          <button onClick={handleGetStarted} className="btn-main btn-primary" style={{margin: '0 auto', padding: '16px 48px'}}>
            Coba SAKA Sekarang
            <ChevronRight size={18} />
          </button>
        </section>

        <footer>
          &copy; 2026 SAKA System &bull; Pekalongan, Indonesia
        </footer>
      </div>
    </>
  );
}

const StatItem = ({ val, lbl }) => (
  <div className="stat-card">
    <span className="stat-val">{val}</span>
    <span className="stat-lbl">{lbl}</span>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="f-card">
    <div className="f-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);