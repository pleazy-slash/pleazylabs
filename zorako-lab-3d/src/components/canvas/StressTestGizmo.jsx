'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader to visualize physical stress propagation
const stressMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uForcePosition: { value: new THREE.Vector3(1, 1, 0) },
    uForceMagnitude: { value: 0.0 }, // 0 to 1.0 (Yield limit)
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uForcePosition;
    uniform float uForceMagnitude;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      // Calculate distance from the point of applied force
      float dist = distance(vWorldPosition, uForcePosition);
      
      // Stress attenuates linearly over distance from the impact point
      float stress = clamp((1.0 - dist * 0.5) * uForceMagnitude, 0.0, 1.0);

      // Color Gradient: Safe (Blue) -> Warning (Yellow) -> Yield/Break (Red)
      vec3 safeColor = vec3(0.1, 0.5, 0.8);
      vec3 yieldColor = vec3(1.0, 0.1, 0.1);
      vec3 midColor = vec3(1.0, 0.8, 0.1);

      vec3 finalColor;
      if (stress < 0.5) {
        finalColor = mix(safeColor, midColor, stress * 2.0);
      } else {
        finalColor = mix(midColor, yieldColor, (stress - 0.5) * 2.0);
      }

      // Add basic lighting
      float lighting = max(dot(normalize(vNormal), vec3(0.5, 1.0, 0.5)), 0.2);
      
      gl_FragColor = vec4(finalColor * lighting, 1.0);
    }
  `
});

export default function StressTestGizmo() {
  const [force, setForce] = useState(0);

  return (
    <group position={[0, -1, 0]}>
      {/* 3D Beam under test */}
      <mesh material={stressMaterial} receiveShadow castShadow>
        <boxGeometry args={[4, 0.5, 1]} />
      </mesh>

      {/* Force Applicator UI Overlay */}
      <Html position={[0, 1, 0]} center>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 text-slate-200 text-xs shadow-xl w-48">
          <div className="font-bold text-cyan-400 mb-2 border-b border-slate-700 pb-1">
            Apply Mechanical Force
          </div>
          <label className="block mb-1 text-[10px] text-slate-400">Downward Load (kN)</label>
          <input 
            type="range" 
            min="0" max="1" step="0.05" 
            value={force} 
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setForce(val);
              stressMaterial.uniforms.uForceMagnitude.value = val;
            }}
            className="w-full accent-rose-500"
          />
          <div className="mt-2 text-[10px] text-right text-rose-400 font-mono">
            Max Stress: {(force * 450).toFixed(0)} MPa
          </div>
        </div>
      </Html>
    </group>
  );
}
