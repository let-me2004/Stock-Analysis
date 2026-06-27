"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function BrainCore() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 6000;
  
  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const rnd = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Create a dense spherical core
      const r = 10 * Math.cbrt(Math.random()); 
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      rnd[i] = Math.random();
    }
    return { positions: pos, randoms: rnd };
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !particlesRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Smooth cinematic rotation
    groupRef.current.rotation.y = time * 0.05;
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.2;

    const posAttr = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const origX = positions[i * 3];
      const origY = positions[i * 3 + 1];
      const origZ = positions[i * 3 + 2];
      
      const dist = Math.sqrt(origX*origX + origY*origY + origZ*origZ);
      
      // Abstract neural pulsing
      const pulse = 1 + Math.sin(time * 3 + dist + randoms[i] * 15) * 0.04;
      
      posAttr.setXYZ(i, origX * pulse, origY * pulse, origZ * pulse);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            args={[new Float32Array(positions), 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#818CF8" size={0.06} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* Structural neural cage */}
      <mesh>
        <sphereGeometry args={[10.5, 24, 24]} />
        <meshBasicMaterial color="#4F46E5" transparent opacity={0.8} wireframe />
      </mesh>
    </group>
  );
}

export default function TopologyHero() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 35], fov: 45 }}>
        <fog attach="fog" args={["#0A0E1A", 15, 35]} />
        <BrainCore />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1A]/50 via-transparent to-[#0A0E1A]"></div>
    </div>
  );
}
