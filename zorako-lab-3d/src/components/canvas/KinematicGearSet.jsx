'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural Spur Gear Generator with realistic teeth geometry
 */
function SpurGear({ radius, teeth, thickness, color, speed, position, rotationDirection = 1 }) {
  const gearRef = useRef();

  useFrame((state, delta) => {
    if (gearRef.current) {
      gearRef.current.rotation.z += delta * speed * rotationDirection;
    }
  });

  // Simple procedural tooth profile construction
  const gearShape = new THREE.Shape();
  const outerRadius = radius + 0.15;
  const innerRadius = radius - 0.15;

  for (let i = 0; i < teeth; i++) {
    const angle1 = (i / teeth) * Math.PI * 2;
    const angle2 = ((i + 0.25) / teeth) * Math.PI * 2;
    const angle3 = ((i + 0.5) / teeth) * Math.PI * 2;
    const angle4 = ((i + 0.75) / teeth) * Math.PI * 2;

    if (i === 0) {
      gearShape.moveTo(Math.cos(angle1) * innerRadius, Math.sin(angle1) * innerRadius);
    } else {
      gearShape.lineTo(Math.cos(angle1) * innerRadius, Math.sin(angle1) * innerRadius);
    }

    gearShape.lineTo(Math.cos(angle2) * outerRadius, Math.sin(angle2) * outerRadius);
    gearShape.lineTo(Math.cos(angle3) * outerRadius, Math.sin(angle3) * outerRadius);
    gearShape.lineTo(Math.cos(angle4) * innerRadius, Math.sin(angle4) * innerRadius);
  }

  const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };

  return (
    <group position={position}>
      <mesh ref={gearRef} castShadow receiveShadow>
        <extrudeGeometry args={[gearShape, extrudeSettings]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default function KinematicGearSet() {
  const [rpm, setRpm] = useState(30);

  return (
    <group position={[0, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
      {/* Driver Gear (12 Teeth) */}
      <SpurGear 
        radius={1.0} 
        teeth={12} 
        thickness={0.3} 
        color="#38bdf8" 
        speed={(rpm * Math.PI) / 30} 
        position={[-1.05, 0, 0]} 
        rotationDirection={1} 
      />

      {/* Driven Gear (24 Teeth - 1:2 Reduction Ratio) */}
      <SpurGear 
        radius={2.0} 
        teeth={24} 
        thickness={0.3} 
        color="#fbbf24" 
        speed={((rpm / 2) * Math.PI) / 30} 
        position={[2.0, 0, 0]} 
        rotationDirection={-1} 
      />

      {/* Control UI Overlay */}
      <Html position={[-3, -2, 0]}>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 text-slate-200 text-xs shadow-xl w-52 font-mono">
          <div className="font-bold text-cyan-400 mb-2 border-b border-slate-700 pb-1">
            Kinematic Motion Drive
          </div>
          <label className="block mb-1 text-[10px] text-slate-400">Motor Speed (RPM)</label>
          <input 
            type="range" min="0" max="120" step="5" 
            value={rpm} onChange={(e) => setRpm(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 mb-2"
          />
          <div className="text-[10px] space-y-0.5 text-slate-300">
            <div className="flex justify-between"><span>Gear Ratio:</span><span className="text-amber-400">1 : 2</span></div>
            <div className="flex justify-between"><span>Input Speed:</span><span className="text-cyan-400">{rpm} RPM</span></div>
            <div className="flex justify-between"><span>Output Speed:</span><span className="text-emerald-400">{rpm / 2} RPM</span></div>
          </div>
        </div>
      </Html>
    </group>
  );
}
