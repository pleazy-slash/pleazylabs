import * as THREE from 'three';
import { extend } from '@react-three/fiber';

class ThermalShaderMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTemperature: { value: 25.0 },     // Degrees Celsius
        uPressure: { value: 1.0 },        // Atmospheres
        uBaseColor: { value: new THREE.Color('#0284c7') },
        uMeltColor: { value: new THREE.Color('#ef4444') },
      },
      vertexShader: `
        uniform float uTemperature;
        uniform float uPressure;
        varying vec3 vNormal;
        varying float vTempNormalized;

        void main() {
          vNormal = normal;
          
          // Normalize temp range (25C to 200C)
          vTempNormalized = clamp((uTemperature - 25.0) / 175.0, 0.0, 1.0);
          
          // Structural expansion & swelling math
          float swellFactor = (uPressure - 1.0) * 0.05 + (vTempNormalized * 0.08);
          
          // Gravity-based melting displacement at high temp (>150C)
          vec3 displacedPosition = position + (normal * swellFactor);
          if (uTemperature > 150.0) {
            float meltAmount = (uTemperature - 150.0) / 50.0;
            displacedPosition.y -= meltAmount * 0.15 * (1.0 - position.y);
          }

          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uMeltColor;
        varying vec3 vNormal;
        varying float vTempNormalized;

        void main() {
          // Dynamic lighting
          vec3 lightDir = normalize(vec3(5.0, 10.0, 7.0));
          float diff = max(dot(vNormal, lightDir), 0.2);

          // Color transition based on thermal energy
          vec3 finalColor = mix(uBaseColor, uMeltColor, vTempNormalized) * diff;

          // Thermal emissive core glow at dangerous temperatures (>80C)
          if (vTempNormalized > 0.3) {
            float glow = (vTempNormalized - 0.3) * 1.5;
            finalColor += vec3(1.0, 0.3, 0.0) * glow;
          }

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }
}

extend({ ThermalShaderMaterial });
export { ThermalShaderMaterial };
