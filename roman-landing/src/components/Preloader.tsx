"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Shuffle from "@/components/Shuffle";

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);
  const [text, setText] = useState("नमस्ते");

  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden';

    // Switch to English text after 1.5 seconds
    const timer1 = setTimeout(() => {
      setText("NAMASTE");
    }, 1500);

    // Slide up the preloader after 3.5 seconds
    const timer2 = setTimeout(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
          onComplete: () => {
            document.body.style.overflow = '';
            setIsDone(true);
          }
        });
      }
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      document.body.style.overflow = '';
    };
  }, []);

  if (isDone) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-white text-black pointer-events-none"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
        {text === "नमस्ते" ? (
          <h1 className="text-[12vw] md:text-[10vw] font-bold tracking-tighter uppercase leading-none whitespace-nowrap inline-block">
            {text}
          </h1>
        ) : (
          <Shuffle
            key={text}
            text={text}
            tag="h1"
            className="text-[12vw] md:text-[10vw] font-bold tracking-tighter uppercase leading-none whitespace-nowrap inline-block"
            shuffleDirection="down"
            duration={0.8}
            scrambleCharset="01"
            animationMode="random"
            maxDelay={0.3}
          />
        )}
      </div>
    </div>
  );
}
