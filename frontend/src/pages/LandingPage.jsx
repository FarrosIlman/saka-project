import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Rocket, BookOpen, Trophy, Crown, 
  Gamepad2, LayoutDashboard, Flame,
  ChevronRight, Heart, Sparkles, Coins
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate(isAdmin() ? '/admin/dashboard' : '/levels');
    } else {
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center lg:pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-bold text-sky-600 mb-8"
        >
          <Sparkles size={16} />
          <span className="uppercase tracking-wide">Platform Belajar Masa Depan</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6"
        >
          Fasih <span className="text-sky-600">Bahasa Inggris</span> <br className="hidden md:block" /> Lewat SAKA
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 mb-10 font-medium leading-relaxed"
        >
          Smart Application for Kid's Speaking Activity hadir dengan teknologi interaktif untuk membuat belajar bahasa Inggris menjadi efektif dan menyenangkan.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={handleGetStarted} 
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-sky-600 rounded-full hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-600/20 transition-all duration-300 w-full sm:w-auto"
          >
            {user ? 'Lanjut Misi Belajar' : 'Mulai Petualangan'}
            <Rocket size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          {!user && (
            <button 
              onClick={() => navigate('/login')}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 w-full sm:w-auto"
            >
              Masuk Akun
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-5xl mx-auto px-4 mt-4 mb-24"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 p-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {[
            { val: "Multi-Level", lbl: "Misi Bertahap" },
            { val: "Gamified", lbl: "Sistem Poin & XP" },
            { val: "Leaderboard", lbl: "Kompetisi Global" },
            { val: "Daily Streak", lbl: "Hadiah Harian" },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col gap-1 pt-4 md:pt-0">
              <span className="text-2xl font-black text-slate-800">{stat.val}</span>
              <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">{stat.lbl}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight mb-4">Kenapa Memilih SAKA?</h2>
          <p className="text-base font-medium text-slate-500 max-w-2xl mx-auto">Dirancang menggunakan standar UI/UX modern untuk memberikan pengalaman belajar terbaik yang elegan dan fokus.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <FeatureCard 
            icon={<BookOpen size={28}/>} 
            title="Materi Kuis Berjenjang" 
            desc="Kurikulum bertingkat dari level dasar hingga mahir yang membantu siswa menguasai Bahasa Inggris secara bertahap." 
          />
          <FeatureCard 
            icon={<Flame size={28}/>} 
            title="Daily Streak & Rewards" 
            desc="Login dan selesaikan misi setiap hari untuk mempertahankan rentetan api (streak) dan dapatkan bonus menarik." 
          />
          <FeatureCard 
            icon={<Coins size={28}/>} 
            title="Sistem Ekonomi Poin" 
            desc="Kumpulkan Poin dan XP dari setiap jawaban benar untuk memanjat papan peringkat." 
          />
          <FeatureCard 
            icon={<Heart size={28}/>} 
            title="Sistem Nyawa Dinamis" 
            desc="Bermain butuh nyawa! Jika kehabisan, kamu bisa memulihkannya dengan menonton iklan atau berlatih soal." 
          />
          <FeatureCard 
            icon={<Crown size={28}/>} 
            title="Papan Peringkat Global" 
            desc="Berkompetisi dengan teman-teman dari seluruh sekolah untuk meraih posisi puncak di Leaderboard." 
          />
          <FeatureCard 
            icon={<LayoutDashboard size={28}/>} 
            title="Dashboard Admin" 
            desc="Panel kontrol canggih bagi guru/admin untuk manajemen kuis, level, dan melihat aktivitas siswa." 
          />
        </motion.div>
      </div>

      {/* Footer CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-20 max-w-5xl mx-auto px-4 mb-20"
      >
        <div className="bg-slate-900 rounded-[2.5rem] px-6 py-16 sm:px-12 sm:py-20 text-center relative overflow-hidden shadow-xl shadow-slate-900/10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Siap Memulai Petualangan?</h2>
            <p className="text-slate-400 text-base mb-10 max-w-xl mx-auto font-medium">Bergabung sekarang dan jadikan proses belajar bahasa Inggris pengalaman yang tak terlupakan dan efektif.</p>
            <button 
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 text-white text-base font-bold rounded-full hover:bg-sky-400 hover:-translate-y-1 transition-all duration-300"
            >
              Mulai Sekarang Gratis <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-100 transition-all duration-300"
  >
    <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
  </motion.div>
);