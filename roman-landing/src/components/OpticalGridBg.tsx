"use client";
import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function GridPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  const { mouse, camera } = useThree();

  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // To avoid reallocating memory, we compute once
  const { originalPositions } = useMemo(() => {
    return { originalPositions: [] as number[] };
  }, []);

  useFrame(({ clock }) => {
    if (!geomRef.current || !meshRef.current) return;

    const posAttr = geomRef.current.attributes.position;
    
    // Store original flat positions on first frame
    if (originalPositions.length === 0) {
      for (let i = 0; i < posAttr.count; i++) {
        originalPositions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      }
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    
    let targetX = 9999;
    let targetY = 9999;

    if (intersects.length > 0) {
      // The point of intersection in the local space of the plane
      const localPoint = meshRef.current.worldToLocal(intersects[0].point.clone());
      targetX = localPoint.x;
      targetY = localPoint.y;
    }

    const time = clock.getElapsedTime();

    for (let i = 0; i < posAttr.count; i++) {
      const x = originalPositions[i * 3];
      const y = originalPositions[i * 3 + 1];
      const z = originalPositions[i * 3 + 2];

      const dx = x - targetX;
      const dy = y - targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // The black hole distortion
      const radius = 25;
      const strength = -18; // Pull heavily down into a hole
      
      let newZ = z;
      if (dist < radius) {
        // Smooth exponential falloff for the gravity well
        const falloff = Math.exp(-Math.pow(dist / (radius * 0.4), 2));
        newZ = z + falloff * strength;
      }
      
      // Idle wave across the grid to keep it feeling alive and aggressive
      newZ += Math.sin(x * 0.3 + time * 2) * 1.5 + Math.cos(y * 0.3 + time * 1.5) * 1.5;

      posAttr.setZ(i, newZ);
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -5, -15]}>
      <planeGeometry ref={geomRef} args={[200, 200, 150, 150]} />
      <meshBasicMaterial 
        color="#ffffff" 
        wireframe={true} 
        transparent={true}
        opacity={0.25}
      />
    </mesh>
  );
}

export default function OpticalGridBg() {
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Attach event source to body so mouse is tracked everywhere
    setEventSource(document.body);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 5, 20], fov: 60 }} 
        eventSource={eventSource || undefined}
        eventPrefix="client"
      >
        {/* Aggressive vignette/fog to blend into the black background */}
        <fog attach="fog" args={["#000000", 10, 70]} />
        <GridPlane />
      </Canvas>
    </div>
  );
}
