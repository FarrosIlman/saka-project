import React from 'react';
import { motion } from 'framer-motion';
import { 
  Swords, Zap, Target, Footprints, 
  Trophy, Crown, Flame, CalendarDays, 
  Users, CheckCircle, Lock, Award,
  Moon, Sun, Crosshair, Rocket, GraduationCap,
  Tent, Sparkles, Globe, Map, Coins, HeartPulse, HelpCircle,
  ArrowLeft
} from 'lucide-react';

const IconMap = {
  Swords, Zap, Target, Footprints,
  Trophy, Crown, Flame, CalendarDays,
  Users, CheckCircle, Moon, Sun, Crosshair, 
  Rocket, GraduationCap, Tent, Sparkles, 
  Globe, Map, Coins, HeartPulse
};

const rarityStyles = {
  common: { 
    gradient: 'from-slate-200 to-slate-400', 
    text: 'text-slate-600', 
    border: 'border-slate-300', 
    glow: 'shadow-slate-400/50',
    bg: 'bg-slate-100',
    rim: 'from-slate-100 to-slate-300'
  },
  uncommon: { 
    gradient: 'from-emerald-300 to-teal-500', 
    text: 'text-emerald-700', 
    border: 'border-emerald-400', 
    glow: 'shadow-emerald-400/50',
    bg: 'bg-emerald-50',
    rim: 'from-emerald-100 to-teal-300'
  },
  rare: { 
    gradient: 'from-sky-300 to-indigo-500', 
    text: 'text-sky-700', 
    border: 'border-sky-400', 
    glow: 'shadow-sky-400/50',
    bg: 'bg-sky-50',
    rim: 'from-sky-100 to-indigo-300'
  },
  epic: { 
    gradient: 'from-purple-400 via-fuchsia-500 to-pink-500', 
    text: 'text-fuchsia-800', 
    border: 'border-fuchsia-400', 
    glow: 'shadow-fuchsia-400/50',
    bg: 'bg-fuchsia-50',
    rim: 'from-purple-200 to-pink-300'
  },
  legendary: { 
    gradient: 'from-amber-300 via-yellow-400 to-orange-500', 
    text: 'text-amber-800', 
    border: 'border-amber-400', 
    glow: 'shadow-amber-500/60',
    bg: 'bg-amber-50',
    rim: 'from-yellow-100 to-orange-300'
  },
};

export default function BadgesGallery({ badges = [], onClose }) {
  // Sort badges by rarity and unlock status to display logically
  const sortedBadges = [...badges].sort((a, b) => {
    // Show unlocked first
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    return 0;
  });

  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-sky-200/40 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-600 lg:hidden"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-3">
                <Trophy className="text-amber-400" size={36} /> 
                Galeri Lencana
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Pameran koleksi pencapaian epik yang telah dan akan kamu raih!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shadow-inner">
            <div className="text-center">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                {unlockedCount}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Terkumpul</div>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800">
                {badges.length}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedBadges.map((badge, idx) => (
              <BadgeCard key={`badge-${badge.badgeType}-${idx}`} badge={badge} delay={idx * 0.05} />
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

const BadgeCard = ({ badge, delay }) => {
  const IconComponent = IconMap[badge.icon] || Trophy;
  const isUnlocked = badge.isUnlocked;
  const style = rarityStyles[badge.rarity] || rarityStyles.common;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative rounded-[2rem] p-6 flex flex-col items-center text-center overflow-hidden border-2 transition-all duration-300 bg-white ${
        isUnlocked 
          ? `${style.border} shadow-lg hover:${style.glow}` 
          : 'border-slate-200 shadow-sm'
      }`}
    >
      {/* Background patterned glow based on rarity */}
      <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isUnlocked ? style.gradient : 'from-slate-200 to-transparent'}`}></div>

      {/* Rarity Label / Banner */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 z-20 ${
        isUnlocked 
          ? `${style.bg} ${style.text} ${style.border}`
          : 'bg-slate-100 text-slate-400 border-slate-200'
      }`}>
        {badge.rarity}
      </div>

      {/* Lock Overlay for Locked Badges */}
      {!isUnlocked && (
        <div className="absolute top-4 left-4 p-1.5 bg-slate-100 rounded-full text-slate-400 z-20 shadow-sm border border-slate-200">
          <Lock size={14} strokeWidth={2.5} />
        </div>
      )}

      {/* The Complex Premium Badge Graphic */}
      <div className={`mt-10 mb-8 relative z-10 ${!isUnlocked && 'grayscale opacity-60'}`}>
        
        {/* Outer Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} blur-xl opacity-60 rounded-full scale-125`}></div>
        
        {/* Outer Metallic Ring */}
        <div className={`relative w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr ${style.gradient} shadow-[inset_0_2px_10px_rgba(255,255,255,0.7),0_10px_20px_rgba(0,0,0,0.15)]`}>
          
          {/* Inner metallic rim */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 to-transparent backdrop-blur-sm border border-white/50 shadow-inner"></div>

          {/* Core Geometric Shape (Hexagon) */}
          <div 
            className={`w-[88px] h-[88px] bg-gradient-to-br ${isUnlocked ? style.gradient : 'from-slate-300 to-slate-400'} flex flex-col items-center justify-center shadow-inner relative z-10 overflow-hidden`}
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          >
             {/* Shine Sweep Animation */}
             {isUnlocked && (
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out skew-x-12"></div>
             )}
             
             {/* Inner core for contrast */}
             <div 
                className={`w-[76px] h-[76px] ${isUnlocked ? 'bg-white' : 'bg-slate-50'} flex flex-col items-center justify-center`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
             >
                <IconComponent size={36} className={isUnlocked ? style.text : 'text-slate-400'} strokeWidth={isUnlocked ? 2.5 : 2} />
             </div>
          </div>
          
          {/* Premium Ribbons for higher tiers */}
          {badge.rarity === 'legendary' && (
             <div className="absolute -bottom-3 px-4 py-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-amber-900 text-[10px] font-black uppercase rounded shadow-lg border border-yellow-200 z-20 whitespace-nowrap">
               Legendary
             </div>
          )}
          {badge.rarity === 'epic' && (
             <div className="absolute -bottom-3 px-4 py-1 bg-gradient-to-r from-purple-500 via-fuchsia-300 to-purple-500 text-fuchsia-950 text-[10px] font-black uppercase rounded shadow-lg border border-fuchsia-200 z-20 whitespace-nowrap">
               Epic
             </div>
          )}
          {badge.rarity === 'rare' && (
             <div className="absolute -bottom-2 px-3 py-0.5 bg-gradient-to-r from-sky-400 via-sky-200 to-sky-400 text-sky-900 text-[9px] font-black uppercase rounded-sm shadow-md border border-sky-100 z-20 whitespace-nowrap">
               Rare
             </div>
          )}
        </div>
      </div>
      
      <h3 className={`text-xl font-black mb-2 relative z-10 ${isUnlocked ? 'text-slate-800' : 'text-slate-600'}`}>
        {badge.name}
      </h3>
      
      <p className="text-sm font-medium leading-relaxed mb-6 relative z-10 text-slate-500">
        {badge.description}
      </p>
      
      <div className={`mt-auto w-full pt-4 border-t relative z-10 ${isUnlocked ? 'border-slate-100' : 'border-slate-100 border-dashed'}`}>
        <div className={`text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 ${
          isUnlocked ? 'text-amber-500' : 'text-slate-400'
        }`}>
          {isUnlocked ? <CheckCircle size={14} /> : <Lock size={14} />}
          Reward: +{badge.points} XP
        </div>
      </div>
    </motion.div>
  );
};
