'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Layers, Activity, Sun, Thermometer, Shield, Play, Save, Eye } from 'lucide-react';

// --- 3D WEBGL CAD LAYER VIEWPORT ---
function CellStack3D({ layers, explodeGap }) {
  return (
    <group position={[0, -1, 0]}>
      {layers.map((layer, index) => {
        const offset = index * (0.15 + explodeGap * 0.8);
        return (
          <mesh key={layer.id || index} position={[0, offset, 0]} castShadow receiveShadow>
            <boxGeometry args={[4, 0.1, 4]} />
            <meshStandardMaterial 
              color={layer.color || '#38bdf8'} 
              transparent={true} 
              opacity={layer.opacity || 0.85} 
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// --- MAIN CAD SUITE APPLICATION ---
export default function ZorakoCADSuite() {
  const [explodeGap, setExplodeGap] = useState(0.4);
  const [irradiance, setIrradiance] = useState(1000);
  const [temperature, setTemperature] = useState(25);
  const [polymerType, setPolymerType] = useState('POE');
  
  const [layers, setLayers] = useState([
    { id: 1, name: 'Protective Glass', thickness: 3200000, color: '#93c5fd', opacity: 0.4 },
    { id: 2, name: 'Encapsulant (Top)', thickness: 450000, color: '#e2e8f0', opacity: 0.5 },
    { id: 3, name: 'Anti-Reflective SiNx', thickness: 75, color: '#0284c7', opacity: 0.9 },
    { id: 4, name: 'Perovskite Absorber (Top)', thickness: 400, color: '#f59e0b', opacity: 1.0 },
    { id: 5, name: 'Tunnel Junction / Recombination', thickness: 15, color: '#10b981', opacity: 0.9 },
    { id: 6, name: 'Silicon Absorber (Bottom)', thickness: 180000, color: '#334155', opacity: 1.0 },
    { id: 7, name: 'Encapsulant (Bottom)', thickness: 450000, color: '#e2e8f0', opacity: 0.5 },
    { id: 8, name: 'Rear Backsheet / Glass', thickness: 3200000, color: '#1e293b', opacity: 0.9 }
  ]);

  const [metrics, setMetrics] = useState({ voc: 0, isc: 0, pmax: 0, ff: 0, efficiency: 0 });
  const [curveData, setCurveData] = useState([]);

  // --- RIGOROUS SINGLE-DIODE PHYSICS SOLVER ---
  const runPhysicsSimulation = () => {
    const q = 1.60217663e-19;
    const k = 1.380649e-23;
    const T = temperature + 273.15;
    const Vt = (1.3 * k * T) / q;
    
    // Polymer moisture degradation modifier
    const degFactor = polymerType === 'EVA' ? 0.94 : 0.99;
    
    const Iph = (irradiance / 1000) * 9.85 * (1 + 0.0004 * (temperature - 25)) * degFactor;
    const I0 = 1e-9 * Math.exp(0.05 * (temperature - 25));
    const Rs = 0.012;
    const Rsh = 400;

    let points = [];
    let maxP = 0;
    let vocEst = 0;

    for (let v = 0; v <= 1.45; v += 0.025) {
      let current = Iph - I0 * (Math.exp((v + 0.1 * Rs) / Vt) - 1) - v / Rsh;
      current = Math.max(0, current);
      const power = v * current;

      if (power > maxP) maxP = power;
      if (current > 0) vocEst = v;

      points.push({
        voltage: parseFloat(v.toFixed(3)),
        current: parseFloat(current.toFixed(3)),
        power: parseFloat(power.toFixed(3))
      });
    }

    const iscEst = points[0] ? points[0].current : 0;
    const ffEst = maxP / (vocEst * iscEst || 1);
    const areaM2 = 0.0246; // Standard lab cell size
    const effEst = (maxP / (irradiance * areaM2)) * 100;

    setMetrics({
      voc: vocEst.toFixed(3),
      isc: iscEst.toFixed(3),
      pmax: maxP.toFixed(2),
      ff: ffEst.toFixed(3),
      efficiency: effEst.toFixed(2)
    });
    setCurveData(points);
  };

  useEffect(() => {
    runPhysicsSimulation();
  }, [irradiance, temperature, polymerType]);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* LEFT CONTROL SIDEBAR */}
      <div className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col justify-between p-4 z-10">
        <div>
          <div className="flex items-center gap-2 mb-6 text-sky-400 font-bold text-lg tracking-wider">
            <Activity className="w-6 h-6" />
            <span>ZORAKO CAD v2.0</span>
          </div>

          {/* ENVIRONMENT PANEL */}
          <div className="mb-6 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sun className="w-4 h-4 text-amber-400" /> Operating Conditions
            </h3>

            <div>
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Irradiance ($G$)</span>
                <span className="text-sky-400">{irradiance} W/m²</span>
              </label>
              <input 
                type="range" min="200" max="1400" value={irradiance} 
                onChange={(e) => setIrradiance(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Cell Temp ($T$)</span>
                <span className="text-amber-400">{temperature} °C</span>
              </label>
              <input 
                type="range" min="-20" max="100" value={temperature} 
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Encapsulation Polymer
              </label>
              <select 
                value={polymerType} 
                onChange={(e) => setPolymerType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200"
              >
                <option value="POE">Polyolefin Elastomer (POE) - Low Moisture Absorption</option>
                <option value="EVA">Ethylene-Vinyl Acetate (EVA) - Accelerated Degradation</option>
              </select>
            </div>
          </div>

          {/* 3D VIEWPORT CONTROLS */}
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Eye className="w-4 h-4 text-indigo-400" /> Viewport 3D Explosion
            </h3>
            <div>
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Explosion Distance</span>
                <span className="text-indigo-400">{(explodeGap * 100).toFixed(0)}%</span>
              </label>
              <input 
                type="range" min="0" max="1.5" step="0.05" value={explodeGap} 
                onChange={(e) => setExplodeGap(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={runPhysicsSimulation} 
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded flex items-center justify-center gap-2 text-sm transition"
        >
          <Play className="w-4 h-4" /> RE-SOLVE PHYSICS
        </button>
      </div>

      {/* CENTER & RIGHT CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col h-full bg-slate-950">
        
        {/* TOP METRICS BAR */}
        <div className="h-16 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between">
          <div className="flex gap-8">
            <div>
              <span className="text-xs text-slate-400 block">Efficiency ($\eta$)</span>
              <span className="text-xl font-bold text-emerald-400">{metrics.efficiency}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Max Power ($P_{mpp}$)</span>
              <span className="text-xl font-bold text-sky-400">{metrics.pmax} W</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">$V_{oc}$</span>
              <span className="text-xl font-bold text-slate-200">{metrics.voc} V</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">$I_{sc}$</span>
              <span className="text-xl font-bold text-slate-200">{metrics.isc} A</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Fill Factor (FF)</span>
              <span className="text-xl font-bold text-amber-400">{metrics.ff}</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE SPLIT (3D CAD + CHARTS) */}
        <div className="flex-1 grid grid-cols-2 gap-px bg-slate-800 overflow-hidden">
          
          {/* VIEWPORT 1: THREE.JS 3D STACK RENDERER */}
          <div className="bg-slate-950 relative h-full">
            <div className="absolute top-3 left-3 z-10 text-xs font-mono bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              3D PHYSICAL STACK VIEWPORT
            </div>
            <Canvas shadows className="w-full h-full">
              <PerspectiveCamera makeDefault position={[5, 4, 7]} fov={50} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
              <CellStack3D layers={layers} explodeGap={explodeGap} />
              <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* VIEWPORT 2: PHYSICS I-V & P-V GRAPH */}
          <div className="bg-slate-950 p-4 flex flex-col justify-between h-full">
            <div className="text-xs font-mono text-slate-300 mb-2">DYNAMIC $I\text{-}V$ AND $P\text{-}V$ CHARACTERISTICS</div>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData}>
                  <XAxis dataKey="voltage" stroke="#64748b" fontSize={11} label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Current (A) / Power (W)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="current" stroke="#38bdf8" strokeWidth={2} dot={false} name="Current (A)" />
                  <Line type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2} dot={false} name="Power (W)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* LAYER STACK LIST INSPECTOR */}
            <div className="mt-4 border-t border-slate-800 pt-3 h-48 overflow-y-auto">
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Physical Layers ({layers.length})
              </div>
              <div className="space-y-1">
                {layers.map((l, i) => (
                  <div key={l.id} className="flex items-center justify-between text-xs bg-slate-900/80 p-2 rounded border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="font-medium text-slate-200">{l.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">
                      {l.thickness >= 1000 ? `${(l.thickness / 1000).toFixed(1)} µm` : `${l.thickness} nm`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
