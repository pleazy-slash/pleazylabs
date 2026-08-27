import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function PhotorealisticViewport({ materialType = 'silicon' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    const width = currentMount.clientWidth || 800;
    const height = 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2, 4);

    // 2. High-Precision Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    currentMount.appendChild(renderer.domElement);

    // 3. Cinematic Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 1.2); // Cool blue accent fill
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.8); // Warm gold rim reflection
    rimLight.position.set(0, -5, -4);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // 4. Photorealistic Material Definitions (PBR Workflows)
    const materials = {
      silicon: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 2.0
      }),
      copper: new THREE.MeshStandardMaterial({
        color: 0xb87333,
        metalness: 0.95,
        roughness: 0.2
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.95,
        ior: 1.5,
        thickness: 0.5,
        transparent: true,
        opacity: 0.9
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.15
      })
    };

    // 5. 3D Model Mesh Assembly
    const geometry = new THREE.BoxGeometry(1.6, 0.1, 1.6);
    const selectedMat = materials[materialType] || materials.silicon;
    const mesh = new THREE.Mesh(geometry, selectedMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = 0.5;
    scene.add(mesh);

    // Reflective Metallic Grid Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.4, metalness: 0.5 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    camera.lookAt(mesh.position);

    // 6. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.008; // Smooth 360 preview rotation
      renderer.render(scene, camera);
    };
    animate();

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [materialType]);

  return <div ref={mountRef} style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden' }} />;
}
