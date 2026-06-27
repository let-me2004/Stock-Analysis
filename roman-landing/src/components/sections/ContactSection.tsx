"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Title Cinematic Reveal
      gsap.fromTo('.contact-title-line',
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

      // Info Block Reveal
      gsap.fromTo('.contact-info',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: '.contact-title',
            start: "top 60%"
          }
        }
      );

      // Form Stagger Reveal (looks like a terminal typing/appearing)
      gsap.fromTo('.contact-form-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: '.contact-form-container',
            start: "top 75%",
          }
        }
      );
      
      // Dot matrix background breathing effect
      gsap.to('.contact-bg', {
        opacity: 0.1,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="min-h-screen w-full relative z-30 bg-black text-white py-24 md:py-32 px-6 sm:px-12 md:px-24 overflow-hidden flex flex-col justify-center">
      {/* Unique Background: Dot matrix pattern */}
      <div className="contact-bg absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h1 className="contact-title typo-h1 mb-12">
              <div className="contact-title-line">Get In</div>
              <div className="contact-title-line text-white/40">Touch</div>
            </h1>
            <p className="contact-info typo-body mb-12">
              Invega Capital operates as a proprietary trading firm and does not currently accept outside capital. 
              However, we are always open to exploring partnerships with quantitative researchers, infrastructure providers, and market makers.
            </p>
            
            <div className="space-y-6">
              <div className="contact-info">
                <div className="typo-label mb-1">Corporate HQ</div>
                <div className="font-mono text-sm uppercase tracking-widest text-white">Mumbai, India</div>
              </div>
              <div className="contact-info">
                <div className="typo-label mb-1">General Inquiries</div>
                <div className="font-mono text-sm uppercase tracking-widest text-white">contact@invegacapital.com</div>
              </div>
              <div className="contact-info">
                <div className="typo-label mb-1">Careers</div>
                <div className="font-mono text-sm uppercase tracking-widest text-white">talent@invegacapital.com</div>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container bg-white/5 border border-white/10 p-8 md:p-12">
            <h2 className="contact-form-item typo-h2 text-white mb-8">Secure Line</h2>
            <form className="space-y-8 font-mono">
              <div className="contact-form-item">
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Identifier</label>
                <input 
                  type="text" 
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="NAME OR ALIAS"
                />
              </div>
              <div className="contact-form-item">
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Return Address</label>
                <input 
                  type="email" 
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="EMAIL ADDRESS"
                />
              </div>
              <div className="contact-form-item">
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Payload</label>
                <textarea 
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors resize-none h-24"
                  placeholder="YOUR MESSAGE"
                />
              </div>
              <button 
                type="button"
                className="contact-form-item w-full border border-white text-white py-4 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors font-bold"
              >
                Transmit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
