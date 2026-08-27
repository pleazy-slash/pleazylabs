import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR rendering issues with WebGL canvas
const PhotorealisticViewport = dynamic(() => import('../components/PhotorealisticViewport'), { ssr: false });

export default function StudioPage() {
  const [material, setMaterial] = useState('silicon');
  const [logs, setLogs] = useState(null);

  const testMerge = async (matA, matB) => {
    try {
      const res = await fetch('http://localhost:3006/api/zorako/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MERGE_ELEMENTS', elementA: matA, elementB: matB })
      });
      const data = await res.json();
      setLogs(data.result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#050508', color: '#e2e8f0', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '1px' }}>
        ZORAKO LAB 3D — PHOTOREALISTIC CAD STUDIO
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* 3D Viewport Panel */}
        <div style={{ background: '#0f0f15', padding: '20px', borderRadius: '16px', border: '1px solid #1e1e2d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>RENDER ENGINE: ACES FILMIC PBR WEBGL</span>
            <div>
              <button onClick={() => setMaterial('silicon')} style={btnStyle(material === 'silicon')}>Silicon Layer</button>
              <button onClick={() => setMaterial('glass')} style={btnStyle(material === 'glass')}>Anti-Reflective Glass</button>
              <button onClick={() => setMaterial('copper')} style={btnStyle(material === 'copper')}>Copper Busbar</button>
              <button onClick={() => setMaterial('gold')} style={btnStyle(material === 'gold')}>Gold Contacts</button>
            </div>
          </div>

          <PhotorealisticViewport materialType={material} />
        </div>

        {/* Physics & Material Controls */}
        <div style={{ background: '#0f0f15', padding: '20px', borderRadius: '16px', border: '1px solid #1e1e2d' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#38bdf8' }}>Material Simulation Controls</h3>
          
          <button onClick={() => testMerge('Li', 'H2O')} style={{ ...actionBtnStyle, background: '#ef4444' }}>
            Test Lithium + Water Hazard
          </button>
          
          <button onClick={() => testMerge('Si', 'Cu')} style={{ ...actionBtnStyle, background: '#3b82f6', marginTop: '10px' }}>
            Test Silicon + Copper Junction
          </button>

          {logs && (
            <div style={{ marginTop: '20px', background: '#050508', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
              <h4 style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>PHYSICS RESPONSE TELEMETRY</h4>
              <pre style={{ fontSize: '11px', color: '#4ade80', whitespace: 'pre-wrap' }}>
                {JSON.stringify(logs, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnStyle = (active) => ({
  background: active ? '#38bdf8' : '#1e1e2d',
  color: active ? '#000' : '#fff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  marginRight: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px'
});

const actionBtnStyle = {
  width: '100%',
  padding: '12px',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
