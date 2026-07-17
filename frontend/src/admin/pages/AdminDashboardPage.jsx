import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ExportButton } from '../../components/ExportButton';
import { Users, GraduationCap, Star, CheckCircle, Activity, LayoutDashboard, Loader2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

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
      setStats(response.data || {});
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      showToast.error('Failed to load dashboard stats');
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
        <p className="text-slate-500 font-bold animate-pulse">Memuat data analitik...</p>
      </div>
    );
  }

  const kpis = stats?.kpis || { totalUsers: 0, totalLevels: 0, avgScore: 0, completionRate: 0 };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto"
    >
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <LayoutDashboard className="text-sky-500" size={28} />
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium mt-2">Ringkasan aktivitas dan performa platform SAKA.</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Download size={18} className="text-sky-500" />
            <span>Ekspor Data:</span>
          </div>
          <div className="flex gap-2">
            <ExportButton exportType="users-csv" variant="compact" />
            <ExportButton exportType="leaderboard-csv" variant="compact" />
          </div>
        </motion.div>
      </header>

      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users size={24} />} title="Total Students" value={kpis.totalUsers} color="sky" />
        <StatCard icon={<GraduationCap size={24} />} title="Active Quizzes" value={kpis.totalLevels} color="sky" />
        <StatCard icon={<Star size={24} />} title="Average Score" value={`${kpis.avgScore}%`} color="sky" />
        <StatCard icon={<CheckCircle size={24} />} title="Completion Rate" value={`${kpis.completionRate}%`} color="sky" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div variants={itemVariants} className="glass-card p-5 sm:p-6 bg-white/80">
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-sky-500" /> User Registrations (30 Days)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.registrationData || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold'}} 
                  itemStyle={{color: '#0ea5e9'}}
                />
                <Line type="monotone" dataKey="registrations" stroke="#0ea5e9" strokeWidth={4} dot={false} activeDot={{r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 sm:p-6 bg-white/80">
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Star size={20} className="text-sky-500" /> Performance per Level
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.performanceData || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="level" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold'}} 
                />
                <Bar dataKey="avgScore" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colorMap = {
    sky: 'bg-sky-50 text-sky-500 border-sky-100 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500',
  };

  const shadowMap = {
    sky: 'hover:shadow-sky-500/20',
  };

  return (
    <motion.div 
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      whileHover={{ y: -5 }}
      className={`glass-card bg-white/80 p-5 flex items-center gap-4 transition-all duration-300 group hover:shadow-xl border border-transparent hover:border-${color}-100 ${shadowMap[color]}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors duration-300 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
      </div>
    </motion.div>
  );
}