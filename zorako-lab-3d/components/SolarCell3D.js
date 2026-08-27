'use client';
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

function LayerMesh({ position, thickness, color, name, index }) {
  const meshRef = useRef();

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[4, thickness, 4]} />
        <meshStandardMaterial 
          color={color || '#888888'} 
          metalness={0.6} 
          roughness={0.3} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
      <Text
        position={[2.3, 0, 0]}
        fontSize={0.25}
        color="#FFFFFF"
        anchorX="left"
        anchorY="middle"
      >
        {`${index + 1}. ${name}`}
      </Text>
    </group>
  );
}

export default function SolarCell3D({ layers = [] }) {
  let currentY = 0;

  return (
    <div className="w-full h-[450px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-emerald-400 font-mono">
        3D Optoelectronic Stack Visualizer
      </div>
      <Canvas camera={{ position: [6, 4, 8], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} />
        
        <group position={[0, -1, 0]}>
          {layers.map((layer, idx) => {
            const visualThickness = Math.max(0.15, Math.min(0.6, Number(layer.thickness_nm) / 200));
            const yPos = currentY + visualThickness / 2;
            currentY += visualThickness + 0.05; // Gap between layers

            return (
              <LayerMesh
                key={layer.id || idx}
                index={idx}
                position={[0, yPos, 0]}
                thickness={visualThickness}
                color={layer.perceived_hex_color || '#3b82f6'}
                name={layer.layer_name}
              />
            );
          })}
        </group>

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
