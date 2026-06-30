import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2, Award, Target, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentScoresPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const { userId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentScores();
  }, [userId]);

  const fetchStudentScores = async () => {
    try {
      const response = await adminAPI.getUserProgress(userId);
      setStudentData(response.data);
    } catch (err) {
      console.error('Failed to fetch student scores:', err);
      setError('Failed to load student scores');
      showToast.error('Failed to load student scores');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!studentData || !studentData.levelProgress) return { avgScore: 0, completedLevels: 0, totalLevels: 0 };
    
    const levels = studentData.levelProgress;
    const completedLevels = levels.filter(level => level.status === 'completed').length;
    const totalLevels = levels.length;
    
    const scoresWithValue = levels.filter(level => level.highScore > 0);
    const avgScore = scoresWithValue.length > 0
      ? Math.round(scoresWithValue.reduce((sum, level) => sum + level.highScore, 0) / scoresWithValue.length)
      : 0;

    return { avgScore, completedLevels, totalLevels };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-sky-100 border-sky-200', text: 'text-sky-700', label: 'Completed' },
      unlocked: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'In Progress' },
      locked: { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-400', label: 'Locked' }
    };

    const config = statusConfig[status] || statusConfig.locked;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-sky-500 bg-sky-500';
    if (score >= 60) return 'text-sky-400 bg-sky-400';
    if (score > 0) return 'text-sky-300 bg-sky-300';
    return 'text-slate-300 bg-slate-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="animate-spin text-sky-500" size={48} />
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <ShieldAlert size={64} className="mx-auto text-rose-300 mb-6" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Student Data Not Found</h2>
        <p className="text-slate-500 font-medium mb-8">{error || 'The requested student data could not be loaded.'}</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Users
        </button>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
        <div>
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Users
          </button>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight mb-1">
            <BarChart3 className="text-sky-500" size={32} />
            Performance Report
          </h1>
          <p className="text-slate-500 font-medium">
            Detailed learning progress for <span className="font-bold text-slate-800">@{studentData.user?.username || 'Student'}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="glass-card bg-white p-6 rounded-2xl flex items-center gap-5 border border-slate-200">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-sky-50 text-sky-500 shrink-0">
            <Award size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{stats.avgScore}%</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Average Score</div>
          </div>
        </div>

        <div className="glass-card bg-white p-6 rounded-2xl flex items-center gap-5 border border-slate-200">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-sky-50 text-sky-500 shrink-0">
            <Target size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
              {stats.completedLevels}<span className="text-slate-300 text-xl">/{stats.totalLevels}</span>
            </div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed Levels</div>
          </div>
        </div>

        <div className="glass-card bg-white p-6 rounded-2xl flex items-center gap-5 border border-slate-200">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-sky-50 text-sky-500 shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
              {stats.totalLevels > 0 ? Math.round((stats.completedLevels / stats.totalLevels) * 100) : 0}%
            </div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Progress Rate</div>
          </div>
        </div>
      </div>

      {/* Scores Table */}
      <div className="glass-card bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-900">Level-by-Level Breakdown</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Level</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">High Score</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-full">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentData.levelProgress && studentData.levelProgress.map((level) => {
                const colorClass = getScoreColor(level.highScore);
                const textColorClass = colorClass.split(' ')[0];
                const bgColorClass = colorClass.split(' ')[1];

                return (
                  <tr key={level.levelNumber} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900">Level {level.levelNumber}</div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(level.status)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-xl font-black ${textColorClass}`}>
                        {level.highScore}%
                      </span>
                    </td>
                    <td className="px-6 py-5 w-full min-w-[200px]">
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${level.highScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${bgColorClass}`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {studentData.updatedAt && (
        <div className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          Last updated: {new Date(studentData.updatedAt).toLocaleString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </div>
      )}
    </motion.div>
  );
}