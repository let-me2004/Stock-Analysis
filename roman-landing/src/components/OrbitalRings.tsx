"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export interface RingData {
  value: number;
  suffix: string;
  label: string;
}

interface OrbitalRingsProps {
  data: RingData[];
  // Exposed for external scroll triggers
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function OrbitalRings({ data, containerRef }: OrbitalRingsProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const wrapperRef = containerRef || localRef;
  const numbersRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Internal ticking animation
  useEffect(() => {
    if (!wrapperRef.current) return;

    // Set their initial text content to 0
    numbersRef.current.forEach((el, i) => {
      if (el) el.innerText = "0";
    });

  }, [wrapperRef]);

  // We expose a class "orbital-number" so EdgeSection can find and animate them
  return (
    <div 
      ref={wrapperRef}
      className="relative flex items-center justify-center w-[600px] h-[600px] pointer-events-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Central Glowing Core */}
      <div 
        className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-white/5 opacity-80 blur-[40px] pointer-events-none"
        style={{ transform: "translateZ(-50px)" }}
      />
      <div 
        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/20 blur-[20px] pointer-events-none"
        style={{ transform: "translateZ(-20px)" }}
      />

      {/* Curved Array of Glass Cards */}
      {data.map((item, index) => {
        // Arrange in a Vision Pro-style curved arc facing the user
        let transform = "translateX(0) translateZ(0) rotateY(0deg)";
        if (index === 0) {
          // Left card
          transform = "translateX(-320px) translateZ(-80px) rotateY(25deg)";
        } else if (index === 1) {
          // Center card
          transform = "translateX(0px) translateZ(20px) rotateY(0deg)";
        } else if (index === 2) {
          // Right card
          transform = "translateX(320px) translateZ(-80px) rotateY(-25deg)";
        }
        
        return (
          <div
            key={index}
            className="orbital-card absolute inset-0 m-auto w-64 h-80 rounded-[2.5rem] flex flex-col items-center justify-center p-8"
            style={{
              // Premium Apple Vision Pro Glassmorphism
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              
              // 3D positioning
              transformOrigin: "center center",
              transform: transform,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Inner content (slightly raised) */}
            <div 
              className="flex flex-col items-center justify-center w-full h-full"
              style={{ transform: "translateZ(40px)" }}
            >
              <div className="flex items-baseline mb-4" style={{ textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <span 
                  ref={el => { numbersRef.current[index] = el; }}
                  className="orbital-number text-7xl font-extralight text-white tracking-tighter"
                  data-target={item.value}
                >
                  0
                </span>
                <span className="text-3xl text-white/50 font-light ml-1">{item.suffix}</span>
              </div>
              <div className="text-xs uppercase tracking-[0.4em] text-white/50 font-medium mt-6 text-center">
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
