import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Coins, X, HeartCrack } from 'lucide-react';
import { gamificationAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function HeartRefillModal({ isOpen, onClose, userPoints, onRefillSuccess, nextRegenTime }) {
  const { success, error } = useToast();
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleRefill = async () => {
    if (userPoints < 50) {
      error('Poin kamu tidak cukup untuk mengisi nyawa.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await gamificationAPI.refillHearts();
      if (response.data.success) {
        success('Nyawa berhasil diisi penuh!');
        onRefillSuccess(response.data.hearts, response.data.totalPoints);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Gagal mengisi nyawa.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = () => {
    if (!nextRegenTime) return '';
    const diff = new Date(nextRegenTime).getTime() - Date.now();
    if (diff <= 0) return 'Tunggu sebentar...';
    
    const minutes = Math.floor(diff / 1000 / 60);
    return `${minutes} menit lagi`;
  };

  return (
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
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nyawa Habis!</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Kamu tidak bisa bermain saat nyawa kosong. Tunggu nyawa pulih atau isi ulang sekarang!
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
              <span>Isi Penuh Nyawa</span>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-lg ml-auto">
                <Coins size={16} /> 50
              </div>
            </button>

            {nextRegenTime && (
              <div className="text-center p-3 bg-slate-50 rounded-xl border-2 border-slate-100">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
                  Atau tunggu selama
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
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
