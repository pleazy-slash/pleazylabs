'use client';

import { useState } from 'react';

export default function EnvironmentControlPanel() {
  const [pressureAtm, setPressureAtm] = useState(1.0);
  const [ambientTempC, setAmbientTempC] = useState(25);
  const [humidity, setHumidity] = useState(50);

  return (
    <div className="absolute top-4 left-4 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl text-slate-100 font-sans shadow-2xl z-10">
      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
        Atmospheric & Ambient Controls
      </h3>

      {/* Atmospheric Pressure */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-300">Atmospheric Pressure</span>
          <span className="font-mono text-cyan-300">{pressureAtm.toFixed(2)} atm</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.05"
          value={pressureAtm}
          onChange={(e) => setPressureAtm(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Ambient Temperature */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-300">Ambient Temperature</span>
          <span className="font-mono text-cyan-300">{ambientTempC}°C</span>
        </div>
        <input
          type="range"
          min="-40"
          max="85"
          step="1"
          value={ambientTempC}
          onChange={(e) => setAmbientTempC(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Relative Humidity */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-300">Relative Humidity</span>
          <span className="font-mono text-cyan-300">{humidity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={humidity}
          onChange={(e) => setHumidity(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
}
