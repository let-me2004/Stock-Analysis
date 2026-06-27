"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Orb from "./Orb";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ExecutiveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !topTextRef.current || !bottomTextRef.current || !contentRef.current) return;
    if (!card1Ref.current || !card2Ref.current || !card3Ref.current) return;

    let ctx = gsap.context(() => {
      // Create the entire scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=500%", // 500% scroll distance for 3 cards
          pin: true,
          scrub: 1, 
        }
      });

      // We'll use a total timeline duration of 100 to think in percentages.

      // 0 - 10%: Text splits and content fades in
      tl.to(topTextRef.current, { yPercent: -100, rotationX: 45, opacity: 0, ease: "power2.inOut", duration: 10 }, 0);
      tl.to(bottomTextRef.current, { yPercent: 100, rotationX: -45, opacity: 0, ease: "power2.inOut", duration: 10 }, 0);
      
      tl.to(contentRef.current, { scale: 1, opacity: 1, ease: "power2.out", duration: 8 }, 2);

      // Ensure cards are fully opaque so we can see the entire staircase
      gsap.set(card1Ref.current, { opacity: 1 });
      gsap.set(card2Ref.current, { opacity: 0.6 }); 
      gsap.set(card3Ref.current, { opacity: 0.3 });

      // Reset carousel rotation and position
      // Push it back exactly by the radius of the spiral so the front card sits exactly at Z=0 (normal scale)
      gsap.set(carouselRef.current, { z: -500, rotationY: 0, y: 0 });

      // Continuous spiral animation for the carousel container
      // Rotate 90 degrees (since cards are spaced by 45deg) and move up 800px
      tl.to(carouselRef.current, {
        y: -800,
        rotationY: 90,
        ease: "none",
        duration: 80
      }, 10);

      // Opacity highlights as each card comes to the front (0deg relative to camera)
      // Card 1 fades out as it spirals up and left
      tl.to(card1Ref.current, { opacity: 0.2, duration: 40 }, 10);
      
      // Card 2 reaches front at 50% timeline mark (time 50)
      tl.to(card2Ref.current, { opacity: 1, duration: 40 }, 10); // 10 to 50
      tl.to(card2Ref.current, { opacity: 0.2, duration: 40 }, 50); // 50 to 90

      // Card 3 reaches front at 90% timeline mark
      tl.to(card3Ref.current, { opacity: 1, duration: 40 }, 50);

      // Pad out the end of the timeline slightly
      tl.to(carouselRef.current, { y: -800, duration: 10 }, 90);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center border-t border-white/10 z-30 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] rounded-t-[60px] md:rounded-t-[100px]"
      style={{ perspective: "1000px" }}
    >
      {/* Animated Monochromatic Orb Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-70">
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
          backgroundColor="#000000"
        />
      </div>

      {/* Underlying content to be revealed */}
      <div 
        ref={contentRef}
        className="absolute inset-0 grid place-items-center opacity-0 scale-75 pointer-events-none z-0"
        style={{ perspective: "2000px", transformStyle: "preserve-3d" }}
      >
        {/* The Carousel Wrapper that will rotate around the Y axis like ShowMe */}
        <div ref={carouselRef} className="relative w-full max-w-3xl h-[400px] flex items-center justify-center pointer-events-auto will-change-transform" style={{ transformStyle: "preserve-3d" }}>
          
          {/* CARD 1 WRAPPER */}
          <div className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d", transform: "rotateY(0deg)" }}>
            <div 
              ref={card1Ref} 
              className="absolute left-0 right-0 flex flex-col items-center justify-center text-center py-16 px-8 border border-black/10 bg-white rounded-[30px] shadow-2xl will-change-transform"
              style={{ transform: "translateY(0px) translateZ(500px)", backfaceVisibility: "hidden" }}
            >
              <span className="text-black/40 text-lg tracking-[0.3em] uppercase font-bold mb-4">Vector 01</span>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-black uppercase mb-4">Daily Signals</h3>
              <p className="text-black/70 text-lg max-w-xl leading-relaxed">Live pre-market and post-market NSE equity updates. Sector heatmaps, institutional flow tracking, and dynamic alerts.</p>
            </div>
          </div>

          {/* CARD 2 WRAPPER */}
          <div className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d", transform: "rotateY(-45deg)" }}>
            <div 
              ref={card2Ref} 
              className="absolute left-0 right-0 flex flex-col items-center justify-center text-center py-16 px-8 border border-black/10 bg-white rounded-[30px] shadow-2xl will-change-transform"
              style={{ transform: "translateY(400px) translateZ(500px)", backfaceVisibility: "hidden" }}
            >
              <span className="text-black/40 text-lg tracking-[0.3em] uppercase font-bold mb-4">Vector 02</span>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-black uppercase mb-4">Alpha Generation</h3>
              <p className="text-black/70 text-lg max-w-xl leading-relaxed">Proprietary statistical arbitrage strategies. Deep learning models applied to non-linear market inefficiencies.</p>
            </div>
          </div>

          {/* CARD 3 WRAPPER */}
          <div className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d", transform: "rotateY(-90deg)" }}>
            <div 
              ref={card3Ref} 
              className="absolute left-0 right-0 flex flex-col items-center justify-center text-center py-16 px-8 border border-black/10 bg-white rounded-[30px] shadow-2xl will-change-transform"
              style={{ transform: "translateY(800px) translateZ(500px)", backfaceVisibility: "hidden" }}
            >
              <span className="text-black/40 text-lg tracking-[0.3em] uppercase font-bold mb-4">Vector 03</span>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-black uppercase mb-4">Risk Arbitrage</h3>
              <p className="text-black/70 text-lg max-w-xl leading-relaxed">Automated hedging protocols and portfolio variance minimization. Convex payout structuring during high-volatility events.</p>
            </div>
          </div>

        </div>
      </div>

      {/* The Split Text Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max flex flex-col items-center justify-center text-[8vw] md:text-[8vw] font-bold leading-none tracking-tighter uppercase text-white z-10 pointer-events-none transform-style-3d whitespace-nowrap text-center">
        {/* Invisible placeholder to maintain width and height */}
        <div className="opacity-0 select-none whitespace-nowrap">EXECUTIVE VECTORS</div>
        
        {/* Top Half */}
        <div 
          ref={topTextRef}
          className="absolute inset-0 text-white select-none origin-bottom text-center whitespace-nowrap"
          style={{ clipPath: "inset(0 0 50% 0)" }}
        >
          EXECUTIVE VECTORS
        </div>

        {/* Bottom Half */}
        <div 
          ref={bottomTextRef}
          className="absolute inset-0 text-white select-none origin-top text-center whitespace-nowrap"
          style={{ clipPath: "inset(50% 0 0 0)" }}
        >
          EXECUTIVE VECTORS
        </div>
      </div>
      
    </section>
  );
}
