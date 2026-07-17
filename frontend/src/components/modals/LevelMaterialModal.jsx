import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, PlayCircle } from 'lucide-react';

export default function LevelMaterialModal({ isOpen, onClose, level, onStartQuiz }) {
  if (!isOpen || !level) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-sky-500" size={24} />
              Tips Before Starting
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-sky-100 text-sky-600 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2">
                Level {level.levelNumber} • {level.theme}
              </span>
              <h4 className="text-2xl font-black text-slate-900">{level.title}</h4>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-2">
              <h5 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                📖 Vocabulary & Tips
              </h5>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {level.materialText}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-white">
            <button
              onClick={onStartQuiz}
              className="w-full flex justify-center items-center gap-2 py-4 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <PlayCircle size={20} />
              Start Quiz Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
