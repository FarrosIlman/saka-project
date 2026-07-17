import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Coins, X, HeartCrack, PlaySquare, Dumbbell } from 'lucide-react';
import { gamificationAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdPlayerModal from './AdPlayerModal';

export default function HeartRefillModal({ isOpen, onClose, userPoints, onRefillSuccess, nextRegenTime }) {
  const { success, error } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [adLoading, setAdLoading] = React.useState(false);
  const [practiceLoading, setPracticeLoading] = React.useState(false);
  const [showAdPlayer, setShowAdPlayer] = React.useState(false);

  if (!isOpen) return null;

  const handleRefill = async () => {
    if (userPoints < 50) {
      error("You don't have enough points to refill lives.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await gamificationAPI.refillHearts();
      if (response.data.success) {
        success('Lives successfully refilled!');
        onRefillSuccess(response.data.hearts, response.data.totalPoints);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to refill lives.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = () => {
    setShowAdPlayer(true);
  };

  const handleAdFinished = async () => {
    setShowAdPlayer(false);
    setAdLoading(true);
    
    try {
      const response = await gamificationAPI.watchAdHeal();
      if (response.data.success) {
        success('Ad finished! +1 Life');
        onRefillSuccess(response.data.hearts, userPoints);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to process ad reward.');
    } finally {
      setAdLoading(false);
    }
  };

  const handlePractice = async () => {
    setPracticeLoading(true);
    // Simulate completing a practice session
    setTimeout(async () => {
      try {
        const response = await gamificationAPI.practiceHeal();
        if (response.data.success) {
          success(`Practice complete! +1 Life (${response.data.practiceCountToday}/3 today)`);
          onRefillSuccess(response.data.hearts, userPoints);
          onClose();
        }
      } catch (err) {
        error(err.response?.data?.message || 'Failed to practice.');
      } finally {
        setPracticeLoading(false);
      }
    }, 2000);
  };

  const formatTimeLeft = () => {
    if (!nextRegenTime) return '';
    const diff = new Date(nextRegenTime).getTime() - Date.now();
    if (diff <= 0) return 'Please wait...';
    
    const minutes = Math.floor(diff / 1000 / 60);
    return `${minutes} minutes left`;
  };

  return (
    <>
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-6 relative z-10">
            <div className="w-20 h-20 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <HeartCrack size={40} className="text-rose-500 drop-shadow-sm" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Out of Lives!</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              You cannot play when you have no lives. Wait for them to regenerate or refill now!
            </p>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <button
              onClick={handleRefill}
              disabled={loading || userPoints < 50}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all ${
                userPoints >= 50
                  ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Heart size={20} fill="currentColor" />
              <span>Refill Lives</span>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-lg ml-auto">
                <Coins size={16} /> 50
              </div>
            </button>

            <button
              onClick={handleWatchAd}
              disabled={adLoading || loading || practiceLoading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all border-2 border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200`}
            >
              <PlaySquare size={20} />
              <span>{adLoading ? 'Watching Ad...' : 'Watch Ad (+1 Life)'}</span>
            </button>

            <button
              onClick={handlePractice}
              disabled={practiceLoading || loading || adLoading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all border-2 border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200`}
            >
              <Dumbbell size={20} />
              <span>{practiceLoading ? 'Practicing...' : 'Practice (+1 Life)'}</span>
              <span className="ml-auto text-xs font-normal opacity-70">Max 3/day</span>
            </button>

            {nextRegenTime && (
              <div className="text-center p-3 bg-slate-50 rounded-xl border-2 border-slate-100">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
                  Or wait for
                </span>
                <span className="text-slate-800 font-bold">
                  {formatTimeLeft()}
                </span>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="w-full mt-2 py-2 text-slate-400 hover:text-slate-600 font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
    
    <AdPlayerModal 
      isOpen={showAdPlayer} 
      onClose={() => setShowAdPlayer(false)}
      onReward={handleAdFinished}
    />
    </>
  );
}
