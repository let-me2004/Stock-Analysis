"use client";
import { useState } from "react";
import TopologyHero from "./TopologyHero";
import MatrixBg from "./MatrixBg";
import SmokeBg from "./SmokeBg";
import OpticalGridBg from "./OpticalGridBg";
import ShatteringBg from "./ShatteringBg";
import BrainZoomBg from "./BrainZoomBg";
import Orb from "./Orb";
export default function DynamicBackground() {
  const [bgType, setBgType] = useState<"brain" | "shatter" | "optical" | "neural" | "matrix" | "smoke">("brain");

  return (
    <>
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
        {/* The base black background */}
        <div className="absolute inset-0 bg-black"></div>
        
        {/* The active background layer */}
        {bgType === "brain" && <BrainZoomBg />}
        {bgType === "shatter" && <ShatteringBg />}
        {bgType === "optical" && <OpticalGridBg />}
        {bgType === "neural" && <TopologyHero />}
        {bgType === "matrix" && <MatrixBg />}
        {bgType === "smoke" && <SmokeBg />}
      </div>
    </>
  );
}
