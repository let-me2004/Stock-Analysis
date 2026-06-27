"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ResearchSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const papers = [
    {
      title: "Topological Data Analysis in High-Frequency Order Books",
      date: "Q3 2025",
      type: "Whitepaper"
    },
    {
      title: "Machine Learning Approaches to Liquidity Void Detection",
      date: "Q1 2026",
      type: "Technical Note"
    },
    {
      title: "Mean Reversion vs. Momentum in Indian Equities",
      date: "Q2 2026",
      type: "Market Research"
    }
  ];

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
          pinSpacing: false,
          scrub: true,
        }
      });

      gsap.to('.research-fade-overlay', {
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
      gsap.fromTo('.research-title-line',
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

      // Paragraph
      gsap.fromTo('.research-desc',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.research-title',
            start: "top 75%",
          }
        }
      );

      // Papers 3D Reveal Stagger
      gsap.fromTo('.research-paper',
        { y: 50, rotateX: 15, opacity: 0 },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: '.research-list',
            start: "top 80%",
          }
        }
      );

      // Background Scroll Parallax
      gsap.to('.research-bg', {
        backgroundPosition: '0 300px',
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="research" ref={sectionRef} className="min-h-screen w-full relative z-20 bg-black text-white py-24 md:py-32 px-6 sm:px-12 md:px-24 overflow-hidden flex flex-col justify-center" style={{ perspective: "1000px" }}>
      <div className="research-fade-overlay absolute inset-0 bg-black opacity-0 z-50 pointer-events-none"></div>
      {/* Unique Background: Diagonal lines pattern */}
      <div className="research-bg absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)',
        backgroundPosition: '0 0'
      }} />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <h1 className="research-title typo-h1 mb-12">
          <div className="research-title-line text-white/40">Our</div>
          <div className="research-title-line">Research</div>
        </h1>
        
        <p className="research-desc typo-body mb-8 lg:mb-12 max-w-2xl">
          Invega Capital publishes periodic insights into market microstructure, quantitative modeling, and the integration of artificial intelligence in algorithmic trading.
        </p>

        <div className="research-list space-y-6">
          {papers.map((paper, idx) => (
            <div key={idx} className="research-paper group border-b border-white/20 pb-6 flex flex-col md:flex-row md:items-end justify-between hover:border-white transition-colors cursor-pointer">
              <div className="flex-1 pr-4 md:pr-8">
                <div className="typo-label mb-3 flex gap-4">
                  <span>{paper.date}</span>
                  <span>//</span>
                  <span>{paper.type}</span>
                </div>
                <h3 className="text-xl md:text-3xl font-bold font-sans group-hover:text-white/80 transition-colors break-words">{paper.title}</h3>
              </div>
              <div className="mt-4 md:mt-0 shrink-0 typo-label text-white/50 group-hover:text-white transition-colors flex items-center gap-2">
                Read Document <span className="text-xl leading-none">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
