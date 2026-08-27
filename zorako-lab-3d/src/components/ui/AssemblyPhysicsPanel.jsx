'use client';

import { useState } from 'react';
import { ENVIRONMENTAL_MEDIA, calculateSolutionConductivity, solveFluidBehaviorInMedium } from '@/lib/reactionEngine';
import { validateEnclosureFit, ASSEMBLY_OPERATIONS } from '@/lib/cadAssemblyEngine';

export default function AssemblyPhysicsPanel() {
  const [medium, setMedium] = useState('AIR');
  const [temperatureK, setTemperatureK] = useState(298.15);
  const [selectedOp, setSelectedOp] = useState('LASER_WELD');

  // Sample Sub-component fit check
  const innerJellyRoll = { outerRadiusMm: 8.9, heightMm: 64.5 };
  const outerCan = { innerRadiusMm: 9.0, innerHeightMm: 65.0 };
  const clearanceResult = validateEnclosureFit(innerJellyRoll, outerCan);

  // Sample Chemical Fluid calculation
  const fluidSpec = { vaporPressurePa: 3200, volumeM3: 0.000005, molarMassKgMol: 0.088 };
  const fluidBehavior = solveFluidBehaviorInMedium(fluidSpec, ENVIRONMENTAL_MEDIA[medium], temperatureK);
  const chemistry = calculateSolutionConductivity(1.0, temperatureK, 1);

  return (
    <div className="absolute top-4 right-4 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl text-slate-100 font-sans shadow-2xl z-20 max-h-[90vh] overflow-y-auto">
      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
        Multi-Physics & Cad Inspection
      </h3>

      {/* Container Clearance Check */}
      <div className="mb-4 bg-slate-950 p-2.5 rounded border border-slate-800">
        <span className="text-[11px] text-slate-400 font-bold block mb-1">CAD Clearance Check</span>
        <div className={`text-xs font-mono font-bold ${clearanceResult.passesFit ? 'text-emerald-400' : 'text-rose-400'}`}>
          {clearanceResult.status}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Radial: {clearanceResult.radialClearanceMm.toFixed(2)}mm | Height: {clearanceResult.heightClearanceMm.toFixed(2)}mm
        </div>
      </div>

      {/* Assembly Operations (Welding / Fastening) */}
      <div className="mb-4">
        <span className="text-[11px] text-slate-400 font-bold block mb-1">Rapid Assembly Action</span>
        <select
          value={selectedOp}
          onChange={(e) => setSelectedOp(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-xs rounded p-1.5 text-cyan-300 font-mono mb-2"
        >
          {Object.keys(ASSEMBLY_OPERATIONS).map((opKey) => (
            <option key={opKey} value={opKey}>
              {ASSEMBLY_OPERATIONS[opKey].name}
            </option>
          ))}
        </select>
        <div className="text-[10px] text-slate-400">
          Joint Yield Strength: <span className="text-cyan-400">{ASSEMBLY_OPERATIONS[selectedOp].jointStrengthMPa} MPa</span>
        </div>
      </div>

      {/* Fluid & Environment Dynamics */}
      <div className="mb-2 bg-slate-950 p-2.5 rounded border border-slate-800 space-y-2">
        <span className="text-[11px] text-slate-400 font-bold block border-b border-slate-800 pb-1">
          Medium & Reaction Dynamics
        </span>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300">Environment Medium:</span>
          <select
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            className="bg-slate-800 text-cyan-300 text-xs px-2 py-0.5 rounded border border-slate-700"
          >
            <option value="AIR">Air (1 atm)</option>
            <option value="WATER">Water Submerged</option>
            <option value="VACUUM">Vacuum Chamber</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-300 space-y-1 font-mono pt-1">
          <div>• Phase State: <span className="text-cyan-300">{fluidBehavior.phaseState}</span></div>
          <div>• Evaporation Rate: <span className="text-cyan-300">{fluidBehavior.evapRateKgM2s.toExponential(2)} kg/m²s</span></div>
          <div>• Ionic Conductivity: <span className="text-cyan-300">{chemistry.conductivitySperM.toFixed(3)} S/m</span></div>
        </div>
      </div>
    </div>
  );
}
