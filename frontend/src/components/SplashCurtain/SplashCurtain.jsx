import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './SplashCurtain.css';

export default function SplashCurtain({ onComplete }) {
  const [scrollY, setScrollY] = useState(0);
  const controls = useAnimation();
  const [isTearing, setIsTearing] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      if (isTearing) return;
      
      // Accumulate scroll delta
      const newY = Math.min(Math.max(scrollY + e.deltaY, 0), window.innerHeight);
      setScrollY(newY);

      // If user scrolls past 20% of the screen height, rip the curtain up
      if (newY > window.innerHeight * 0.2) {
        setIsTearing(true);
        controls.start({
          y: "-100vh",
          transition: { type: "spring", stiffness: 120, damping: 14, mass: 0.5 }
        }).then(() => {
          onComplete(); // Tell App.jsx we're done so it unmounts
        });
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    // Handle touch for mobile
    let touchStartY = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e) => {
      if (isTearing) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      handleScroll({ deltaY });
      touchStartY = e.touches[0].clientY;
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scrollY, isTearing, controls, onComplete]);

  // While not ripping, transform based on raw scroll amount (max 20% up)
  const currentY = isTearing ? undefined : -scrollY;

  return (
    <motion.div 
      className="splash-curtain"
      animate={controls}
      style={{ y: currentY }}
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
