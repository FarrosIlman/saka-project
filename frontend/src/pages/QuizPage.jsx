import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { levelAPI, progressAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import CommentSection from '../components/discussion/CommentSection';
import stringSimilarity from 'string-similarity';
import { 
  Mic, ChevronRight, CheckCircle2, 
  XCircle, AlertCircle, ArrowLeft, Loader2, Play, Pause, Square, Volume2, Sparkles
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
        setFeedback('Great! Correct answer. ✨'); 
        setScore(score + 1); 
      } else { 
        setFeedback('Not quite right, try again!'); 
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
      success(`Completed! Score: ${finalScore}%`);
      navigate('/levels');
    } catch (err) { navigate('/levels'); }
  };

  const styles = `
    .quiz-page { 
      min-height: 100vh; background: #fcfcfd; position: relative;
      padding: 30px 20px; display: flex; flex-direction: column; align-items: center; 
    }

    .bg-decoration { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
    .orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.3; }
    .orb-1 { width: 300px; height: 300px; background: #bae6fd; top: -50px; right: -50px; }
    .orb-2 { width: 250px; height: 250px; background: #e0e7ff; bottom: -30px; left: -50px; }

    .content-wrapper { position: relative; z-index: 10; width: 100%; max-width: 780px; }
    
    .progress-header { width: 100%; display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }

    .btn-back {
      background: white; border: 1.5px solid #e2e8f0; width: 48px; height: 48px; border-radius: 16px; 
      cursor: pointer; display: flex; align-items: center; justify-content: center; 
      box-shadow: 0 4px 10px rgba(0,0,0,0.04); transition: 0.3s; color: #0f172a;
    }
    .btn-back:hover { background: #0f172a; color: white; transform: translateX(-3px); }
    
    .progress-bar-bg { flex: 1; height: 12px; background: #e2e8f0; border-radius: 100px; padding: 3px; }
    .progress-bar-fill { 
      height: 100%; background: #0ea5e9; border-radius: 100px; 
      transition: width 0.6s cubic-bezier(0.65, 0, 0.35, 1);
    }

    .quiz-card { 
      background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
      width: 100%; border-radius: 32px; padding: 32px; 
      box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.05); 
      border: 1px solid rgba(255, 255, 255, 0.8);
    }

    .image-container { 
      position: relative; width: 100%; height: 240px; border-radius: 24px; 
      overflow: hidden; margin-bottom: 24px; border: 1px solid #f1f5f9;
    }
    .question-img { width: 100%; height: 100%; object-fit: cover; }

    .audio-pill {
      position: absolute; bottom: 16px; right: 16px; 
      background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px);
      padding: 6px 14px; border-radius: 100px; display: flex; align-items: center; gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .audio-btn { 
      background: #0ea5e9; color: white; border: none; width: 36px; height: 36px; 
      border-radius: 100px; display: flex; align-items: center; justify-content: center; cursor: pointer;
    }

    .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
    .option-bubble {
      padding: 16px 20px; border-radius: 100px; font-size: 15px; font-weight: 700;
      text-align: left; transition: 0.2s; border: 1.5px solid #f1f5f9; 
      background: white; cursor: pointer; display: flex; justify-content: space-between; 
      align-items: center; color: #475569;
    }
    .option-bubble:hover:not(:disabled) { border-color: #0ea5e9; background: #f0f9ff; transform: scale(1.02); }

    .mic-section { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 32px; cursor: pointer; }
    .mic-circle {
      width: 72px; height: 72px; border-radius: 100px; background: white; color: #64748b;
      display: flex; align-items: center; justify-content: center; border: 2px solid #f1f5f9; 
      box-shadow: 0 8px 15px rgba(0,0,0,0.04); transition: 0.3s;
    }
    .mic-section:hover .mic-circle:not(.listening) { border-color: #0ea5e9; color: #0ea5e9; transform: translateY(-3px); }
    .mic-circle.listening { background: #ef4444; color: white; border-color: #ef4444; animation: ripple 1.2s infinite; }
    
    @keyframes ripple { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); } 100% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } }

    .instr-text { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }

    .feedback-bubble {
      display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-radius: 100px;
      font-weight: 700; margin-top: 24px; font-size: 15px;
    }

    .btn-next {
      margin-top: 24px; width: 100%; padding: 18px; border-radius: 100px;
      background: #0f172a; color: white; border: none; font-weight: 800; 
      font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
    }

    @media (max-width: 640px) {
      .options-grid { grid-template-columns: 1fr; }
      .quiz-card { padding: 24px; }
      .image-container { height: 180px; }
    }
  `;

  if (loading || (questions.length > 0 && !currentQuestion)) {
    return (
      <div className="quiz-page">
        <style>{styles}</style>
        <Loader2 className="animate-spin text-sky-500" size={40} style={{marginTop: '100px'}} />
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <style>{styles}</style>
      
      <div className="bg-decoration">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="content-wrapper">
        <div className="progress-header">
          <button onClick={() => navigate('/levels')} className="btn-back">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(3)].map((_, i) => (
              <XCircle key={i} size={24} fill={i < incorrectAttempts ? '#ef4444' : 'rgba(226, 232, 240, 0.6)'} color={i < incorrectAttempts ? '#ef4444' : '#cbd5e1'} />
            ))}
          </div>
        </div>

        <div className="quiz-card">
          <div className="image-container">
            <img src={currentQuestion?.imageUrl} alt="Quiz" className="question-img" />
            <div className="audio-pill">
              <Volume2 size={18} color="#64748b" />
              <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} style={{ width: '60px' }} />
              <button className="audio-btn" onClick={isPlaying ? () => window.speechSynthesis.cancel() : speakQuestion}>
                {isPlaying ? <Square size={16} fill="white" strokeWidth={0} /> : <Play size={16} fill="white" style={{marginLeft: '2px'}} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ padding: '4px 12px', background: '#f0f9ff', borderRadius: '100px', color: '#0ea5e9', fontSize: '11px', fontWeight: '800' }}>
              LEVEL {levelNumber} • QUESTION {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: '4px', letterSpacing: '-0.03em' }}>
            {currentQuestion?.questionText}
          </h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>Choose the correct answer</p>

          <div className="options-grid">
            {currentQuestion?.options.map((option, idx) => {
              const isCorrect = answered && option === correctAnswer;
              const isWrong = answered && selectedOption === option && option !== correctAnswer;
              return (
                <button key={idx} disabled={answered} onClick={() => checkAnswer(option)} className="option-bubble"
                  style={{
                    borderColor: isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#f1f5f9',
                    background: isCorrect ? '#ecfdf5' : isWrong ? '#fff1f2' : 'white',
                    color: isCorrect ? '#065f46' : isWrong ? '#991b1b' : '#475569',
                    boxShadow: isCorrect ? '0 4px 0px #10b981' : isWrong ? '0 4px 0px #ef4444' : '0 4px 0px #f1f5f9'
                  }}>
                  <span>{option}</span>
                  {isCorrect && <CheckCircle2 size={18} />}
                  {isWrong && <XCircle size={18} />}
                </button>
              );
            })}
          </div>

          <div className="mic-section" onClick={!answered ? startListening : null}>
            <button className={`mic-circle ${isListening ? 'listening' : ''}`} style={{ opacity: answered ? 0.4 : 1 }}>
              <Mic size={32} />
            </button>
            <span className="instr-text">
              {isListening ? 'Listening...' : answered ? 'Answer Locked' : 'Tap to Speak'}
            </span>
          </div>

          {feedback && (
            <div className="feedback-bubble" style={{
              background: answered ? (selectedOption === correctAnswer ? '#ecfdf5' : '#fff1f2') : '#f0f9ff',
              color: answered ? (selectedOption === correctAnswer ? '#10b981' : '#e11d48') : '#0ea5e9',
              border: `1px solid ${answered ? (selectedOption === correctAnswer ? '#10b981' : '#ef4444') : '#e2e8f0'}`
            }}>
              {selectedOption === correctAnswer ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
              <span>{feedback}</span>
            </div>
          )}

          {answered && (
            <button className="btn-next" onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <div style={{ marginTop: '40px' }}>
          <CommentSection levelId={levelNumber} />
        </div>
      </div>
    </div>
  );
}