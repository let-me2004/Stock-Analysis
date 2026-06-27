"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lightfall from '../Lightfall';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Title Animation: split-like fade up
      gsap.fromTo('.about-title',
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );

      // Paragraphs Animation: Staggered slide up
      gsap.fromTo('.about-text',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: '.about-title',
            start: "top 60%",
          }
        }
      );

      // Background Parallax
      gsap.fromTo('.about-bg',
        { backgroundPositionY: "0%" },
        {
          backgroundPositionY: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
      // Pin Section until Services covers it
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        endTrigger: "#services",
        end: "top top",
        pin: true,
        pinSpacing: false
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="h-screen bg-black text-white py-32 px-6 sm:px-12 md:px-24 overflow-hidden flex flex-col justify-center">
      {/* Unique Background: Top spotlight + subtle grid + Lightfall */}
      <div className="about-bg absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 50px 50px, 50px 50px',
          backgroundPosition: 'center 0, center center, center center'
        }} />
        <Lightfall
          colors={['#ffffff', '#aaaaaa', '#555555']}
          backgroundColor="#000000"
          speed={0.4}
          streakCount={2}
          streakWidth={1}
          streakLength={2}
          glow={0.8}
          density={0.4}
          twinkle={1}
          zoom={2}
          backgroundGlow={0.1}
          opacity={0.3}
          mouseInteraction={true}
          mouseStrength={0.5}
          mouseRadius={0.8}
          dpr={1}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <h1 className="about-title typo-h1 mb-16">
          The Invega <br/> <span className="text-white/40">Philosophy</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <div>
            <p className="about-text typo-body mb-8">
              We do not predict the market. We measure its structure.
            </p>
            <p className="about-text typo-body mb-8">
              Invega Capital operates exclusively in the Indian equity markets. Our proprietary algorithms process terabytes of tick-level data to execute intra-day and multi-day statistical arbitrage strategies with surgical precision.
            </p>
          </div>
          <div>
            <p className="about-text typo-body mb-8">
              By mapping the multi-dimensional relationships between order flow velocity, liquidity voids, and price action, we extract statistically significant alpha where traditional models see only noise.
            </p>
            <p className="about-text typo-body font-bold text-white">
              100% Systematic. Zero emotion. Absolute discipline.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
