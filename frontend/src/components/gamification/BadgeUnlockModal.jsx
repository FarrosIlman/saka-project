import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playFanfare } from '../../utils/audio';

export function BadgeUnlockModal({ badges, onClose }) {
  useEffect(() => {
    if (badges && badges.length > 0) {
      playFanfare();
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#0ea5e9', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'],
        zIndex: 1000
      });
    }
  }, [badges]);

  if (!badges || badges.length === 0) return null;

  // Metadata map for common badges
  const getBadgeMeta = (id) => {
    const meta = {
      first_blood: { emoji: '🎉', name: 'First Blood', points: 10 },
      marathon: { emoji: '🏃', name: 'Marathon', points: 50 },
      perfect_score: { emoji: '🎯', name: 'Perfect Score', points: 20 },
      fast_learner: { emoji: '⚡', name: 'Fast Learner', points: 15 },
      weekend_warrior: { emoji: '🎮', name: 'Weekend Warrior', points: 25 },
      night_owl: { emoji: '🦉', name: 'Night Owl', points: 15 }
    };
    return meta[id] || { emoji: '⭐', name: id.replace(/_/g, ' '), points: 10 };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm w-full relative shadow-2xl flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6 shadow-inner relative border-4 border-white">
             <Trophy size={48} className="text-amber-500 drop-shadow-md" />
             <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-rose-500/40 animate-bounce">
               BARU!
             </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight">Lencana Terbuka!</h2>
          <p className="text-slate-500 font-medium mb-8 text-sm sm:text-base">
            Luar biasa! Kamu baru saja mendapatkan {badges.length} lencana baru.
          </p>

          <div className="flex flex-col gap-3 w-full mb-8 max-h-[40vh] overflow-y-auto px-1 hide-scrollbar">
            {badges.map((badgeId, i) => {
              const meta = getBadgeMeta(badgeId);
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  key={i} 
                  className="flex items-center gap-4 bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl"
                >
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-slate-100">
                     {meta.emoji}
                   </div>
                   <div className="flex flex-col items-start">
                     <h3 className="font-black text-slate-800 capitalize text-sm">
                       {meta.name}
                     </h3>
                     <span className="text-xs font-bold text-amber-500">+{meta.points} Poin</span>
                   </div>
                </motion.div>
              );
            })}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-sky-500 text-white font-black rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-1 active:translate-y-0"
          >
            Lanjutkan Kuis
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
