"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import OrbitalRings, { RingData } from "./OrbitalRings";

gsap.registerPlugin(ScrollTrigger);

const edgeData: RingData[] = [
  { value: 14, suffix: "", label: "Analytical Components" },
  { value: 100, suffix: "%", label: "Systematic Processing" },
  { value: 330, suffix: "ms", label: "Signal Latency" },
];

export default function EdgeSection() {
  const containerRef = useRef<HTMLElement>(null);
  const ringsContainerRef = useRef<HTMLDivElement>(null);
  const fixedOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !ringsContainerRef.current || !fixedOverlayRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Fade in the fixed overlay immediately when the user starts scrolling past the Hero section
      gsap.fromTo(
        fixedOverlayRef.current,
        { autoAlpha: 0 }, 
        {
          autoAlpha: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom", 
            end: "top center",   
            scrub: true,
          }
        }
      );

      // 2. Animate the Orbital Rings
      // Start slightly pitched down, zoomed out, and rotated away
      gsap.fromTo(
        ringsContainerRef.current,
        { 
          scale: 0.2, 
          rotationX: 60,
          rotationY: -45,
          z: -1000 
        },
        {
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          z: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "center center", 
            scrub: true,
            onUpdate: (self) => {
              // Trigger number animation when we reach 80% of the entrance animation
              if (self.progress > 0.8 && !ringsContainerRef.current?.dataset.counted) {
                ringsContainerRef.current!.dataset.counted = "true";
                
                // Animate numbers
                const numbers = ringsContainerRef.current!.querySelectorAll('.orbital-number');
                numbers.forEach((el) => {
                  const target = parseFloat((el as HTMLElement).dataset.target || "0");
                  const proxy = { val: 0 };
                  gsap.to(proxy, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                      el.innerHTML = Math.round(proxy.val).toString();
                    }
                  });
                });
              } else if (self.progress < 0.5 && ringsContainerRef.current?.dataset.counted) {
                // Reset if they scroll back up
                ringsContainerRef.current!.dataset.counted = "";
                const numbers = ringsContainerRef.current!.querySelectorAll('.orbital-number');
                numbers.forEach((el) => {
                  el.innerHTML = "0";
                });
              }
            }
          }
        }
      );

      // 3. Fade it out and hide it when scrolling past to the next section
      gsap.to(
        fixedOverlayRef.current,
        {
          autoAlpha: 0,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[250vh] bg-transparent border-y border-white/10 z-10 pointer-events-none">
      
      {/* FIXED OVERLAY - Only visible when scrolling through this 250vh section */}
      <div ref={fixedOverlayRef} className="fixed inset-0 flex flex-col items-center justify-center z-50 pointer-events-none invisible" style={{ perspective: "2000px" }}>
        
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-white/60 uppercase tracking-[0.3em] text-xs font-bold pointer-events-none text-center w-full">
          The Invega Edge
        </div>
        
        {/* Centered orbital rings container */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <OrbitalRings data={edgeData} containerRef={ringsContainerRef} />
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 uppercase tracking-[0.2em] text-[10px] pointer-events-none text-center w-full">
          Keep scrolling to align metrics
        </div>
      </div>

    </section>
  );
}
