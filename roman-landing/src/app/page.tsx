"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ExecutiveSection from "@/components/ExecutiveSection";
import AuroraBackground from "@/components/AuroraBackground";
import TextPressure from "@/components/TextPressure";
import ScrollReveal from "@/components/ScrollReveal";
import DynamicBackground from "@/components/DynamicBackground";
import EdgeSection from "@/components/EdgeSection";
import { ArrowDownRight } from "lucide-react";
import Link from "next/link";

import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ResearchSection from "@/components/sections/ResearchSection";
import ContactSection from "@/components/sections/ContactSection";
import { CinematicFooter } from "@/components/ui/motion-footer";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    let ctx = gsap.context(() => {
      // 1. Massive Text Fade-up
      const massiveTexts = gsap.utils.toArray('.massive-text');
      massiveTexts.forEach((text: any) => {
        gsap.fromTo(text, 
          { y: 150, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1.5, 
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: text,
              start: "top 90%",
            }
          }
        );
      });

      // 3. Service Cards Stagger Fade Up
      gsap.utils.toArray(".service-card").forEach((card: any) => {
        gsap.fromTo(card,
          { opacity: 0, y: 100, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power4.out",
            stagger: 0.2,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            }
          }
        );
      });

      // 4. Scroll Velocity Marquee
      const marqueeInner = document.querySelector('.marquee-inner');
      if (marqueeInner) {
        gsap.to('.marquee-inner', {
          xPercent: -50,
          repeat: -1,
          duration: 15,
          ease: 'linear',
        });

        let proxy = { skew: 0 };
        const skewSetter = gsap.quickSetter(".marquee-item", "skewX", "deg");
        const clamp = gsap.utils.clamp(-20, 20);

        ScrollTrigger.create({
          onUpdate: (self) => {
            let skew = clamp(self.getVelocity() / -100);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
              proxy.skew = skew;
              gsap.to(proxy, { skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => skewSetter(proxy.skew) });
            }
          }
        });
      }

      // 5. Magnetic Button
      const magneticBtn = document.querySelector('.magnetic-btn');
      const magneticText = document.querySelector('.magnetic-text');
      if (magneticBtn && magneticText) {
        magneticBtn.addEventListener('mousemove', (e: any) => {
          const rect = magneticBtn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(magneticBtn, { x: x * 0.4, y: y * 0.4, duration: 0.6, ease: 'power3.out' });
          gsap.to(magneticText, { x: x * 0.2, y: y * 0.2, duration: 0.6, ease: 'power3.out' });
        });
        magneticBtn.addEventListener('mouseleave', () => {
          gsap.to(magneticBtn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
          gsap.to(magneticText, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
        });
      }

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="text-white min-h-screen font-sans selection:bg-[#4F46E5] selection:text-white relative">
      
      {/* DYNAMIC GLOBAL BACKGROUND */}
      <DynamicBackground />

      {/* SECTION 1: HERO (Cinematic, minimal, massive text) */}
      <section 
        className="relative w-full overflow-hidden z-10 pointer-events-none" 
        style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="hero-shuffle relative w-full h-[300px] max-w-7xl px-12 pointer-events-auto flex items-center justify-center">
          <TextPressure
            text="INVEGA CAPITAL"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={false}
            textColor="#ffffff"
            strokeColor="#ffffff"
            minFontSize={36}
          />
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50 pointer-events-auto">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">Scroll to discover</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/80 to-transparent"></div>
        </div>
      </section>

      {/* SECTION 2: THE INVEGA EDGE (Massive Horizontal Stat Strip) */}
      <EdgeSection />

      {/* SECTION 3: EXECUTIVE PROJECTS (Split Text Curtain - 3 Services) */}
      <ExecutiveSection />


      {/* SECTION 4: BRAIN TOPOLOGY AI (Editorial Dark Void) */}
      <section className="relative py-48 px-6 md:px-12 flex flex-col md:flex-row items-start justify-between text-left gap-16 border-t border-white/10 max-w-screen-2xl mx-auto">
        <div className="w-full md:w-1/2">
          <div className="text-white/60 uppercase tracking-[0.2em] text-xs font-bold mb-8 massive-text">Core Architecture</div>
          <h2 className="massive-text text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]">
            PREDICTING FLOWS<br/>BEFORE THEY HAPPEN.
          </h2>
        </div>
        <div className="w-full md:w-1/2 border-t border-white/20 pt-8 md:pt-0 md:border-t-0 md:border-l md:pl-16 min-h-[40vh] flex items-center">
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={2}
            blurStrength={8}
            textClassName="massive-text text-2xl md:text-4xl font-medium leading-snug text-white"
          >
            Our flagship model maps non-linear equity relationships using neural graph structures, calculating signal propagation across the entire NSE ecosystem.
          </ScrollReveal>
        </div>
      </section>

      {/* Consolidated Internal Pages */}
      <AboutSection />
      
      <ServicesSection />
      <ResearchSection />
      <ContactSection />
      
      {/* Cinematic Footer */}
      <CinematicFooter />
    </div>
  );
}
