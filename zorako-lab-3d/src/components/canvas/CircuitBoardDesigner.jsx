'use client';

import { useState } from 'react';
import { Html } from '@react-three/drei';

export default function CircuitBoardDesigner() {
  // State to hold electronic components placed on the board
  const [boardParts, setBoardParts] = useState([
    { id: 1, type: 'IC_CHIP', x: 0, z: 0, rotation: 0 },
  ]);
  const [selectedTool, setSelectedTool] = useState('BJT_TRANSISTOR');

  // Handle clicking on the board to place a new component
  const handleBoardClick = (e) => {
    e.stopPropagation();
    const { x, z } = e.point;
    
    // Snap to a simple 0.5mm grid
    const snapX = Math.round(x * 2) / 2;
    const snapZ = Math.round(z * 2) / 2;

    setBoardParts((prev) => [
      ...prev,
      { id: Date.now(), type: selectedTool, x: snapX, z: snapZ, rotation: 0 }
    ]);
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Electronic Engineering UI Panel */}
      <Html position={[-3, 2, 0]}>
        <div className="bg-slate-950/95 p-3 rounded-lg border border-emerald-800 text-slate-200 text-xs shadow-xl w-56 font-mono">
          <div className="font-bold text-emerald-400 mb-2 border-b border-emerald-900 pb-1">
            PCB Component Placer
          </div>
          <div className="mb-2 text-[10px] text-slate-400">Select part to solder:</div>
          
          <select 
            className="w-full bg-slate-900 border border-emerald-700 text-emerald-300 rounded p-1 mb-3 outline-none"
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
          >
            <option value="BJT_TRANSISTOR">NPN BJT Transistor (TO-92)</option>
            <option value="IC_CHIP">Microcontroller IC (DIP-8)</option>
            <option value="SMD_RESISTOR">SMD Resistor (0805)</option>
          </select>

          <div className="text-[9px] text-slate-500">
            Click the green FR4 substrate to place the selected component on the copper grid.
          </div>
        </div>
      </Html>

      {/* The PCB Substrate (FR4 Material) */}
      <mesh position={[0, -0.05, 0]} onClick={handleBoardClick} receiveShadow>
        <boxGeometry args={[5, 0.1, 4]} />
        {/* Classic Green PCB look */}
        <meshStandardMaterial color="#022c15" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Render Placed Components */}
      {boardParts.map((part) => (
        <group key={part.id} position={[part.x, 0, part.z]} rotation={[0, part.rotation, 0]}>
          
          {part.type === 'IC_CHIP' && (
            <group>
              {/* Black Resin Body */}
              <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[1, 0.4, 0.8]} />
                <meshStandardMaterial color="#111" roughness={0.8} />
              </mesh>
              {/* Silver Pins (Simplified) */}
              <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[1.1, 0.2, 0.9]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          )}

          {part.type === 'BJT_TRANSISTOR' && (
            <group>
              {/* D-shaped Transistor Body (TO-92) */}
              <mesh position={[0, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.5, 16, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#111" roughness={0.8} />
              </mesh>
              {/* 3 Legs (Collector, Base, Emitter) */}
              <mesh position={[-0.1, 0.1, 0]}><cylinderGeometry args={[0.02, 0.02, 0.2]} /><meshStandardMaterial color="#94a3b8" metalness={1} /></mesh>
              <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.02, 0.02, 0.2]} /><meshStandardMaterial color="#94a3b8" metalness={1} /></mesh>
              <mesh position={[0.1, 0.1, 0]}><cylinderGeometry args={[0.02, 0.02, 0.2]} /><meshStandardMaterial color="#94a3b8" metalness={1} /></mesh>
            </group>
          )}

          {part.type === 'SMD_RESISTOR' && (
            <mesh position={[0, 0.05, 0]} castShadow>
              <boxGeometry args={[0.2, 0.1, 0.1]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          )}
          
        </group>
      ))}
    </group>
  );
}
