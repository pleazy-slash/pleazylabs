'use client';

import { useLabStore } from '@/lib/store';

export default function MaterialEditorPanel() {
  const materialState = useLabStore((state) => state.materialState);
  const batterySpecs = useLabStore((state) => state.batterySpecs);
  const updateMaterial = useLabStore((state) => state.updateMaterial);
  const updateBatteryParams = useLabStore((state) => state.updateBatteryParams);

  return (
    <div className="absolute top-4 left-4 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl text-slate-100 font-sans shadow-2xl z-10 text-xs">
      <h2 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">
        3D Material & Physics Inspector
      </h2>

      {/* Surface Material Controls */}
      <div className="space-y-3 mb-4">
        <span className="font-semibold text-slate-300">Surface Properties</span>
        <div>
          <label className="flex justify-between mb-1">
            <span>Roughness</span>
            <span>{materialState.roughness}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={materialState.roughness}
            onChange={(e) => updateMaterial({ roughness: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>

        <div>
          <label className="flex justify-between mb-1">
            <span>Metalness</span>
            <span>{materialState.metalness}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={materialState.metalness}
            onChange={(e) => updateMaterial({ metalness: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="flex justify-between items-center pt-1">
          <span>Surface Color</span>
          <input
            type="color"
            value={materialState.color}
            onChange={(e) => updateMaterial({ color: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
          />
        </div>
      </div>

      {/* Physical Dynamic Controls */}
      <div className="border-t border-slate-700 pt-3 space-y-3">
        <span className="font-semibold text-slate-300">Cell Physical State</span>
        <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1 font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Voltage:</span>
            <span className="text-emerald-400">{batterySpecs.currentVoltage} V</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Temp:</span>
            <span className={batterySpecs.temperatureC > 50 ? "text-red-400 font-bold" : "text-amber-400"}>
              {batterySpecs.temperatureC.toFixed(1)} °C
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>SOC:</span>
            <span className="text-cyan-400">{batterySpecs.stateOfCharge.toFixed(1)}%</span>
          </div>
        </div>

        <button
          onClick={() => updateBatteryParams({ isDischarging: !batterySpecs.isDischarging })}
          className={`w-full py-2 font-bold rounded transition ${
            batterySpecs.isDischarging
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          {batterySpecs.isDischarging ? 'Stop Discharge Test' : 'Start Discharge Test'}
        </button>
      </div>
    </div>
  );
}
