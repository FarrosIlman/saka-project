import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Trophy, TrendingUp, Award, Loader2, Crown, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { error } = useToast();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await progressAPI.getLeaderboard(limit);
      setLeaderboard(response.data);
    } catch (err) {
      error('Gagal memuat papan peringkat. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return <Crown size={32} className="text-amber-400 fill-amber-200 filter drop-shadow-md" />;
    if (rank === 2) return <Award size={28} className="text-slate-400 fill-slate-200 filter drop-shadow-md" />;
    if (rank === 3) return <Award size={28} className="text-amber-600 fill-amber-700/50 filter drop-shadow-md" />;
    return <span className="text-lg font-black text-slate-400">#{rank}</span>;
  };

  const getRankColors = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300 text-amber-900 shadow-amber-200/50';
    if (rank === 2) return 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-300 text-slate-800 shadow-slate-200/50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300 text-orange-900 shadow-orange-200/50';
    return 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:shadow-sky-100';
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
        <p className="font-bold text-lg animate-pulse">Menyusun Papan Peringkat...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden text-slate-100">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-sky-500/20 mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all active:scale-95 flex-shrink-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <Trophy className="text-amber-400 fill-amber-400/20" size={32} />
                Leaderboard
              </h1>
              <p className="text-sky-300 font-bold text-sm uppercase tracking-widest">Hall of Fame SAKA</p>
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full sm:w-auto bg-white/10 border-2 border-white/20 text-white font-bold py-3 px-5 rounded-xl appearance-none cursor-pointer hover:bg-white/20 focus:outline-none focus:border-sky-400 transition-colors"
            >
              <option value={5} className="bg-slate-800 text-white">Top 5 Players</option>
              <option value={10} className="bg-slate-800 text-white">Top 10 Players</option>
              <option value={20} className="bg-slate-800 text-white">Top 20 Players</option>
              <option value={50} className="bg-slate-800 text-white">Top 50 Players</option>
            </select>
          </div>
        </motion.div>

        {/* Podium for Top 3 (if data exists) */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-16 pt-10">
            {/* Rank 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-col items-center w-28 sm:w-36"
            >
              <div className="text-center mb-2">
                <p className="font-bold text-slate-300 truncate w-full">{leaderboard[1].user.username}</p>
                <p className="text-xs font-black text-slate-400">{leaderboard[1].totalScore} XP</p>
              </div>
              <div className="w-full h-32 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl border-t-4 border-slate-400 flex justify-center pt-4 shadow-[0_0_30px_rgba(148,163,184,0.2)]">
                {getRankMedal(2)}
              </div>
            </motion.div>

            {/* Rank 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex flex-col items-center w-32 sm:w-44 z-10"
            >
              <div className="text-center mb-3">
                <Crown size={24} className="text-amber-400 mx-auto mb-1 animate-bounce" />
                <p className="font-black text-white text-lg truncate w-full">{leaderboard[0].user.username}</p>
                <p className="text-sm font-black text-amber-400">{leaderboard[0].totalScore} XP</p>
              </div>
              <div className="w-full h-44 bg-gradient-to-t from-amber-900/50 to-amber-700/80 rounded-t-2xl border-t-4 border-amber-400 flex justify-center pt-4 shadow-[0_0_40px_rgba(251,191,36,0.4)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
                {getRankMedal(1)}
              </div>
            </motion.div>

            {/* Rank 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col items-center w-28 sm:w-36"
            >
              <div className="text-center mb-2">
                <p className="font-bold text-slate-300 truncate w-full">{leaderboard[2].user.username}</p>
                <p className="text-xs font-black text-orange-400">{leaderboard[2].totalScore} XP</p>
              </div>
              <div className="w-full h-24 bg-gradient-to-t from-orange-950/50 to-orange-800/80 rounded-t-2xl border-t-4 border-orange-500 flex justify-center pt-4 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                {getRankMedal(3)}
              </div>
            </motion.div>
          </div>
        )}

        {/* List View */}
        <div className="glass-card bg-white/95 p-4 sm:p-8">
          <div className="grid grid-cols-12 gap-4 pb-4 border-b-2 border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest px-4">
            <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
            <div className="col-span-5 sm:col-span-5">Pemain</div>
            <div className="col-span-2 hidden sm:flex items-center justify-center gap-2"><Award size={14}/> Level</div>
            <div className="col-span-2 hidden sm:flex items-center justify-center gap-2"><TrendingUp size={14}/> Rata-rata</div>
            <div className="col-span-5 sm:col-span-2 text-right sm:text-center"><Star size={14} className="inline mr-1"/> Total XP</div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <AnimatePresence>
              {leaderboard.map((user, idx) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border-2 transition-transform hover:-translate-y-1 shadow-sm ${getRankColors(user.rank)}`}
                >
                  <div className="col-span-2 sm:col-span-1 flex justify-center items-center">
                    {getRankMedal(user.rank)}
                  </div>
                  
                  <div className="col-span-5 sm:col-span-5 font-black text-base sm:text-lg truncate">
                    {user.user.username}
                  </div>
                  
                  <div className="col-span-2 hidden sm:flex flex-col items-center">
                    <span className="font-black text-lg">{user.completedLevels}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60">Selesai</span>
                  </div>
                  
                  <div className="col-span-2 hidden sm:flex flex-col items-center">
                    <span className="font-black text-lg">{user.avgScore.toFixed(1)}%</span>
                    <span className="text-[10px] font-bold uppercase opacity-60">Akurasi</span>
                  </div>
                  
                  <div className="col-span-5 sm:col-span-2 flex flex-col items-end sm:items-center">
                    <span className="font-black text-lg sm:text-xl text-sky-600 drop-shadow-sm">{user.totalScore}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60">XP</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {leaderboard.length === 0 && !loading && (
            <div className="py-20 text-center">
              <Trophy size={64} className="mx-auto text-slate-300 mb-4" />
              <p className="text-xl font-bold text-slate-500">Belum ada pemain di papan peringkat.</p>
              <p className="text-slate-400 mt-2">Mulai bermain dan jadilah yang pertama!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
