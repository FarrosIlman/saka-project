import React, { useState, useEffect } from 'react';
import { Trophy, Medal, User as UserIcon, Loader2 } from 'lucide-react';
import api from '../../services/api';

const LeaderboardWidget = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/gamification/leaderboard');
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={18} className="text-amber-500" />;
    if (index === 1) return <Medal size={18} className="text-slate-400" />;
    if (index === 2) return <Medal size={18} className="text-amber-700" />;
    return <span className="text-sm font-bold text-slate-400 w-[18px] text-center">{index + 1}</span>;
  };

  const renderPodium = () => {
    if (leaderboard.length < 3) return null;
    const top3 = [leaderboard[1], leaderboard[0], leaderboard[2]];
    const heights = ['h-24', 'h-32', 'h-20'];
    const colors = ['bg-slate-300', 'bg-amber-400', 'bg-orange-400']; // Silver, Gold, Bronze
    const rankNum = [2, 1, 3];
    
    return (
      <div className="flex items-end justify-center gap-2 sm:gap-4 mb-8 mt-8 h-48 px-2">
        {top3.map((user, i) => (
          <div key={user._id} className="flex flex-col items-center flex-1 max-w-[100px]">
            <div className="relative mb-2">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 text-white overflow-hidden border-4 shadow-md z-10 relative ${i===1?'border-amber-200 bg-amber-500':i===0?'border-slate-200 bg-slate-400':'border-orange-200 bg-orange-500'}`}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={24} />
                )}
              </div>
              {i === 1 && (
                <div className="absolute -top-5 -right-3 text-amber-500 transform rotate-12 drop-shadow-md">
                  <Trophy size={28} fill="currentColor" />
                </div>
              )}
            </div>
            
            <p className="text-[10px] sm:text-xs font-bold text-slate-700 truncate w-full text-center px-1 mb-1">{user.username}</p>
            <p className="text-[10px] font-black text-sky-500 mb-2">{user.totalXP} XP</p>
            
            <div className={`w-full ${heights[i]} ${colors[i]} rounded-t-xl flex justify-center pt-2 shadow-inner relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/20"></div>
              <span className="font-black text-white/90 text-2xl z-10">{rankNum[i]}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card p-6 mb-6">
      <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-6">
        <Trophy size={22} className="text-amber-500" /> Leaderboard (Top 10)
      </h3>

      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin text-sky-500" />
        </div>
      ) : leaderboard.length === 0 ? (
        <p className="text-sm text-slate-500 text-center">No data yet.</p>
      ) : (
        <>
          {renderPodium()}
          <div className="flex flex-col gap-3">
            {(leaderboard.length >= 3 ? leaderboard.slice(3) : leaderboard).map((user, index) => {
              const actualIndex = leaderboard.length >= 3 ? index + 3 : index;
              return (
              <div key={user._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-6 flex justify-center flex-shrink-0">
                  {getRankIcon(actualIndex)}
                </div>
                
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-sky-500 overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-black text-sky-500">{user.totalXP || 0} XP</span>
                    {user.currentStreak > 0 && (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        🔥 {user.currentStreak}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardWidget;
