import React, { useState } from 'react';

export default function StudioCanvas() {
  const [selectedElement, setSelectedElement] = useState('Si');
  const [targetElement, setTargetElement] = useState('Cu');
  const [simulationOutput, setSimulationOutput] = useState(null);
  const [transform, setTransform] = useState({ scale: 1, rotateY: 0, posX: 0, posY: 0 });

  const runMerge = async () => {
    try {
      const res = await fetch('http://localhost:3006/api/zorako/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MERGE_ELEMENTS',
          elementA: selectedElement,
          elementB: targetElement
        })
      });
      const data = await res.json();
      setSimulationOutput(data.result);
    } catch (err) {
      console.error('Simulation Request Failed:', err);
    }
  };

  const runAging = async () => {
    try {
      const res = await fetch('http://localhost:3006/api/zorako/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RUN_AGING_TEST',
          durationYears: 4,
          ambientTempC: 40,
          annualRainfallMm: 1600,
          sunlightIrradianceKw: 1.2
        })
      });
      const data = await res.json();
      setSimulationOutput(data.report);
    } catch (err) {
      console.error('Aging Test Request Failed:', err);
    }
  };

  return (
    <div style={{ background: '#0a0a0c', color: '#fff', padding: '20px', borderRadius: '8px', fontFamily: 'monospace' }}>
      <h2>Zorako 3D CAD & Simulation Studio</h2>
      
      {/* Visual Transform Control Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', background: '#16161a', padding: '10px' }}>
        <label>Scale: 
          <input type="range" min="0.5" max="3" step="0.1" value={transform.scale} 
            onChange={(e) => setTransform({ ...transform, scale: parseFloat(e.target.value) })} />
        </label>
        <label>Rotation: 
          <input type="range" min="0" max="360" value={transform.rotateY} 
            onChange={(e) => setTransform({ ...transform, rotateY: parseInt(e.target.value) })} />
        </label>
      </div>

      {/* Material Merger Panel */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={selectedElement} onChange={(e) => setSelectedElement(e.target.value)}>
          <option value="Si">Silicon (Si)</option>
          <option value="Cu">Copper (Cu)</option>
          <option value="Li">Lithium (Li)</option>
          <option value="Al">Aluminum (Al)</option>
        </select>

        <span>+</span>

        <select value={targetElement} onChange={(e) => setTargetElement(e.target.value)}>
          <option value="H2O">Water (H2O)</option>
          <option value="Cu">Copper (Cu)</option>
          <option value="O2">Oxygen (O2)</option>
        </select>

        <button onClick={runMerge} style={{ background: '#0066ff', color: '#fff', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>
          Test Material Merge
        </button>

        <button onClick={runAging} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>
          Simulate 4-Year Aging
        </button>
      </div>

      {/* Reaction & Telemetry Console Output */}
      {simulationOutput && (
        <pre style={{ background: '#111', padding: '15px', borderRadius: '5px', overflowX: 'auto', border: '1px solid #333' }}>
          {JSON.stringify(simulationOutput, null, 2)}
        </pre>
      )}
    </div>
  );
}
