'use client';

import { useState } from 'react';
import { BASE_LIQUIDS, ADDITIVES, mixMaterial, testCableCurrent } from '@/lib/materialSynthesizer';

export default function MaterialSynthesizerPanel() {
  const [base, setBase] = useState('SILICONE_RESIN');
  const [additive, setAdditive] = useState('GRAPHENE_NANO');
  const [additivePercent, setAdditivePercent] = useState(10);
  const [testVoltage, setTestVoltage] = useState(12);

  const mixedProps = mixMaterial(base, additive, additivePercent);
  const electricalTest = testCableCurrent(mixedProps.conductivitySm, testVoltage, 1.0, 2.0); // 1m length, 2mm radius

  return (
    <div className="absolute bottom-4 left-4 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl text-slate-100 font-sans shadow-2xl z-20">
      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
        Material Synthesizer & Extrusion
      </h3>

      {/* Mixing Controls */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <label className="text-[10px] text-slate-400">Base Liquid</label>
          <select value={base} onChange={(e) => setBase(e.target.value)} className="w-full bg-slate-800 text-xs p-1 rounded border border-slate-700">
            {Object.keys(BASE_LIQUIDS).map(k => <option key={k} value={k}>{BASE_LIQUIDS[k].name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-slate-400">Additive</label>
          <select value={additive} onChange={(e) => setAdditive(e.target.value)} className="w-full bg-slate-800 text-xs p-1 rounded border border-slate-700">
            {Object.keys(ADDITIVES).map(k => <option key={k} value={k}>{ADDITIVES[k].name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-300">Additive Concentration</span>
          <span className="text-cyan-400 font-mono">{additivePercent}% Vol</span>
        </div>
        <input 
          type="range" min="0" max="50" step="1" 
          value={additivePercent} onChange={(e) => setAdditivePercent(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded appearance-none accent-cyan-400"
        />
      </div>

      {/* Cross Section & Properties Viewer */}
      <div className="bg-slate-950 p-2 rounded border border-slate-800 mb-3 space-y-1 font-mono text-[11px]">
        <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">Synthesized Properties</div>
        <div className="flex justify-between"><span>Density:</span> <span className="text-emerald-400">{mixedProps.density.toFixed(2)} g/cm³</span></div>
        <div className="flex justify-between"><span>Elasticity:</span> <span className="text-emerald-400">{mixedProps.elasticityMPa.toFixed(1)} MPa</span></div>
        <div className="flex justify-between"><span>Refractive Index:</span> <span className="text-emerald-400">{mixedProps.refractiveIndex.toFixed(3)}</span></div>
        <div className="flex justify-between"><span>Conductivity:</span> <span className={mixedProps.isConductive ? 'text-amber-400' : 'text-slate-500'}>{mixedProps.conductivitySm.toExponential(2)} S/m</span></div>
      </div>

      {/* Live Electrical Test */}
      <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] text-slate-300 font-bold">1m Cable Test (@ 2mm Core)</span>
          <input 
            type="number" value={testVoltage} onChange={(e) => setTestVoltage(parseFloat(e.target.value))}
            className="w-16 bg-slate-900 border border-slate-600 rounded text-xs px-1 py-0.5 text-cyan-300"
            title="Test Voltage (V)"
          />
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">Current Passed:</span>
          <span className={electricalTest.currentAmps > 0.001 ? "text-amber-400 font-bold" : "text-rose-500"}>
            {electricalTest.currentAmps < 1e-6 ? '0.000 A (Insulator)' : `${electricalTest.currentAmps.toFixed(3)} A`}
          </span>
        </div>
      </div>
    </div>
  );
}
