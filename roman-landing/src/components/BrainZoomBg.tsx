"use client";
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NeuronTunnel() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 15000;
  const tunnelDepth = 2000;
  const tunnelRadius = 80;

  const { positions, randoms, types } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const rnd = new Float32Array(particleCount);
    const typ = new Float32Array(particleCount); // 1 = brain core, 0 = tunnel neuron
    
    for (let i = 0; i < particleCount; i++) {
      const isBrainCore = Math.random() > 0.5; // 50% of particles form the brain at start
      
      if (isBrainCore) {
        // Brain-like shape (two hemispheres)
        const hemisphere = Math.random() > 0.5 ? 1 : -1;
        const r = 35 * Math.cbrt(Math.random()); 
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Base spherical coordinates
        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi);
        
        // 1. Stretch into an ellipsoid (longer front-to-back, wider side-to-side)
        z *= 1.3;
        x *= 1.1;
        
        // 2. Taper the front lobe (+Z) and widen the back lobe (-Z)
        if (z > 0) {
          x *= (1 - z * 0.015);
        } else {
          x *= (1 - z * 0.005);
        }
        
        // 3. Flatten the bottom, but add hanging temporal lobes on the sides
        if (y < 0) {
          y *= 0.6; // Flatten the base
          if (Math.abs(x) > 15 && z > -10 && z < 20) {
            y -= 4 * ((Math.abs(x) - 15) / 10); // Pull down the sides
          }
        }
        
        // 4. Create the longitudinal fissure (much stronger split)
        const splitAmount = Math.max(1.5, y * 0.15 + 2.5);
        x += hemisphere * splitAmount;
        
        // 5. Add "folds" (gyri/sulci)
        const noise = Math.sin(x * 1.2) * Math.cos(y * 1.2) * Math.sin(z * 1.2);
        x += noise * 1.5;
        y += noise * 1.5;
        z += noise * 1.5;
        
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
        typ[i] = 1; // Mark as brain
      } else {
        // The endless neural tunnel
        const theta = Math.random() * 2 * Math.PI;
        // Concentrate particles towards the center to create a dense core feeling
        const r = tunnelRadius * Math.pow(Math.random(), 2); 
        
        pos[i * 3] = r * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(theta);
        // Distribute deeply along negative Z
        pos[i * 3 + 2] = (Math.random() * -tunnelDepth) - 50;
        typ[i] = 0; // Mark as tunnel
      }
      
      rnd[i] = Math.random();
    }
    return { positions: pos, randoms: rnd, types: typ };
  }, []);

  const cameraZ = useRef(100); // Start further back to see the massive brain
  const targetCameraZ = useRef(100);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(scrollY / Math.max(maxScroll, 1), 1); // 0 to 1
      
      // As you scroll from 0 to 1, camera goes from 100 (outside brain) to deep inside the neurons
      targetCameraZ.current = 100 - (scrollProgress * 2000);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Smoothly interpolate camera position towards target
    cameraZ.current = THREE.MathUtils.lerp(cameraZ.current, targetCameraZ.current, 0.05);
    state.camera.position.z = cameraZ.current;
    
    const time = state.clock.elapsedTime;
    
    // Cinematic camera drift and rotation to feel like "flying"
    state.camera.position.x = Math.sin(time * 0.15) * 8;
    state.camera.position.y = Math.cos(time * 0.1) * 8;
    // Bank the camera into the turns
    state.camera.rotation.z = Math.sin(time * 0.15) * 0.15;
    
    // Add subtle rotation to the brain core itself to make it alive
    pointsRef.current.rotation.y = time * 0.05;
    
    const posAttr = pointsRef.current.geometry.attributes.position;
    
    for (let i = 0; i < particleCount; i++) {
      const isBrain = types[i] === 1;
      const z = posAttr.getZ(i);
      
      // Infinite recycling ONLY for the tunnel particles
      if (!isBrain) {
        // If particle passed far behind camera, spawn it deep ahead
        if (z > state.camera.position.z + 50) {
          posAttr.setZ(i, state.camera.position.z - tunnelDepth + (Math.random() * 100));
        } 
        // If user scrolls back up fast and particle is left too deep, bring it back behind camera
        else if (z < state.camera.position.z - tunnelDepth - 50) {
          posAttr.setZ(i, state.camera.position.z + 50 + (Math.random() * 100));
        }
      }
      
      // Individual neuron pulsing/jitter for a living organic feel
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const jitterSpeed = isBrain ? 3 : 1;
      const newX = x + Math.sin(time * jitterSpeed + randoms[i] * 100) * 0.03;
      const newY = y + Math.cos(time * jitterSpeed + randoms[i] * 100) * 0.03;
      
      posAttr.setX(i, newX);
      posAttr.setY(i, newY);
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      {/* Intense bright white for high tech minimalist feel */}
      <pointsMaterial 
        color="#ffffff" 
        size={0.2} 
        transparent={true} 
        opacity={0.7}
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </points>
  );
}

export default function BrainZoomBg() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      {/* Set FOV high for a stronger speed/tunnel effect */}
      <Canvas camera={{ position: [0, 0, 100], fov: 75 }}>
        {/* Deep pitch black fog so neurons fade into the void instead of suddenly popping in */}
        <fog attach="fog" args={["#000000", 30, 350]} />
        <NeuronTunnel />
      </Canvas>
    </div>
  );
}
