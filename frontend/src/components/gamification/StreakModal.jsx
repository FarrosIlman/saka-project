import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playFanfare } from '../../utils/audio';

export function StreakModal({ streakData, onClose }) {
  useEffect(() => {
    if (streakData && streakData.increased) {
      playFanfare();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ef4444', '#facc15'],
        zIndex: 1000
      });
    }
  }, [streakData]);

  if (!streakData || !streakData.increased) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full relative shadow-2xl flex flex-col items-center text-center overflow-hidden"
        >
          {/* Background Decor */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

          <button onClick={onClose} className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
          
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-32 h-32 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner relative border-[6px] border-orange-100 z-10"
          >
             <Flame size={72} fill="currentColor" className="text-white drop-shadow-md" />
             
             {/* Sparkles */}
             <motion.div 
               animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} 
               transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
               className="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-full"
             />
             <motion.div 
               animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} 
               transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
               className="absolute bottom-4 left-2 w-2 h-2 bg-yellow-200 rounded-full"
             />
          </motion.div>
          
          <h2 className="text-4xl font-black text-slate-900 mb-2 relative z-10">
            <span className="text-orange-500">{streakData.current}</span> Days
          </h2>
          <h3 className="text-xl font-bold text-slate-700 mb-6 relative z-10">Streak!</h3>
          
          <p className="text-slate-500 font-medium mb-8 text-sm sm:text-base relative z-10">
            Amazing! You've managed to maintain your learning consistency. Don't break it tomorrow!
          </p>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 active:translate-y-0 relative z-10"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
