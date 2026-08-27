'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useLabStore } from '@/lib/store';
import * as THREE from 'three';

export default function InteractiveCell() {
  const meshRef = useRef();
  const materialRef = useRef();
  
  const materialState = useLabStore((state) => state.materialState);
  const batterySpecs = useLabStore((state) => state.batterySpecs);
  const tickSimulation = useLabStore((state) => state.tickSimulation);

  useFrame((_, delta) => {
    // Run physics simulation tick
    tickSimulation(delta);

    // Dynamic Material Thermal Emission Shader interpolation
    if (materialRef.current) {
      const thermalColor = new THREE.Color('#ef4444').multiplyScalar(materialState.thermalGlow);
      materialRef.current.emissive = thermalColor;
      materialRef.current.emissiveIntensity = materialState.thermalGlow * 2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Battery Body Cylinder */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 2.5, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={materialState.color}
          roughness={materialState.roughness}
          metalness={materialState.metalness}
          wireframe={materialState.wireframe}
        />
      </mesh>

      {/* Positive Terminal Cap */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Negative Terminal Base */}
      <mesh position={[0, -1.3, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.1, 32]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}
