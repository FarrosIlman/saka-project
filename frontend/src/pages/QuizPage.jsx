import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { levelAPI, progressAPI, gamificationAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import CommentSection from '../components/discussion/CommentSection';
import stringSimilarity from 'string-similarity';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, ChevronRight, CheckCircle2, 
  XCircle, AlertCircle, ArrowLeft, Loader2, Play, Pause, Square, Volume2, Sparkles, Trophy, Turtle, Heart, HeartCrack
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playDing, playBuzzer, playFanfare } from '../utils/audio';
import { vibrateSuccess, vibrateError, vibrateTap, vibrateHeavy } from '../utils/haptics';
import { BadgeUnlockModal } from '../components/gamification/BadgeUnlockModal';
import { StreakModal } from '../components/gamification/StreakModal';
import { Mascot } from '../components/gamification/Mascot';

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
  const [mistakes, setMistakes] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const [hearts, setHearts] = useState(5);
  const [showGameOver, setShowGameOver] = useState(false);
  const [mascotState, setMascotState] = useState('idle');
  const [streakData, setStreakData] = useState(null);

  useEffect(() => { fetchQuestions(); }, [levelNumber]);

  const fetchQuestions = async () => {
    try {
      const [levelRes, heartRes] = await Promise.all([
        levelAPI.getLevelQuestions(levelNumber),
        gamificationAPI.getHeartStatus()
      ]);
      
      if (heartRes.data.hearts <= 0) {
        warning('Out of lives! Refill lives to play.');
        navigate('/levels');
        return;
      }
      
      setHearts(heartRes.data.hearts);
      setQuestions(levelRes.data.questions || []);
      setLoading(false);
    } catch (err) {
      error('Failed to load quiz.');
      navigate('/levels');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const shuffledOptions = React.useMemo(() => {
    if (!currentQuestion?.options) return [];
    return [...currentQuestion.options].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  const speakQuestion = useCallback((rate = 0.9) => {
    if (!currentQuestion) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [currentQuestion, volume]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      error('Browser does not support Speech Recognition.');
      return;
    }

    setAudioBlobUrl(null);

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(audioUrl);
      };

      mediaRecorder.start();

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => { setIsListening(true); setMascotState('thinking'); };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processVoiceAnswer(transcript);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };
      recognition.onerror = () => {
        setIsListening(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };
      recognition.onend = () => {
        setIsListening(false);
        if (mascotState === 'thinking') setMascotState('idle');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };
      recognition.start();

    }).catch(err => {
      error('Microphone permission denied.');
      setMascotState('sad');
    });
  };

  const processVoiceAnswer = (transcript) => {
    if (!currentQuestion) return;
    const similarities = currentQuestion.options.map((option) =>
      stringSimilarity.compareTwoStrings(transcript.toLowerCase(), option.toLowerCase())
    );
    const maxSimilarity = Math.max(...similarities);
    const matchedIndex = similarities.indexOf(maxSimilarity);
    if (maxSimilarity >= 0.7) { checkAnswer(currentQuestion.options[matchedIndex]); } 
    else { 
      setFeedback(`You said: "${transcript}". Try again.`); 
      setMascotState('sad');
      vibrateError();
    }
  };

  const checkAnswer = async (option) => {
    setSelectedOption(option);
    vibrateTap();
    try {
      const response = await levelAPI.checkAnswer({ questionId: currentQuestion._id, selectedOption: option });
      setCorrectAnswer(response.data.correctAnswer);
      setAnswered(true);
      if (response.data.correct) { 
        playDing();
        vibrateSuccess();
        setMascotState('happy');
        setFeedback('Excellent! Correct Answer.'); 
        setScore(score + 1); 
      } else { 
        playBuzzer();
        vibrateError();
        setMascotState('sad');
        setFeedback("Not quite right, let's try again!"); 
        setMistakes(prev => {
          if (prev.some(m => m.question === currentQuestion.questionText)) return prev;
          return [...prev, {
            question: currentQuestion.questionText,
            userAnswer: String(option).replace(/</g, "&lt;").replace(/>/g, "&gt;"),
            correctAnswer: response.data.correctAnswer
          }];
        });
        
        try {
          const heartRes = await gamificationAPI.deductHeart();
          setHearts(heartRes.data.hearts);
          if (heartRes.data.hearts <= 0) {
            vibrateHeavy();
            setTimeout(() => setShowGameOver(true), 1500);
          }
        } catch(e) {
          console.error("Failed to deduct lives", e);
        }

        handleIncorrectAnswer(); 
      }
    } catch (err) { error('Failed to check answer.'); }
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
      setAudioBlobUrl(null);
      setMascotState('idle');
    } else { endQuiz(false); }
  };

  const endQuiz = async (failed) => {
    if (failed) { warning('Out of attempts!'); navigate('/levels'); return; }
    const finalScore = Math.round((score / questions.length) * 100);
    try {
      const response = await progressAPI.completeLevel({ levelNumber: Number(levelNumber), score: finalScore });
      setShowSummary(true);
      
      if (response.data && response.data.streakData && response.data.streakData.increased) {
        setTimeout(() => {
          setStreakData(response.data.streakData);
        }, 1000);
      }

      if (response.data && response.data.badgesAwarded && response.data.badgesAwarded.length > 0) {
        setTimeout(() => {
          setNewBadges(response.data.badgesAwarded);
        }, 3000); // Tunda lebih lama jika ada streak modal muncul
      }
      
      if (finalScore === 100) {
        playFanfare();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#f59e0b', '#10b981', '#f43f5e']
        });
      } else if (finalScore >= 80) {
        playDing();
      }
    } catch (err) { navigate('/levels'); }
  };

  if (loading || (questions.length > 0 && !currentQuestion && !showSummary && !showGameOver)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-sky-500" size={50} />
        <p className="mt-4 text-slate-500 font-bold animate-pulse">Preparing Mission...</p>
      </div>
    );
  }

  if (showGameOver) {
    return (
      <div className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card max-w-md w-full p-8 text-center"
        >
          <div className="w-24 h-24 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <HeartCrack size={50} className="text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Game Over!</h2>
          <p className="text-slate-500 font-medium mb-8">You have run out of lives. Please refill lives on the main page to try again.</p>
          <button 
            onClick={() => navigate('/levels')} 
            className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="relative min-h-screen bg-slate-50 bg-grid-pattern overflow-x-hidden flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative z-10 w-full max-w-2xl mt-10">
          <div className="glass-card p-8 sm:p-10 text-center shadow-xl">
             <Trophy size={72} className="mx-auto text-amber-500 mb-6" />
             <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">Level Completed!</h2>
             <p className="text-lg font-bold text-slate-500 mb-8">Final Score: <span className="text-sky-500">{Math.round((score / questions.length) * 100)}%</span></p>

             {mistakes.length > 0 && (
                <div className="text-left mb-8 border-t border-slate-100 pt-8">
                 <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                   <AlertCircle size={22} className="text-rose-500" /> Review Mistakes
                 </h3>
                 <div className="flex flex-col gap-4">
                   {mistakes.map((m, i) => (
                     <div key={i} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                       <p className="font-bold text-slate-900 mb-3">{m.question}</p>
                       <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm font-medium bg-white/50 p-3 rounded-xl">
                         <div className="flex items-center gap-2 text-rose-600">
                           <XCircle size={16} /> Your answer: <span className="italic" dangerouslySetInnerHTML={{__html: m.userAnswer}}></span>
                         </div>
                         <div className="flex items-center gap-2 text-emerald-600">
                           <CheckCircle2 size={16} /> Correct answer: <span className="font-bold">{m.correctAnswer}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             <button onClick={() => navigate('/levels')} className="w-full py-4 bg-slate-900 text-white text-lg font-black rounded-xl hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all">
                Back to Home
             </button>
          </div>
        </div>
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
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-200 rounded-xl text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Quiz Progress</span>
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
          <div className="flex-shrink-0 flex gap-1.5 items-center bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
            <Heart size={18} className="text-rose-500" fill="currentColor" />
            <span className="font-black text-rose-600">{hearts}</span>
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
            className="w-full glass-card p-5 sm:p-6 relative"
          >
            {/* Image Container */}
            <div className="relative w-full h-40 sm:h-56 rounded-3xl overflow-hidden mb-6 border-4 border-white shadow-md bg-slate-100">
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
                  onClick={() => speakQuestion(0.5)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
                  title="Slow Speed"
                >
                  <Turtle size={16} />
                </button>
                <button 
                  onClick={isPlaying ? () => window.speechSynthesis.cancel() : () => speakQuestion(0.9)}
                  className="w-10 h-10 flex items-center justify-center bg-sky-500 text-white rounded-xl hover:bg-sky-600 active:scale-95 transition-all shadow-md shadow-sky-500/30"
                >
                  {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-sky-50 border border-sky-100 rounded-full text-sky-600 font-bold text-[10px] mb-3 uppercase tracking-wider">
                Level {levelNumber}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {currentQuestion?.questionText}
              </h2>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {shuffledOptions.map((option, idx) => {
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
                      relative flex items-center justify-between p-4 rounded-xl font-bold text-left transition-all duration-300 border-2 shadow-[0_3px_0_0_transparent]
                      ${isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-500/30' : 
                        isWrong ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-rose-500/30' : 
                        'bg-white border-slate-200 text-slate-600 hover:border-sky-400 hover:bg-sky-50 shadow-slate-200'}
                    `}
                  >
                    <span className="text-base">{option}</span>
                    {isCorrect && <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />}
                    {isWrong && <XCircle size={20} className="text-rose-500 flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Microphone Interaction & Mascot */}
            <div className="flex flex-col items-center justify-center mb-4 mt-8">
              
              {/* Mascot centered above Mic */}
              <div className="mb-4">
                <Mascot state={mascotState} className="w-28 h-28 sm:w-36 sm:h-36" />
              </div>

              <motion.button 
                disabled={answered}
                onClick={!answered ? startListening : null}
                whileHover={!answered && !isListening ? { scale: 1.1, y: -5 } : {}}
                whileTap={!answered ? { scale: 0.9 } : {}}
                className={`
                  relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 bg-white
                  ${answered ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 
                    isListening ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/50' : 
                    'border-sky-100 text-sky-500 shadow-xl shadow-sky-100 hover:border-sky-400 hover:text-sky-600 cursor-pointer'}
                `}
              >
                <Mic size={36} strokeWidth={isListening ? 3 : 2.5} />
                
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
                {isListening ? 'Listening...' : answered ? 'Locked' : 'Tap & Speak'}
              </span>
            </div>

            {/* Feedback Message */}
            <AnimatePresence>
              {feedback && (
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`
                      flex-1 flex items-center gap-3 p-4 rounded-2xl font-bold border-2
                      ${selectedOption === correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}
                    `}
                  >
                    {selectedOption === correctAnswer ? <Trophy size={24} className="text-emerald-500 flex-shrink-0" /> : <AlertCircle size={24} className="text-rose-500 flex-shrink-0" />}
                    <span className="text-base sm:text-lg">{feedback}</span>
                  </motion.div>

                  {audioBlobUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-shrink-0 flex items-center justify-center p-4 bg-slate-100 rounded-2xl border-2 border-slate-200"
                    >
                      <button 
                        onClick={() => {
                          const audio = new Audio(audioBlobUrl);
                          audio.play();
                        }}
                        className="flex items-center gap-2 text-slate-700 font-bold hover:text-sky-600 transition-colors"
                        title="Listen to your voice"
                      >
                        <Volume2 size={20} />
                        Listen to Your Voice
                      </button>
                    </motion.div>
                  )}
                </div>
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
                  className="w-full mt-6 py-4 bg-slate-900 text-white text-base font-black rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Proceed to Next Question' : 'Complete Mission'}
                  <ChevronRight size={20} strokeWidth={3} />
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
      
      {/* Badge Unlock Modal */}
      <BadgeUnlockModal badges={newBadges} onClose={() => setNewBadges([])} />
      
      {/* Streak Fire Modal */}
      <StreakModal streakData={streakData} onClose={() => setStreakData(null)} />
    </div>
  );
}