'use client';
import React, { useState } from 'react';

export default function ZorakoStudio() {
  const [temp, setTemp] = useState(35);
  const [load, setLoad] = useState(5.5);
  const [topology, setTopology] = useState('GAN_MICROINVERTER');
  const [chemistry, setChemistry] = useState('SODIUM_ION');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/zorako/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operating_temp_c: parseFloat(temp),
          load_power_kw: parseFloat(load),
          inverter_topology: topology,
          battery_chemistry: chemistry
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#090A0F', color: '#F3F4F6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px' }}>
      {/* Studio Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.5px', margin: 0 }}>ZORAKO INDUSTRIAL STUDIO</h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0 0' }}>Multi-Physics Hardware Engine v4.0</p>
        </div>
        <button onClick={runSimulation} style={{ backgroundColor: '#3B82F6', border: 'none', color: '#FFF', padding: '10px 20px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
          {loading ? 'Solving PDEs...' : 'Execute Multi-Physics Solve'}
        </button>
      </header>

      {/* Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Floating Parameter Inspector */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6B7280', margin: '0 0 16px 0' }}>Parametric Inputs</h2>

          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px' }}>Operating Temperature ({temp}°C)</label>
          <input type="range" min="0" max="85" value={temp} onChange={(e) => setTemp(e.target.value)} style={{ width: '100%', marginBottom: '16px' }} />

          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px' }}>System Load ({load} kW)</label>
          <input type="range" min="0.5" max="20" step="0.5" value={load} onChange={(e) => setLoad(e.target.value)} style={{ width: '100%', marginBottom: '16px' }} />

          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px' }}>Inverter Semiconductor</label>
          <select value={topology} onChange={(e) => setTopology(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #374151', color: '#FFF', borderRadius: '6px', marginBottom: '16px' }}>
            <option value="GAN_MICROINVERTER">GaN Microinverter (Gallium Nitride)</option>
            <option value="SIC_STRING_INVERTER">SiC String Inverter (Silicon Carbide)</option>
            <option value="IGBT_CENTRAL">IGBT Central Inverter</option>
          </select>

          <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px' }}>Battery Storage Chemistry</label>
          <select value={chemistry} onChange={(e) => setChemistry(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #374151', color: '#FFF', borderRadius: '6px' }}>
            <option value="SODIUM_ION">Sodium-Ion (Na-Ion)</option>
            <option value="SOLID_STATE">Solid-State Lithium</option>
            <option value="LIFEPO4">Lithium Iron Phosphate (LiFePO4)</option>
          </select>
        </div>

        {/* Viewport & Telemetry Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#030712', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563' }}>
            <span>[ WebGL Viewport Active — Vertex Shader Buffer Ready ]</span>
          </div>

          {/* Real-time Telemetry Display */}
          {results && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Solar PCE</span>
                <p style={{ fontSize: '20px', fontWeight: '600', margin: '4px 0 0 0', color: '#10B981' }}>
                  {results.system_telemetry?.solar_tmm?.power_conversion_efficiency_pce_pct}%
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Inverter Heat Dissipation</span>
                <p style={{ fontSize: '20px', fontWeight: '600', margin: '4px 0 0 0', color: '#F59E0B' }}>
                  {results.system_telemetry?.hardware_topology?.inverter?.heat_loss_watts} W
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Battery SOH</span>
                <p style={{ fontSize: '20px', fontWeight: '600', margin: '4px 0 0 0', color: '#60A5FA' }}>
                  {results.system_telemetry?.hardware_topology?.battery?.state_of_health_pct}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
