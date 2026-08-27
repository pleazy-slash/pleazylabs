import * as THREE from 'three';
import { extend } from '@react-three/fiber';

class AgingDegradationShader extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uYears: { value: 0.0 },              // 0 to 10 years acceleration slider
        uSeiThickness: { value: 0.0 },       // SEI layer growth
        uBaseColor: { value: new THREE.Color('#0284c7') },
        uSeiColor: { value: new THREE.Color('#e2e8f0') },
        uCorrosionColor: { value: new THREE.Color('#b45309') },
      },
      vertexShader: `
        uniform float uYears;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vNormal = normal;
          vUv = uv;
          vPosition = position;

          // Surface roughening & micro-swelling over years
          float ageDisplacement = sin(position.y * 20.0 + position.x * 20.0) * (uYears * 0.005);
          vec3 displacedPos = position + (normal * ageDisplacement);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uYears;
        uniform vec3 uBaseColor;
        uniform vec3 uSeiColor;
        uniform vec3 uCorrosionColor;

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vPosition;

        // Simple procedural noise helper for corrosion maps
        float pseudoNoise(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
          float diff = max(dot(normal, lightDir), 0.3);

          // 1. Base material color
          vec3 color = uBaseColor;

          // 2. Year 0-3: SEI Passivation layer growth (fade to dull film)
          float seiFactor = clamp(uYears / 3.0, 0.0, 1.0);
          color = mix(color, uSeiColor, seiFactor * 0.4);

          // 3. Year 4-10: Surface Corrosion & Oxidation patches
          float rustNoise = pseudoNoise(vUv * 15.0);
          if (uYears > 3.0 && rustNoise > 0.6) {
            float rustFactor = clamp((uYears - 3.0) / 7.0, 0.0, 1.0);
            color = mix(color, uCorrosionColor, rustFactor);
          }

          gl_FragColor = vec4(color * diff, 1.0);
        }
      `,
    });
  }
}

extend({ AgingDegradationShader });
export { AgingDegradationShader };
