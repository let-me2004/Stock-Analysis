import Link from "next/link";
import React from "react";

export default function FooterSection() {
  return (
    <footer className="w-full min-h-screen bg-black border-t border-white/20 flex flex-col md:flex-row text-white">
      {/* LEFT SIDE */}
      <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen border-b md:border-b-0 md:border-r border-white/20 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden group">
        
        {/* Subtle grid background on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div>
          <h2 className="text-[12vw] md:text-[8vw] font-black tracking-tighter leading-[0.8] mb-6">
            INVEGA<br />CAPITAL.
          </h2>
          <p className="text-white/60 text-lg md:text-xl font-light max-w-md">
            Algorithmic precision. Absolute returns. 
            Navigating the complexities of the modern equity ecosystem.
          </p>
        </div>

        <div className="mt-24 md:mt-0">
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden group-hover:border-white transition-colors duration-500">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen p-8 md:p-16 flex flex-col justify-between">
        
        <div className="grid grid-cols-2 gap-12 w-full max-w-md">
          {/* Navigation Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Index</h3>
            <Link href="#about" className="text-2xl md:text-3xl font-medium tracking-tight hover:text-white/60 transition-colors">About</Link>
            <Link href="#services" className="text-2xl md:text-3xl font-medium tracking-tight hover:text-white/60 transition-colors">Architecture</Link>
            <Link href="#research" className="text-2xl md:text-3xl font-medium tracking-tight hover:text-white/60 transition-colors">Research</Link>
            <Link href="#contact" className="text-2xl md:text-3xl font-medium tracking-tight hover:text-white/60 transition-colors">Contact</Link>
          </div>

          {/* Socials / Legal */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Network</h3>
            <a href="#" className="text-lg text-white/70 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-lg text-white/70 hover:text-white transition-colors">Twitter (X)</a>
            <a href="#" className="text-lg text-white/70 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>

        {/* Bottom Address / Copyright */}
        <div className="mt-24 w-full pt-8 border-t border-white/10 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Headquarters</h4>
            <p className="text-white/70 font-mono text-sm">
              Level 42, Cyber Hub<br/>
              DLF Phase 2, Gurugram<br/>
              Haryana 122002, India
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/30">
            <span>© 2026 INVEGA</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
