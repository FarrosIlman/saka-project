import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function Mascot({ state = 'idle', className = '' }) {
  const [isPoke, setIsPoke] = useState(false);

  // Mouse tracking for eyes
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for eye movement
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // Transform normalized mouse coordinates (-1 to 1) into pixel offsets for the pupils
  const pupilX = useTransform(smoothX, [-1, 1], [-15, 15]);
  const pupilY = useTransform(smoothY, [-1, 1], [-12, 12]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize position from -1 to 1 based on screen center
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handlePoke = () => {
    if (!isPoke) {
      setIsPoke(true);
      setTimeout(() => setIsPoke(false), 1000);
    }
  };

  const activeState = isPoke ? 'poke' : state;

  const isSad = activeState === 'sad';
  const filterStyle = isSad ? 'grayscale(40%) brightness(85%)' : (activeState === 'happy' || activeState === 'poke' ? 'brightness(110%) contrast(110%)' : 'none');

  // Base bounce for the whole SVG
  const bounceVariants = {
    idle: { y: [0, -5, 0], rotate: 0, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    thinking: { y: [0, -2, 0], rotate: [0, 2, -2, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
    happy: { y: [0, -15, 0], rotate: [0, 5, -5, 0], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } },
    sad: { y: [0, 5, 0], rotate: [0, -2, 2, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
    poke: { 
      y: [0, -25, -25, 0], 
      scale: [1, 1.05, 1.05, 1],
      rotate: [0, -8, 8, -5, 5, 0], 
      transition: { duration: 0.8, ease: "easeInOut" } 
    }
  };

  // Wing flapping
  const leftWingVariants = {
    happy: { rotate: [-14, -40, -14], transition: { duration: 0.3, repeat: Infinity, ease: "easeInOut" } },
    idle: { rotate: [-14, -18, -14], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    sad: { rotate: [-14, -10, -14], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    thinking: { rotate: [-14, -16, -14], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
    poke: { rotate: [-14, -70, -14], transition: { duration: 0.15, repeat: Infinity, ease: "easeInOut" } }
  };

  const rightWingVariants = {
    happy: { rotate: [14, 40, 14], transition: { duration: 0.3, repeat: Infinity, ease: "easeInOut" } },
    idle: { rotate: [14, 18, 14], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    sad: { rotate: [14, 10, 14], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    thinking: { rotate: [14, 16, 14], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
    poke: { rotate: [14, 70, 14], transition: { duration: 0.15, repeat: Infinity, ease: "easeInOut" } }
  };

  // Eyes blinking (scaleY 1 -> 0.1 -> 1)
  const blinkVariants = {
    idle: { scaleY: [1, 1, 0.1, 1, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] } },
    happy: { scaleY: [1, 1, 0.1, 1, 1], transition: { duration: 2.5, repeat: Infinity, times: [0, 0.85, 0.9, 0.95, 1] } },
    sad: { scaleY: [0.8, 0.8, 0.1, 0.8, 0.8], transition: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] } },
    thinking: { scaleY: [1, 1, 0.1, 1, 1], transition: { duration: 2.5, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] } },
    poke: { scaleY: [1.2, 1.2, 1.2], transition: { duration: 0.8 } } // Eyes wide open when poked!
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center w-32 h-32 cursor-pointer ${className}`}
      onClick={handlePoke}
      title="Tap me!"
    >
      <motion.div 
        className="relative w-full h-full flex items-center justify-center drop-shadow-xl"
        variants={bounceVariants}
        animate={activeState}
      >
        <svg width="100%" viewBox="0 0 690 700" xmlns="http://www.w3.org/2000/svg" role="img" style={{ filter: filterStyle, overflow: 'visible' }} className="w-full h-full object-contain">
          
          {/* --- BEAUTIFUL 3D FLOATING LOG PERCH --- */}
          <g transform="translate(340 585)">
            {/* Main log shape */}
            <path d="M -220 0 Q 0 20 220 0 Q 230 15 210 25 Q 0 45 -210 25 Q -230 15 -220 0 Z" fill="#5c3a21" />
            {/* Darker shadow below */}
            <path d="M -215 12 Q 0 32 215 12 Q 220 20 200 25 Q 0 45 -200 25 Q -220 20 -215 12 Z" fill="#3a2311" />
            {/* Highlight on top */}
            <path d="M -210 -2 Q 0 16 210 -2 Q 200 8 0 28 Q -200 8 -210 -2 Z" fill="#7a4f2f" />
            
            {/* Wood Grain (lines) */}
            <path d="M -150 15 Q 0 35 150 15" stroke="#4a2e1a" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M -180 8 Q 0 28 180 8" stroke="#8a5a36" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M -100 22 Q 0 40 100 22" stroke="#3a2311" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Left Twig & Leaf */}
            <path d="M -160 5 Q -180 -15 -200 -20" stroke="#5c3a21" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M -158 3 Q -180 -13 -198 -18" stroke="#7a4f2f" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M -200 -20 Q -230 -30 -220 -50 Q -190 -30 -200 -20 Z" fill="#4d9435" /> 
            <path d="M -202 -22 Q -222 -30 -214 -44 Q -192 -28 -202 -22 Z" fill="#65b849" /> 

            {/* Right Twig & Leaf */}
            <path d="M 160 5 Q 180 -15 210 -5" stroke="#5c3a21" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 158 3 Q 180 -13 208 -3" stroke="#7a4f2f" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 210 -5 Q 240 -15 250 10 Q 220 20 210 -5 Z" fill="#4d9435" />
            <path d="M 212 -3 Q 232 -10 240 7 Q 218 14 212 -3 Z" fill="#65b849" />
            
            {/* Main Shadow cast by owl onto the log */}
            <ellipse cx="0" cy="8" rx="80" ry="12" fill="#3a2311" opacity="0.6" />
          </g>

          {/* Wings */}
          <motion.g style={{ transformOrigin: "205px 250px" }} variants={leftWingVariants} animate={activeState}>
            <ellipse cx="205" cy="345" rx="60" ry="95" fill="#141e5c" />
            <ellipse cx="200" cy="340" rx="50" ry="85" fill="#203080" />
            <ellipse cx="195" cy="335" rx="35" ry="70" fill="#2b3f9e" />
          </motion.g>
          <motion.g style={{ transformOrigin: "475px 250px" }} variants={rightWingVariants} animate={activeState}>
            <ellipse cx="475" cy="345" rx="60" ry="95" fill="#141e5c" />
            <ellipse cx="480" cy="340" rx="50" ry="85" fill="#203080" />
            <ellipse cx="485" cy="335" rx="35" ry="70" fill="#2b3f9e" />
          </motion.g>

          {/* Body */}
          <ellipse cx="340" cy="365" rx="195" ry="205" fill="#1e2a78" />
          <ellipse cx="340" cy="360" rx="180" ry="190" fill="#283a9e" />
          <ellipse cx="340" cy="355" rx="160" ry="170" fill="#3b5bdb" />
          <ellipse cx="340" cy="350" rx="130" ry="140" fill="#4d6bd6" />
          {/* Glossy 3D Highlight for Body */}
          <ellipse cx="260" cy="280" rx="60" ry="90" fill="#ffffff" opacity="0.15" transform="rotate(-25 260 280)" />
          
          {/* Belly */}
          <ellipse cx="340" cy="415" rx="115" ry="128" fill="#fcd9a8" />
          <ellipse cx="340" cy="410" rx="100" ry="115" fill="#fde6c4" />
          <ellipse cx="340" cy="405" rx="85" ry="100" fill="#fef3e2" />

          {/* Head Base */}
          <circle cx="260" cy="230" r="110" fill="#1a2568" />
          <circle cx="260" cy="225" r="95" fill="#2a3f9e" />
          <circle cx="260" cy="220" r="80" fill="#3b5bdb" />

          <circle cx="420" cy="230" r="110" fill="#1a2568" />
          <circle cx="420" cy="225" r="95" fill="#2a3f9e" />
          <circle cx="420" cy="220" r="80" fill="#3b5bdb" />

          <circle cx="340" cy="230" r="128" fill="#1a2568" />
          <circle cx="340" cy="225" r="115" fill="#2a3f9e" />
          <circle cx="340" cy="220" r="95" fill="#3b5bdb" />
          
          {/* Glossy 3D Highlight for Head */}
          <ellipse cx="250" cy="160" rx="40" ry="20" fill="#ffffff" opacity="0.15" transform="rotate(-15 250 160)" />
          <ellipse cx="430" cy="160" rx="40" ry="20" fill="#ffffff" opacity="0.15" transform="rotate(15 430 160)" />
          
          {/* Face white area */}
          <circle cx="260" cy="235" r="82" fill="#fcd9a8" />
          <circle cx="260" cy="232" r="72" fill="#fde6c4" />
          <circle cx="260" cy="230" r="62" fill="#fef3e2" />

          <circle cx="420" cy="235" r="82" fill="#fcd9a8" />
          <circle cx="420" cy="232" r="72" fill="#fde6c4" />
          <circle cx="420" cy="230" r="62" fill="#fef3e2" />

          {/* Left Eye */}
          <motion.g style={{ transformOrigin: "260px 235px" }} variants={blinkVariants} animate={activeState}>
            <circle cx="260" cy="235" r="58" fill="#e2e8f0" /> {/* shadow of eyeball */}
            <circle cx="260" cy="233" r="54" fill="#ffffff" />
            {/* Interactive Pupil tracking mouse! */}
            <motion.g style={{ x: pupilX, y: pupilY }}>
              <circle cx="260" cy="237" r="34" fill="#3b5229" /> 
              <circle cx="260" cy="237" r="30" fill="#5a7a3e" /> 
              <circle cx="260" cy="237" r="19" fill="#12172e" /> 
              <circle cx="252" cy="227" r="8" fill="#ffffff" /> 
              <circle cx="268" cy="247" r="4" fill="#ffffff" opacity="0.7" /> 
            </motion.g>
          </motion.g>

          {/* Right Eye */}
          <motion.g style={{ transformOrigin: "420px 235px" }} variants={blinkVariants} animate={activeState}>
            <circle cx="420" cy="235" r="58" fill="#e2e8f0" />
            <circle cx="420" cy="233" r="54" fill="#ffffff" />
            {/* Interactive Pupil tracking mouse! */}
            <motion.g style={{ x: pupilX, y: pupilY }}>
              <circle cx="420" cy="237" r="34" fill="#3b5229" />
              <circle cx="420" cy="237" r="30" fill="#5a7a3e" />
              <circle cx="420" cy="237" r="19" fill="#12172e" />
              <circle cx="412" cy="227" r="8" fill="#ffffff" />
              <circle cx="428" cy="247" r="4" fill="#ffffff" opacity="0.7" />
            </motion.g>
          </motion.g>

          {/* --- CUTE 3D BEAK --- */}
          {/* Mouth interior (dark red/brown, visible when happy/talking) */}
          <path d="M 322 275 Q 340 295 358 275 Z" fill="#4a1a00" />
          
          {/* Lower Beak (moves down when happy or poked) */}
          <motion.g animate={activeState === 'happy' || activeState === 'poke' ? { y: 8, scaleY: 1.1 } : { y: 0, scaleY: 1 }}>
            <path d="M 320 273 Q 340 295 360 273 Z" fill="#c9660a" />
            <path d="M 323 274 Q 340 290 357 274 Z" fill="#ffb84d" />
          </motion.g>

          {/* Top Beak (stays fixed, layered for 3D effect) */}
          <g>
            <path d="M 315 265 Q 340 255 365 265 Q 340 295 315 265 Z" fill="#c9660a" />
            <path d="M 320 265 Q 340 260 360 265 Q 340 285 320 265 Z" fill="#e8940c" />
            <path d="M 325 266 Q 340 262 355 266 Q 340 278 325 266 Z" fill="#ffb84d" />
            <ellipse cx="340" cy="265" rx="8" ry="3" fill="#ffffff" opacity="0.6" />
            <circle cx="346" cy="264" r="1.5" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Eyebrows */}
          <path d="M 208 160 Q 235 120 275 143" stroke="#1a2568" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M 472 160 Q 445 120 405 143" stroke="#1a2568" strokeWidth="7" fill="none" strokeLinecap="round" />

          {/* Mic */}
          <g transform="translate(340 500)">
            <rect x="-30" y="-130" width="60" height="130" rx="30" fill="#c9660a" />
            <rect x="-26" y="-126" width="52" height="122" rx="26" fill="#e8940c" />
            <rect x="-20" y="-120" width="40" height="110" rx="20" fill="#ffe08a" />
            <rect x="-24" y="-124" width="15" height="118" rx="7" fill="#ffffff" opacity="0.4" /> 
            
            <circle cx="-12" cy="-95" r="4" fill="#0f172a" opacity="0.4" />
            <circle cx="6" cy="-95" r="4" fill="#0f172a" opacity="0.4" />
            <circle cx="-12" cy="-80" r="4" fill="#0f172a" opacity="0.4" />
            <circle cx="6" cy="-80" r="4" fill="#0f172a" opacity="0.4" />
            <circle cx="-12" cy="-65" r="4" fill="#0f172a" opacity="0.4" />
            <circle cx="6" cy="-65" r="4" fill="#0f172a" opacity="0.4" />
            <circle cx="-12" cy="-50" r="4" fill="#0f172a" opacity="0.4" />
            <circle cx="6" cy="-50" r="4" fill="#0f172a" opacity="0.4" />
            <rect x="-8" y="0" width="16" height="60" fill="#a3630f" />
            <rect x="-6" y="0" width="6" height="60" fill="#754305" /> 
            <rect x="-35" y="58" width="70" height="12" rx="6" fill="#a3630f" />
            <rect x="-35" y="58" width="70" height="6" rx="3" fill="#c47a16" /> 
          </g>

          {/* --- CUTE TAIL FEATHERS --- */}
          <g transform="translate(340 540)">
            <ellipse cx="-30" cy="20" rx="25" ry="50" fill="#1e2a78" transform="rotate(25)" />
            <ellipse cx="0" cy="30" rx="30" ry="60" fill="#1a2568" />
            <ellipse cx="30" cy="20" rx="25" ry="50" fill="#1e2a78" transform="rotate(-25)" />
            <ellipse cx="-30" cy="15" rx="15" ry="35" fill="#2b3f9e" transform="rotate(25)" />
            <ellipse cx="0" cy="25" rx="20" ry="45" fill="#2b3f9e" />
            <ellipse cx="30" cy="15" rx="15" ry="35" fill="#2b3f9e" transform="rotate(-25)" />
          </g>

          {/* --- CUTE CHUBBY OWL FEET --- */}
          <g transform="translate(290 575)">
            <ellipse cx="5" cy="15" rx="8" ry="12" fill="#a34b00" transform="rotate(-20)" />
            <ellipse cx="-15" cy="5" rx="12" ry="18" fill="#e8940c" />
            <ellipse cx="0" cy="10" rx="14" ry="20" fill="#ffb84d" />
            <ellipse cx="15" cy="5" rx="12" ry="18" fill="#c9660a" />
            <ellipse cx="-15" cy="0" rx="4" ry="6" fill="#ffffff" opacity="0.4" />
            <ellipse cx="0" cy="3" rx="5" ry="8" fill="#ffffff" opacity="0.5" />
            <ellipse cx="15" cy="0" rx="4" ry="6" fill="#ffffff" opacity="0.3" />
          </g>

          <g transform="translate(390 575)">
            <ellipse cx="-5" cy="15" rx="8" ry="12" fill="#a34b00" transform="rotate(20)" />
            <ellipse cx="-15" cy="5" rx="12" ry="18" fill="#c9660a" />
            <ellipse cx="0" cy="10" rx="14" ry="20" fill="#ffb84d" />
            <ellipse cx="15" cy="5" rx="12" ry="18" fill="#e8940c" />
            <ellipse cx="-15" cy="0" rx="4" ry="6" fill="#ffffff" opacity="0.3" />
            <ellipse cx="0" cy="3" rx="5" ry="8" fill="#ffffff" opacity="0.5" />
            <ellipse cx="15" cy="0" rx="4" ry="6" fill="#ffffff" opacity="0.4" />
          </g>
        </svg>
      </motion.div>
      
      {/* Floating Shadow outside the animated element to ground it */}
      <motion.div 
        animate={{ 
          scale: activeState === 'happy' ? [1, 0.6, 1] : (activeState === 'poke' ? [1, 0.4, 1] : [1, 1.1, 1]),
          opacity: activeState === 'happy' ? [0.4, 0.2, 0.4] : (activeState === 'poke' ? [0.4, 0.1, 0.4] : [0.4, 0.3, 0.4])
        }}
        transition={{ duration: activeState === 'happy' || activeState === 'poke' ? 0.6 : 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-3 bg-slate-300 rounded-full mt-2 filter blur-sm absolute -bottom-6 pointer-events-none z-[-1]"
      />
    </div>
  );
}
