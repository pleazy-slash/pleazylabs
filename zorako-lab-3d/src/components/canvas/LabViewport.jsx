'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import KinematicGearSet from './KinematicGearSet';
import TeslaMotorEngine from './TeslaMotorEngine';
import PythonTerminal from '../ui/PythonTerminal';

export default function LabViewport() {
  const [activeModule, setActiveModule] = useState('TESLA_MOTOR');

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* Module Selector Bar */}
      <div className="absolute top-4 left-4 z-30 flex gap-2 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveModule('KINEMATICS')}
          className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
            activeModule === 'KINEMATICS'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GEAR KINEMATICS
        </button>
        <button
          onClick={() => setActiveModule('TESLA_MOTOR')}
          className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
            activeModule === 'TESLA_MOTOR'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          TESLA MOTOR (FLUX)
        </button>
      </div>

      {/* Embedded Python Automation Terminal */}
      <PythonTerminal />

      {/* 3D WebGL Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={50} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />

        {/* Dynamic Module Rendering */}
        {activeModule === 'KINEMATICS' && <KinematicGearSet />}
        {activeModule === 'TESLA_MOTOR' && <TeslaMotorEngine />}
      </Canvas>
    </div>
  );
}
