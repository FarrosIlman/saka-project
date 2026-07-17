import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mascot } from './Mascot';
import { useAuth } from '../../context/AuthContext';

const tutorialSteps = [
  {
    title: "Welcome to SAKA!",
    message: "Hello there! Welcome to SAKA. I'm your guide. Let me show you how to master the English language!",
    mascotState: "happy",
    targetId: null
  },
  {
    title: "Choose Your Level",
    message: "Here you will see your journey map. Start from Level 1 and complete challenges to unlock the next levels.",
    mascotState: "idle",
    targetId: "tutorial-target-level"
  },
  {
    title: "Daily Quests & EXP",
    message: "Don't forget to check your Daily Quests! Complete them to earn coins and gather EXP to climb the Leaderboard 🏆.",
    mascotState: "poke",
    targetId: "tutorial-target-quests"
  },
  {
    title: "Watch Out!",
    message: "Your hearts are limited! ❤️ If you answer incorrectly, you will lose a heart. You must wait for them to regenerate if you run out.",
    mascotState: "sad",
    targetId: "tutorial-target-hearts"
  },
  {
    title: "Let's Begin!",
    message: "Are you ready? Click the first level to start learning! You've got this!!!",
    mascotState: "happy",
    targetId: null
  }
];

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 30);
    
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

export const OnboardingTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetBounds, setTargetBounds] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const step = tutorialSteps[currentStep];

  const updateBounds = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    if (step.targetId) {
      let activeTargetId = step.targetId;
      // If mobile, check if a mobile-specific target exists (e.g. quests widget is hidden, use bottom nav)
      if (window.innerWidth < 1024 && step.targetId === "tutorial-target-quests") {
        activeTargetId = "tutorial-target-quests-mobile";
      }

      const element = document.getElementById(activeTargetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Add some padding around the element
        const padding = 16;
        setTargetBounds({
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          centerX: rect.left + rect.width / 2,
          bottomY: rect.bottom + padding,
          topY: rect.top - padding
        });
      } else {
        setTargetBounds(null);
      }
    } else {
      setTargetBounds(null);
    }
  };

  useEffect(() => {
    updateBounds();
    // Delay slightly to handle reflows
    const timeoutId = setTimeout(updateBounds, 100);
    
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, true);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds, true);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  // Calculate dynamic spacing to see if we have enough room
  const spaceAbove = targetBounds ? targetBounds.topY : 0;
  const spaceBelow = targetBounds ? window.innerHeight - targetBounds.bottomY : 0;
  
  // If we have less than 340px of vertical space, fallback to centered to prevent squishing the Mascot or Bubble
  const isCentered = !targetBounds || (spaceAbove < 340 && spaceBelow < 340);
  
  // Put bubble in whichever half has more space (only if not centered)
  const isTargetHigh = !isCentered && targetBounds && (spaceBelow >= spaceAbove);

  // We will position the modal using top or bottom CSS properties
  // so it naturally avoids the target bounds.

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] overflow-hidden"
      >
        {/* SVG Spotlight Mask */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White makes everything visible */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              
              {/* Black punches a hole through the mask */}
              {targetBounds && (
                <motion.rect 
                  initial={false}
                  animate={{
                    x: targetBounds.x,
                    y: targetBounds.y,
                    width: targetBounds.width,
                    height: targetBounds.height
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  rx="16" 
                  ry="16"
                  fill="black" 
                />
              )}
            </mask>
          </defs>
          
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            fill="rgba(15, 23, 42, 0.85)" 
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Content Container */}
        <div className="absolute inset-0 flex justify-center pointer-events-none" style={{ alignItems: isCentered ? 'center' : 'flex-start' }}>
          <motion.div
            key={currentStep}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`w-full max-w-lg px-4 sm:px-8 pointer-events-auto ${isCentered ? 'relative' : 'absolute'}`}
            style={
              isCentered 
                ? {} 
                : isTargetHigh 
                  ? { top: targetBounds.bottomY + 10, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' } 
                  : { bottom: window.innerHeight - targetBounds.topY + 10, top: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }
            }
          >
            {/* Spotlight Effect behind Mascot (centered loosely) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl -z-10"></div>

            {/* If NOT TargetHigh (Bubble ABOVE target), Mascot goes on TOP of bubble */}
            {!isTargetHigh && !isCentered && (
              <div className="flex justify-center shrink-0 z-20 mb-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl -z-10"></div>
                <Mascot state={step.mascotState} className="w-24 h-24 sm:w-32 sm:h-32 filter drop-shadow-xl" />
              </div>
            )}

            {/* Centered Mascot (When no target or space is tight) */}
            {isCentered && (
              <div className="flex justify-center shrink-0 z-20 mb-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl -z-10"></div>
                <Mascot state={step.mascotState} className="w-28 h-28 sm:w-40 sm:h-40 filter drop-shadow-xl" />
              </div>
            )}

            {/* Chat Bubble Wrapper (Tails sit here so they aren't clipped by overflow) */}
            <div className="relative z-10 w-full flex flex-col shrink-0">
              
              {/* Tail pointing UP (if target is high) or DOWN (default) */}
              {!isCentered && (
                isTargetHigh ? (
                  <>
                    <div className="absolute -top-[28px] sm:-top-[32px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] sm:border-l-[24px] border-l-transparent border-r-[20px] sm:border-r-[24px] border-r-transparent border-b-[28px] sm:border-b-[34px] border-b-sky-100 drop-shadow-md z-10"></div>
                    <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-r-[16px] sm:border-r-[20px] border-r-transparent border-b-[24px] sm:border-b-[30px] border-b-white z-40"></div>
                  </>
                ) : (
                  <>
                    <div className="absolute -bottom-[28px] sm:-bottom-[32px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] sm:border-l-[24px] border-l-transparent border-r-[20px] sm:border-r-[24px] border-r-transparent border-t-[28px] sm:border-t-[34px] border-t-sky-100 drop-shadow-md z-10"></div>
                    <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-r-[16px] sm:border-r-[20px] border-r-transparent border-t-[24px] sm:border-t-[30px] border-t-white z-40"></div>
                  </>
                )
              )}

              {/* Chat Bubble Content */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl relative z-30 border-4 border-sky-100 w-full shrink-0 flex flex-col">

                {/* Header (Mascot removed from inside) */}
                <div className="text-center relative z-20 shrink-0">
                  <h2 className="text-xl sm:text-2xl font-black text-sky-500 mb-2 uppercase tracking-wide">
                    {step.title}
                  </h2>
                </div>

                <div className="text-center relative z-20 shrink-0">
                  <p className="text-slate-600 text-sm sm:text-lg font-medium leading-relaxed">
                    <TypewriterText text={step.message} />
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 flex justify-center relative z-20 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 sm:py-3 px-8 sm:px-10 rounded-full shadow-lg shadow-sky-500/30 transition-colors w-full sm:w-auto text-base sm:text-lg"
                  >
                    {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Start Learning!'}
                  </motion.button>
                </div>

                {currentStep < tutorialSteps.length - 1 && (
                  <button 
                    onClick={onComplete}
                    className="w-full mt-3 sm:mt-4 text-slate-400 font-medium text-xs sm:text-sm hover:text-slate-500 transition-colors shrink-0"
                  >
                    Skip Tutorial
                  </button>
                )}
              </div>
            </div>

              {/* If TargetHigh (Bubble BELOW target), Mascot goes BELOW bubble */}
              {isTargetHigh && !isCentered && (
                <div className="flex justify-center shrink-0 z-20 mt-2 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl -z-10"></div>
                  <Mascot state={step.mascotState} className="w-24 h-24 sm:w-32 sm:h-32 filter drop-shadow-xl" />
                </div>
              )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
