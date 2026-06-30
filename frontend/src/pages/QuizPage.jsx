import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { levelAPI, progressAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import CommentSection from '../components/discussion/CommentSection';
import stringSimilarity from 'string-similarity';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, ChevronRight, CheckCircle2, 
  XCircle, AlertCircle, ArrowLeft, Loader2, Play, Pause, Square, Volume2, Sparkles, Trophy
} from 'lucide-react';

export default function QuizPage() {
  const { levelNumber } = useParams();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => { fetchQuestions(); }, [levelNumber]);

  const fetchQuestions = async () => {
    try {
      const response = await levelAPI.getLevelQuestions(levelNumber);
      setQuestions(response.data.questions || []);
      setLoading(false);
    } catch (err) {
      error('Gagal memuat kuis.');
      navigate('/levels');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const speakQuestion = useCallback(() => {
    if (!currentQuestion) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.volume = volume;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [currentQuestion, volume]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      error('Browser tidak mendukung Speech Recognition.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processVoiceAnswer(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const processVoiceAnswer = (transcript) => {
    if (!currentQuestion) return;
    const similarities = currentQuestion.options.map((option) =>
      stringSimilarity.compareTwoStrings(transcript.toLowerCase(), option.toLowerCase())
    );
    const maxSimilarity = Math.max(...similarities);
    const matchedIndex = similarities.indexOf(maxSimilarity);
    if (maxSimilarity >= 0.7) { checkAnswer(currentQuestion.options[matchedIndex]); } 
    else { setFeedback(`Kamu bilang: "${transcript}". Coba lagi.`); }
  };

  const checkAnswer = async (option) => {
    setSelectedOption(option);
    try {
      const response = await levelAPI.checkAnswer({ questionId: currentQuestion._id, selectedOption: option });
      setCorrectAnswer(response.data.correctAnswer);
      setAnswered(true);
      if (response.data.correct) { 
        setFeedback('Luar Biasa! Jawaban Benar. ✨'); 
        setScore(score + 1); 
      } else { 
        setFeedback('Belum Tepat, Ayo Coba Lagi!'); 
        handleIncorrectAnswer(); 
      }
    } catch (err) { error('Gagal memeriksa jawaban.'); }
  };

  const handleIncorrectAnswer = () => {
    const newCount = incorrectAttempts + 1;
    setIncorrectAttempts(newCount);
    if (newCount >= 3) { setTimeout(() => endQuiz(true), 2000); }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswered(false);
      setSelectedOption('');
      setFeedback('');
    } else { endQuiz(false); }
  };

  const endQuiz = async (failed) => {
    if (failed) { warning('Kesempatan habis!'); navigate('/levels'); return; }
    const finalScore = Math.round((score / questions.length) * 100);
    try {
      await progressAPI.completeLevel({ levelNumber: Number(levelNumber), score: finalScore });
      success(`Selesai! Skormu: ${finalScore}%`);
      navigate('/levels');
    } catch (err) { navigate('/levels'); }
  };

  if (loading || (questions.length > 0 && !currentQuestion)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-sky-500" size={50} />
        <p className="mt-4 text-slate-500 font-bold animate-pulse">Menyiapkan Misi...</p>
      </div>
    );
  }

  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="relative min-h-screen bg-slate-50 bg-grid-pattern overflow-x-hidden flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 pb-24">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-sky-200/40 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col gap-6">
        
        {/* Header / Progress Bar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 sm:gap-6 w-full mb-2"
        >
          <button 
            onClick={() => navigate('/levels')} 
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Progres Kuis</span>
              <span className="text-xs font-black text-sky-500">{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full p-1 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
              />
            </div>
          </div>
          
          {/* Hearts / Lives */}
          <div className="flex-shrink-0 flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <XCircle 
                  size={28} 
                  className={`transition-colors duration-300 ${i < incorrectAttempts ? 'text-rose-500 fill-rose-100' : 'text-slate-300 fill-slate-200/50'}`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Quiz Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full glass-card p-6 sm:p-8 relative"
          >
            {/* Image Container */}
            <div className="relative w-full h-48 sm:h-64 rounded-3xl overflow-hidden mb-8 border-4 border-white shadow-md bg-slate-100">
              {currentQuestion?.imageUrl ? (
                <img src={currentQuestion.imageUrl} alt="Quiz" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <span className="font-bold">No Image</span>
                </div>
              )}
              
              {/* Audio Controls over image */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl flex items-center gap-3 shadow-lg border border-white/50">
                <Volume2 size={20} className="text-slate-500" />
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))} 
                  className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" 
                />
                <button 
                  onClick={isPlaying ? () => window.speechSynthesis.cancel() : speakQuestion}
                  className="w-10 h-10 flex items-center justify-center bg-sky-500 text-white rounded-xl hover:bg-sky-600 active:scale-95 transition-all shadow-md shadow-sky-500/30"
                >
                  {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1.5 bg-sky-50 border border-sky-100 rounded-full text-sky-600 font-bold text-xs mb-4 uppercase tracking-wider">
                Level {levelNumber}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {currentQuestion?.questionText}
              </h2>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {currentQuestion?.options.map((option, idx) => {
                const isCorrect = answered && option === correctAnswer;
                const isWrong = answered && selectedOption === option && option !== correctAnswer;
                
                return (
                  <motion.button 
                    key={idx} 
                    disabled={answered} 
                    onClick={() => checkAnswer(option)}
                    whileHover={!answered ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    className={`
                      relative flex items-center justify-between p-5 rounded-2xl font-bold text-left transition-all duration-300 border-2 shadow-[0_4px_0_0_transparent]
                      ${isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-500/30' : 
                        isWrong ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-rose-500/30' : 
                        'bg-white border-slate-200 text-slate-600 hover:border-sky-400 hover:bg-sky-50 shadow-slate-200'}
                    `}
                  >
                    <span className="text-lg">{option}</span>
                    {isCorrect && <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />}
                    {isWrong && <XCircle size={24} className="text-rose-500 flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Microphone Interaction */}
            <div className="flex flex-col items-center justify-center mb-4">
              <motion.button 
                disabled={answered}
                onClick={!answered ? startListening : null}
                whileHover={!answered && !isListening ? { scale: 1.1, y: -5 } : {}}
                whileTap={!answered ? { scale: 0.9 } : {}}
                className={`
                  relative w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10
                  ${answered ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 
                    isListening ? 'bg-rose-500 border-rose-600 text-white shadow-xl shadow-rose-500/50' : 
                    'bg-white border-sky-100 text-sky-500 shadow-xl shadow-slate-200 hover:border-sky-400 hover:text-sky-600 cursor-pointer'}
                `}
              >
                <Mic size={32} strokeWidth={isListening ? 3 : 2.5} />
                
                {/* Ripple Effect when listening */}
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-rose-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></span>
                    <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50 animation-delay-300"></span>
                  </>
                )}
              </motion.button>
              
              <span className={`mt-4 font-black text-sm uppercase tracking-widest transition-colors ${
                isListening ? 'text-rose-500' : answered ? 'text-slate-400' : 'text-sky-500'
              }`}>
                {isListening ? 'Mendengarkan...' : answered ? 'Terkunci' : 'Ketuk & Bicara'}
              </span>
            </div>

            {/* Feedback Message */}
            <AnimatePresence>
              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`
                    mt-6 flex items-center gap-3 p-4 rounded-2xl font-bold border-2
                    ${selectedOption === correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}
                  `}
                >
                  {selectedOption === correctAnswer ? <Trophy size={24} className="text-emerald-500 flex-shrink-0" /> : <AlertCircle size={24} className="text-rose-500 flex-shrink-0" />}
                  <span className="text-base sm:text-lg">{feedback}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            <AnimatePresence>
              {answered && (
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  onClick={handleNextQuestion}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-5 bg-slate-900 text-white text-lg font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Lanjut ke Soal Berikutnya' : 'Selesaikan Misi'}
                  <ChevronRight size={24} strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Comments Section */}
        <div className="w-full mt-4">
          <CommentSection levelId={levelNumber} />
        </div>
      </div>
    </div>
  );
}