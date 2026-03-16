import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ExportButton } from '../../components/ExportButton';
import { Users, GraduationCap, Star, CheckCircle, Activity, LayoutDashboard, Loader2, Download } from 'lucide-react';

export default function AdminDashboardPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      // Pastikan response.data ada isinya
      setStats(response.data || {});
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      showToast.error('Failed to load dashboard stats');
      setStats({}); // Set empty object agar tidak null
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    .dashboard-container {
      padding: 30px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dashboard-header { margin-bottom: 32px; }
    .dashboard-title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .kpi-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-info h4 { font-size: 13px; font-weight: 600; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-info .value { font-size: 20px; font-weight: 800; color: #0f172a; }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 24px;
    }

    .chart-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 24px;
    }

    .chart-card h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

    @media (max-width: 768px) {
      .dashboard-container { padding: 20px; }
      .charts-grid { grid-template-columns: 1fr; }
    }
  `;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <Loader2 className="animate-spin text-sky-500" size={40} />
      </div>
    );
  }

  // Jika data KPIS tidak ada, berikan nilai default agar tidak error
  const kpis = stats?.kpis || { totalUsers: 0, totalLevels: 0, avgScore: 0, completionRate: 0 };

  return (
    <div className="dashboard-container">
      <style>{styles}</style>
      
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <LayoutDashboard className="text-sky-500" size={28} />
          Dashboard Overview
        </h1>
        
        {/* Export Section */}
        <div style={{ marginTop: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
          <p style={{ color: '#0c4a6e', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            <Download size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Ekspor Data
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ExportButton exportType="users-csv" variant="compact" />
            <ExportButton exportType="leaderboard-csv" variant="compact" />
          </div>
        </div>
      </header>

      <div className="kpi-grid">
        <StatCard icon={<Users size={20} />} title="Students" value={kpis.totalUsers} bg="#f0f9ff" color="#0ea5e9" />
        <StatCard icon={<GraduationCap size={20} />} title="Quizzes" value={kpis.totalLevels} bg="#ecfdf5" color="#10b981" />
        <StatCard icon={<Star size={20} />} title="Avg Score" value={`${kpis.avgScore}%`} bg="#fffbeb" color="#f59e0b" />
        <StatCard icon={<CheckCircle size={20} />} title="Completion" value={`${kpis.completionRate}%`} bg="#f0f9ff" color="#0ea5e9" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><Activity size={18} className="text-sky-500" /> User Registrations</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={stats?.registrationData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="registrations" stroke="#0ea5e9" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3><Star size={18} className="text-amber-500" /> Performance per Level</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stats?.performanceData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="level" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="avgScore" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, bg, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-wrapper" style={{ backgroundColor: bg, color: color }}>
        {icon}
      </div>
      <div className="kpi-info">
        <h4>{title}</h4>
        <div className="value">{value}</div>
      </div>
    </div>
  );
}