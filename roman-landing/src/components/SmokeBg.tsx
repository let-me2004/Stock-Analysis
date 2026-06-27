"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function SmokeParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 600;
  
  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const rnd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      // eslint-disable-next-line react-hooks/purity
      pos[i * 3] = (Math.random() - 0.5) * 50;
      // eslint-disable-next-line react-hooks/purity
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      // eslint-disable-next-line react-hooks/purity
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      // eslint-disable-next-line react-hooks/purity
      rnd[i] = Math.random();
    }
    return { positions: pos, randoms: rnd };
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !particlesRef.current) return;
    const time = state.clock.elapsedTime;
    
    groupRef.current.rotation.y = time * 0.01;
    groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.05;

    const posAttr = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const origX = positions[i * 3];
      const origY = positions[i * 3 + 1];
      const origZ = positions[i * 3 + 2];
      
      const driftX = Math.sin(time * 0.2 + randoms[i] * 10) * 3;
      const driftY = Math.cos(time * 0.3 + randoms[i] * 10) * 3;
      
      posAttr.setXYZ(i, origX + driftX, origY + driftY, origZ);
    }
    posAttr.needsUpdate = true;
  });

  // Create a smoke-like material using a blurry radial gradient
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

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
        <pointsMaterial 
          map={texture}
          color="#ffffff" 
          size={12} 
          transparent 
          opacity={0.015} 
          depthWrite={false}
          blending={THREE.AdditiveBlending} 
        />
      </points>
    </group>
  );
}

export default function SmokeBg() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
        <SmokeParticles />
      </Canvas>
    </div>
  );
}
