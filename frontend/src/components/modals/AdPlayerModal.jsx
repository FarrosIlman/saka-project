import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Loader2, Volume2, ShieldAlert } from 'lucide-react';

export default function AdPlayerModal({ isOpen, onClose, onReward }) {
  const AD_DURATION = 10; // 10 seconds simulation
  const [timeLeft, setTimeLeft] = useState(AD_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setTimeLeft(AD_DURATION);
      setIsPlaying(true);
      setShowExitWarning(false);
      
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsPlaying(false);
            onReward(); // Grant reward when timer hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, onReward]);

  const handleAttemptClose = () => {
    if (timeLeft > 0) {
      setShowExitWarning(true);
    } else {
      onClose();
    }
  };

  const confirmExit = () => {
    setShowExitWarning(false);
    onClose(); // Close without reward
  };

  const resumeAd = () => {
    setShowExitWarning(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2 text-white/80">
            <Volume2 size={20} />
            <span className="text-sm font-medium">Sponsored Advertisement</span>
          </div>
          
          <div className="flex items-center gap-4">
            {timeLeft > 0 ? (
              <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full font-bold tabular-nums border border-white/10">
                Reward in {timeLeft}s
              </div>
            ) : (
              <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full font-bold">
                Reward Granted!
              </div>
            )}
            
            <button 
              onClick={handleAttemptClose}
              className="bg-black/50 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Video Player Area (Simulated) */}
        <div className="w-full max-w-4xl aspect-video bg-slate-900 relative rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center justify-center text-slate-500">
          
          <motion.div
            animate={{ scale: isPlaying && !showExitWarning ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-4"
          >
            {isPlaying && !showExitWarning ? (
              <PlayCircle size={64} className="text-indigo-500 opacity-50" />
            ) : timeLeft === 0 ? (
              <div className="text-emerald-500 flex flex-col items-center">
                <ShieldAlert size={64} className="mb-2" />
                <span className="text-xl font-bold text-white">Ad Finished</span>
              </div>
            ) : (
              <Loader2 size={64} className="animate-spin text-slate-600" />
            )}
          </motion.div>
          
          {isPlaying && !showExitWarning && (
            <p className="text-lg font-medium text-slate-400">
              Simulating an interactive ad...
            </p>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: showExitWarning ? 'auto' : `${((AD_DURATION - timeLeft) / AD_DURATION) * 100}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
        </div>

        {/* Exit Warning Modal */}
        <AnimatePresence>
          {showExitWarning && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4"
            >
              <div className="bg-slate-900 p-8 rounded-3xl max-w-sm w-full text-center border border-slate-700 shadow-2xl">
                <ShieldAlert size={48} className="text-rose-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Close Ad?</h3>
                <p className="text-slate-400 mb-6">
                  You will lose your reward if you close this video now. Are you sure?
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={confirmExit}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    Close Ad
                  </button>
                  <button 
                    onClick={resumeAd}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    Keep Watching
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
