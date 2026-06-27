"use client";
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Monolith() {
  // Create an Octahedron scaled to look like a tall crystal/monolith
  const { geometry, originalPositions, explosionDirs, rotations, faceCount } = useMemo(() => {
    const baseGeom = new THREE.OctahedronGeometry(6, 3); // 3 detail = 512 faces
    baseGeom.scale(1, 1.8, 1); // Make it tall
    
    // We need a non-indexed geometry so each triangle can separate independently
    const nonIndexed = baseGeom.toNonIndexed();
    const niPos = nonIndexed.attributes.position;
    const faceCount = niPos.count / 3;
    
    const originalPositions = new Float32Array(niPos.array);
    const explosionDirs = new Float32Array(faceCount * 3);
    const rotations = new Float32Array(faceCount * 3);
    
    for (let i = 0; i < faceCount; i++) {
      // Find the center of this triangle
      const cx = (originalPositions[i*9] + originalPositions[i*9+3] + originalPositions[i*9+6]) / 3;
      const cy = (originalPositions[i*9+1] + originalPositions[i*9+4] + originalPositions[i*9+7]) / 3;
      const cz = (originalPositions[i*9+2] + originalPositions[i*9+5] + originalPositions[i*9+8]) / 3;
      
      const center = new THREE.Vector3(cx, cy, cz).normalize();
      
      // Explosion direction is outwards plus some randomness for chaos
      explosionDirs[i*3] = center.x * 2 + (Math.random() - 0.5);
      explosionDirs[i*3+1] = center.y * 2 + (Math.random() - 0.5);
      explosionDirs[i*3+2] = center.z * 2 + (Math.random() - 0.5);
      
      // Random rotation axis for each shard
      rotations[i*3] = Math.random() - 0.5;
      rotations[i*3+1] = Math.random() - 0.5;
      rotations[i*3+2] = Math.random() - 0.5;
    }
    
    return { geometry: nonIndexed, originalPositions, explosionDirs, rotations, faceCount };
  }, []);

  const meshObjRef = useRef<THREE.Mesh>(null);
  
  // Track shatter amount (0 = solid, >0 = shattered)
  const targetShatter = useRef(0);
  const currentShatter = useRef(0);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const velocity = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;
      
      // Increase shatter target based on velocity, clamp to max 20
      targetShatter.current = Math.min(targetShatter.current + velocity * 0.08, 20);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    if (!meshObjRef.current) return;
    
    // Gravity/magnetism: Smoothly pull the shatter back to 0 (reassemble)
    targetShatter.current = THREE.MathUtils.lerp(targetShatter.current, 0, 0.03);
    
    // Smoothly animate current shatter towards target
    currentShatter.current = THREE.MathUtils.lerp(currentShatter.current, targetShatter.current, 0.1);
    
    // Base hover and slow rotation of the entire monolith
    const time = state.clock.elapsedTime;
    meshObjRef.current.rotation.y = time * 0.15;
    meshObjRef.current.rotation.z = Math.sin(time * 0.2) * 0.1;
    meshObjRef.current.position.y = Math.sin(time) * 0.5;
    
    const posAttr = geometry.attributes.position;
    
    // Temp objects for math
    const dummy = new THREE.Object3D();
    const vec = new THREE.Vector3();
    
    const shatterAmount = currentShatter.current;
    
    for (let i = 0; i < faceCount; i++) {
      const dirX = explosionDirs[i*3];
      const dirY = explosionDirs[i*3+1];
      const dirZ = explosionDirs[i*3+2];
      
      const rotX = rotations[i*3] * shatterAmount * 0.5;
      const rotY = rotations[i*3+1] * shatterAmount * 0.5;
      const rotZ = rotations[i*3+2] * shatterAmount * 0.5;
      
      const cx = (originalPositions[i*9] + originalPositions[i*9+3] + originalPositions[i*9+6]) / 3;
      const cy = (originalPositions[i*9+1] + originalPositions[i*9+4] + originalPositions[i*9+7]) / 3;
      const cz = (originalPositions[i*9+2] + originalPositions[i*9+5] + originalPositions[i*9+8]) / 3;
      
      dummy.position.set(cx, cy, cz);
      dummy.rotation.set(rotX, rotY, rotZ);
      dummy.updateMatrix();
      
      for(let v = 0; v < 3; v++) {
        vec.set(
          originalPositions[i*9 + v*3] - cx,
          originalPositions[i*9 + v*3+1] - cy,
          originalPositions[i*9 + v*3+2] - cz
        );
        
        vec.applyMatrix4(dummy.matrix);
        
        const dispX = cx + dirX * shatterAmount;
        const dispY = cy + dirY * shatterAmount;
        const dispZ = cz + dirZ * shatterAmount;
        
        posAttr.setXYZ(i*3 + v, vec.x + dispX, vec.y + dispY, vec.z + dispZ);
      }
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <mesh ref={meshObjRef} geometry={geometry}>
      <meshStandardMaterial 
        color="#ffffff"
        wireframe={true} // Brutalist wireframe
        transparent={true}
        opacity={0.3}
      />
    </mesh>
  );
}

export default function ShatteringBg() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
        <fog attach="fog" args={["#000000", 15, 50]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <Monolith />
      </Canvas>
    </div>
  );
}
