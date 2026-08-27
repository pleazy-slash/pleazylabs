'use client';

import { useState } from 'react';

export default function PythonTerminal({ onExecuteScript }) {
  const [code, setCode] = useState(`# Python 3 Automation Script
# Procedural Gear Generation & Parameter Override

import zorako_cad as cad

# Create Spur Gear Array
gear = cad.create_gear(
    teeth=24,
    module=1.5,
    pressure_angle=20.0,
    material="Hardened_Steel"
)

# Apply Physical Overrides
gear.set_torque(120) # Nm
gear.set_rpm(1500)
print("Gear matrix generated successfully.")
`);
  const [logs, setLogs] = useState(['[System] Python 3.11 Kernel Initialized.', '[Ready] Awaiting script execution...']);

  const handleRun = () => {
    setLogs((prev) => [...prev, `>>> Executing script...`, `[Success] Parametric mesh updated.`]);
    if (onExecuteScript) onExecuteScript(code);
  };

  return (
    <div className="absolute top-4 right-4 w-96 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-mono text-xs z-30">
      <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
        <span className="text-cyan-400 font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Python 3 CAD Automation Engine
        </span>
        <button 
          onClick={handleRun}
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1 rounded transition-colors text-[10px]"
        >
          RUN SCRIPT
        </button>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-44 bg-slate-950 text-slate-200 p-3 outline-none resize-none font-mono text-[11px] leading-relaxed border-b border-slate-800"
        spellCheck="false"
      />

      <div className="p-2 bg-slate-900/50 max-h-24 overflow-y-auto text-[10px] space-y-1">
        {logs.map((log, index) => (
          <div key={index} className={log.startsWith('[Success]') ? 'text-emerald-400' : 'text-slate-400'}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
