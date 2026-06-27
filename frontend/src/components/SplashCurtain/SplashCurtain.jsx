import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './SplashCurtain.css';

export default function SplashCurtain({ onComplete }) {
  const controls = useAnimation();
  const isTearingRef = useRef(false);

  useEffect(() => {
    const triggerRip = () => {
      if (isTearingRef.current) return;
      isTearingRef.current = true;
      
      controls.start({
        y: "-100vh",
        transition: { type: "spring", stiffness: 120, damping: 14, mass: 0.5 }
      }).then(() => {
        onComplete();
      });
    };

    const handleScroll = (e) => {
      // Trigger on any decent sized scroll wheel movement
      if (Math.abs(e.deltaY) > 5) {
        triggerRip();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      // Trigger on any decent sized swipe
      if (Math.abs(deltaY) > 10) {
        triggerRip();
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [controls, onComplete]);

  return (
    <motion.div 
      className="splash-curtain"
      animate={controls}
    >
      <div className="splash-content">
        <h1 className="splash-title">INVEGA ANALYTICS</h1>
        <div className="splash-prompt">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
          <span>Scroll up to enter</span>
        </div>
      </div>
    </motion.div>
  );
}
