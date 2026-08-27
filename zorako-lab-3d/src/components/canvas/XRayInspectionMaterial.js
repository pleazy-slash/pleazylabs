import * as THREE from 'three';
import { extend } from '@react-three/fiber';

class XRayInspectionMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      side: THREE.DoubleSide,
      transparent: true,
      clipping: true, // Enables native WebGL CAD cross-section slicing
      uniforms: {
        uOpacity: { value: 0.35 },           // Base transparency slider
        uXRayIntensity: { value: 0.8 },      // Edge-fresnel glow intensity
        uBaseColor: { value: new THREE.Color('#0284c7') },
        uXRayColor: { value: new THREE.Color('#38bdf8') },
        uIsIsolated: { value: 0.0 },          // Highlighting active component focus
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform float uXRayIntensity;
        uniform vec3 uBaseColor;
        uniform vec3 uXRayColor;
        uniform float uIsIsolated;

        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          // Fresnel effect calculation for clear edge highlighting in X-Ray mode
          float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.0);

          vec3 finalColor = mix(uBaseColor, uXRayColor, fresnel * uXRayIntensity);

          // Active Component Focus Highlight
          if (uIsIsolated > 0.5) {
            finalColor += vec3(0.2, 0.8, 0.2); // Green highlight glow
          }

          float finalAlpha = clamp(uOpacity + (fresnel * uXRayIntensity), 0.1, 1.0);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
    });
  }
}

extend({ XRayInspectionMaterial });
export { XRayInspectionMaterial };
