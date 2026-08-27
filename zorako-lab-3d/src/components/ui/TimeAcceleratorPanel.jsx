'use client';

import { useState } from 'react';

export default function TimeAcceleratorPanel() {
  const [years, setYears] = useState(0);

  return (
    <div className="absolute bottom-6 left-6 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl text-slate-100 font-sans shadow-2xl z-10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
          Temporal Aging Engine
        </h3>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          {years === 0 ? 'Day 0 (Fresh)' : `${years.toFixed(1)} Years Accelerated`}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="10"
        step="0.1"
        value={years}
        onChange={(e) => setYears(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 my-2"
      />

      <div className="text-[11px] text-slate-400 space-y-1 mt-2 border-t border-slate-800 pt-2">
        <p>• <strong className="text-slate-200">0–2 Yrs:</strong> SEI Passivation layer growth</p>
        <p>• <strong className="text-slate-200">3–5 Yrs:</strong> Micro-lithium dendrite nucleation</p>
        <p>• <strong className="text-slate-200">6–10 Yrs:</strong> Foil delamination & casing oxidation</p>
      </div>
    </div>
  );
}
