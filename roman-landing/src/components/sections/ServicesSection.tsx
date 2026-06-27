"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Stacked Cards Effect
      gsap.to(sectionRef.current, {
        scale: 0.92,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom bottom",
          end: "bottom top",
          pin: true,
          pinSpacing: false, // Allows the next section to overlap
          scrub: true,
        }
      });

      gsap.to('.services-fade-overlay', {
        opacity: 0.6,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      // Title Cinematic Reveal
      gsap.fromTo('.services-title-line',
        { y: 100, clipPath: 'inset(100% 0 0 0)' },
        {
          y: 0,
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.5,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );

      // Top Data Grid Stagger
      gsap.fromTo('.services-data',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
          }
        }
      );

      // Bottom Architecture / Performance Fade
      gsap.fromTo('.services-block',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
          }
        }
      );
      
      // Barcode Background reveal
      gsap.fromTo('.services-bg',
        { scaleY: 0, transformOrigin: "top" },
        {
          scaleY: 1,
          duration: 1.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="min-h-screen w-full bg-black text-white py-24 md:py-32 px-6 sm:px-12 md:px-24 relative z-10 overflow-hidden flex flex-col justify-center">
      <div className="services-fade-overlay absolute inset-0 bg-black opacity-0 z-50 pointer-events-none"></div>
      {/* Unique Background: Vertical stripes / barcode effect */}
      <div className="services-bg absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)',
        backgroundSize: '20px 100%, 100px 100%',
        backgroundPosition: '0 0, 0 0'
      }} />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <h1 className="services-title typo-h1 mb-12">
          <div className="services-title-line">Daily</div>
          <div className="services-title-line text-white/40">Signals</div>
        </h1>
        
        <div className="services-grid border-t border-b border-white/20 py-8 lg:py-12 mb-8 lg:mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="services-data">
              <div className="typo-label mb-2">Strategy</div>
              <div className="typo-data text-base md:text-lg">Intraday Momentum Reversal</div>
            </div>
            <div className="services-data">
              <div className="typo-label mb-2">Asset Class</div>
              <div className="typo-data text-base md:text-lg">Indian Equities (NSE)</div>
            </div>
            <div className="services-data">
              <div className="typo-label mb-2">Holding Period</div>
              <div className="typo-data text-base md:text-lg">Minutes to Hours</div>
            </div>
            <div className="services-data">
              <div className="typo-label mb-2">Target Capacity</div>
              <div className="typo-data text-base md:text-lg">$50M USD</div>
            </div>
          </div>
        </div>

        <div className="services-blocks-container grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="services-block">
            <h2 className="typo-h2 text-white mb-6">Execution Architecture</h2>
            <p className="typo-body mb-6">
              Our proprietary signal generation engine processes tick-level data to identify micro-structural inefficiencies across 200+ highly liquid Indian equities. 
            </p>
            <p className="typo-body">
              Signals are generated dynamically based on order book imbalance, relative volume velocity, and localized support/resistance topology.
            </p>
          </div>
          <div className="services-block bg-white/5 p-8 border border-white/10 rounded-sm">
            <h2 className="typo-h2 text-white mb-6">Performance Characteristics</h2>
            <ul className="space-y-4 typo-label">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Target Annualized Volatility</span>
                <span className="text-white font-mono text-base">8 - 12%</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Target Sharpe Ratio</span>
                <span className="text-white font-mono text-base">2.5+</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Correlation to Nifty 50</span>
                <span className="text-white font-mono text-base">&lt; 0.1</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Average Win Rate</span>
                <span className="text-white font-mono text-base">54.8%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
