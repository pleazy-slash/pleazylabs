'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function TeslaMotorEngine() {
  const rotorRef = useRef();
  const [poles, setPoles] = useState(4);
  const [currentAmps, setCurrentAmps] = useState(15);
  const [wireGaugeAWG, setWireGaugeAWG] = useState(18);

  // Electromagnetic Physics Calculations
  // Magnetic Flux Density (B) ~ (Turns * Current) / AirGap
  const turnsPerCoil = Math.max(50, 300 - wireGaugeAWG * 8);
  const fluxDensityTesla = ((turnsPerCoil * currentAmps * 4 * Math.PI * 1e-7) / 0.002).toFixed(3);
  constCalculatedRPM = ((120 * 60) / poles).toFixed(0); // Synchronous speed at 60Hz

  useFrame((state, delta) => {
    if (rotorRef.current) {
      const speedRad = (theCalculatedRPM * Math.PI) / 30;
      rotorRef.current.rotation.z += delta * (speedRad * 0.05); // Scaled for visualization
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* STATOR HOUSING & COPPER COILS */}
      <group>
        {/* Outer Stator Iron Core */}
        <mesh receiveShadow castShadow>
          <torusGeometry args={[2.2, 0.4, 16, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Copper Windings arranged by Pole Count */}
        {Array.from({ length: poles }).map((_, i) => {
          const angle = (i / poles) * Math.PI * 2;
          const x = Math.cos(angle) * 2.2;
          const y = Math.sin(angle) * 2.2;
          return (
            <mesh key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
            </mesh>
          );
        })}
      </group>

      {/* INTERNAL ROTOR & PERMANENT MAGNETS */}
      <group ref={rotorRef}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.8, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Magnet Poles on Rotor */}
        {Array.from({ length: poles }).map((_, i) => {
          const angle = (i / poles) * Math.PI * 2;
          const x = Math.cos(angle) * 1.3;
          const y = Math.sin(angle) * 1.3;
          return (
            <mesh key={i} position={[x, y, 0]}>
              <boxGeometry args={[0.3, 0.4, 0.85]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#ef4444' : '#3b82f6'} />
            </mesh>
          );
        })}
      </group>

      {/* LIVE ELECTROMAGNETIC DASHBOARD */}
      <Html position={[-3.5, 2, 0]}>
        <div className="bg-slate-950/90 p-3 rounded-xl border border-amber-800/60 text-slate-200 text-xs shadow-2xl w-60 font-mono">
          <div className="font-bold text-amber-400 mb-2 border-b border-amber-900 pb-1 flex justify-between">
            <span>Electrodynamic Motor</span>
            <span className="text-[10px] text-amber-500/80">AC 60Hz</span>
          </div>

          <div className="space-y-2 mb-3">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Stator Poles</span>
                <span className="text-amber-300 font-bold">{poles} Poles</span>
              </div>
              <input
                type="range" min="2" max="12" step="2"
                value={poles} onChange={(e) => setPoles(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Coil Current (A)</span>
                <span className="text-amber-300 font-bold">{currentAmps} A</span>
              </div>
              <input
                type="range" min="1" max="50" step="1"
                value={currentAmps} onChange={(e) => setCurrentAmps(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1 text-[10px]">
            <div className="flex justify-between"><span>Wire Gauge:</span><span className="text-cyan-400">{wireGaugeAWG} AWG</span></div>
            <div className="flex justify-between"><span>Turns / Coil:</span><span className="text-cyan-400">{turnsPerCoil} turns</span></div>
            <div className="flex justify-between"><span>Flux Density (B):</span><span className="text-emerald-400">{fluxDensityTesla} Tesla</span></div>
            <div className="flex justify-between border-t border-slate-800 pt-1 font-bold">
              <span>Sync Speed:</span>
              <span className="text-amber-400">{theCalculatedRPM} RPM</span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
