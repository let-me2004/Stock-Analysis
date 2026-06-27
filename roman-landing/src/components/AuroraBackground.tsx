"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function AuroraBackground({
  color1 = '#4F46E5', // Electric Indigo
  color2 = '#C9A84C', // Warm Gold
  color3 = '#0A0E1A', // Midnight Navy
}: {
  color1?: string;
  color2?: string;
  color3?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create soft pulsing gradients using GSAP
    const orbs = containerRef.current.querySelectorAll('.aurora-orb');
    
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        x: 'random(-20vw, 20vw)',
        y: 'random(-20vh, 20vh)',
        scale: 'random(0.8, 1.5)',
        duration: 'random(10, 20)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * -5,
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-[#0A0E1A]">
      <div className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen filter blur-[100px]">
        <div 
          className="aurora-orb absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full"
          style={{ background: `radial-gradient(circle, ${color1} 0%, transparent 70%)` }}
        />
        <div 
          className="aurora-orb absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] rounded-full"
          style={{ background: `radial-gradient(circle, ${color2} 0%, transparent 70%)` }}
        />
        <div 
          className="aurora-orb absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full"
          style={{ background: `radial-gradient(circle, ${color1} 0%, transparent 70%)` }}
        />
      </div>
      {/* Noise overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
    </div>
  );
}
