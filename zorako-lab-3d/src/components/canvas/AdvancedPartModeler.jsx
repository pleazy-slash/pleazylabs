'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Geometry, Base, Subtraction, Addition } from '@react-three/csg';
import * as THREE from 'three';

export default function AdvancedPartModeler() {
  const meshRef = useRef();

  useFrame((state) => {
    // Slowly rotate to inspect the custom cut joints
    if (meshRef.current) meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <group position={[0, 1, 0]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.2} />
        
        {/* CSG Operations: Building a custom mechanical joint */}
        <Geometry>
          {/* 1. The Base Block */}
          <Base position={[0, 0, 0]}>
            <boxGeometry args={[2, 1, 2]} />
          </Base>

          {/* 2. Subtracting a cylinder to create a joint hole */}
          <Subtraction position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 3, 32]} />
          </Subtraction>

          {/* 3. Subtracting a rotated box to create an angled WEDGE */}
          <Subtraction position={[1, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.5, 1.5, 2.5]} />
          </Subtraction>

          {/* 4. Adding a mounting bracket */}
          <Addition position={[-1.2, 0, 0]}>
            <boxGeometry args={[0.4, 0.8, 1]} />
          </Addition>
        </Geometry>
      </mesh>
    </group>
  );
}
