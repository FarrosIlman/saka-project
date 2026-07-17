import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Gift, Loader2, Target, CalendarDays } from 'lucide-react';

export default function DailyQuestsWidget() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await gamificationAPI.getDailyQuests();
      setQuests(response.data.quests || []);
    } catch (err) {
      console.error('Error fetching quests:', err);
    } finally {
      setLoading(false);
    }
  };

  const claimQuest = async (questId) => {
    try {
      const response = await gamificationAPI.claimQuestReward(questId);
      if (response.data.success) {
        success(`Successfully claimed! +${response.data.xpGained} XP`);
        setQuests(response.data.quests);
      }
    } catch (err) {
      error('Failed to claim quest reward.');
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex justify-center items-center h-48">
        <Loader2 className="animate-spin text-sky-500" size={30} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="bg-slate-900 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <h3 className="relative z-10 flex items-center gap-2 text-lg font-black text-white">
          <CalendarDays size={20} className="text-sky-400" /> 
          Daily Quests
        </h3>
        <p className="relative z-10 text-slate-400 text-xs font-medium mt-1">
          Complete quests for extra XP! Resets daily.
        </p>
      </div>

      <div className="p-5 flex flex-col gap-4 bg-white/50">
        {quests.length === 0 ? (
          <p className="text-center text-sm font-bold text-slate-400 py-4">No quests available today.</p>
        ) : (
          quests.map((quest) => {
            const isCompleted = quest.isCompleted;
            const isClaimed = quest.isClaimed;
            const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

            return (
              <div 
                key={quest._id} 
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isClaimed ? 'bg-slate-50 border-slate-200 opacity-60' :
                  isCompleted ? 'bg-emerald-50 border-emerald-200' :
                  'bg-white border-slate-100 hover:border-sky-200 hover:bg-sky-50/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className={`font-bold text-sm ${isClaimed ? 'text-slate-500' : 'text-slate-800'}`}>
                      {quest.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[10px] font-black tracking-wide">
                      +{quest.rewardXP} XP
                    </span>
                  </div>
                  {isClaimed ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : isCompleted ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => claimQuest(quest._id)}
                      className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-600 shadow-md shadow-emerald-500/30"
                    >
                      <Gift size={14} /> Claim
                    </motion.button>
                  ) : (
                    <Target size={20} className="text-slate-300" />
                  )}
                </div>

                {!isClaimed && (
                  <div className="mt-3">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                      <span className={`text-[11px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-sky-500'}`}>
                        {quest.progress} / {quest.target}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-sky-500'}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
