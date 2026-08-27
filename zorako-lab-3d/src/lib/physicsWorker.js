/**
 * ZORAKO LAB: Multithreaded Multi-Physics Engine (Web Worker)
 * Solves Partial Differential Equations (PDEs) off the main UI thread.
 */

// Physical Constants
const BOLTZMANN_K = 1.380649e-23;
const FARADAY_CONST = 96485.3321;
const GAS_CONST = 8.314462;

// Real-Time Material Node Mesh State
let nodeGrid = null;
let gridResolution = 0;

self.onmessage = function (e) {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT_GRID':
      initializeNodeGrid(payload.resolution, payload.initialTempK);
      break;

    case 'SIMULATION_STEP':
      runPhysicsTick(payload.deltaTime, payload.appliedCurrentAmps, payload.ambientTempK);
      break;
  }
};

/**
 * Discretizes 3D spatial geometry into an FEA computational node grid
 */
function initializeNodeGrid(res, initialTempK) {
  gridResolution = res;
  const totalNodes = res * res * res;
  
  nodeGrid = {
    temperature: new Float32Array(totalNodes).fill(initialTempK),
    stressMPa: new Float32Array(totalNodes).fill(0.0),
    phaseState: new Uint8Array(totalNodes).fill(0), // 0: Solid, 1: Liquid/Melt, 2: Outgassed
  };

  self.postMessage({ type: 'GRID_READY', totalNodes });
}

/**
 * High-Frequency Multi-Physics Time Stepping Loop
 * Solves 3D Heat Equation: dT/dt = alpha * Laplacian(T) + HeatGeneration
 */
function runPhysicsTick(dt, currentAmps, ambientK) {
  if (!nodeGrid) return;

  const temp = nodeGrid.temperature;
  const res = gridResolution;
  const alpha = 0.0001; // Thermal diffusivity coefficient

  // Finite Difference 3D Laplacian Solver
  for (let x = 1; x < res - 1; x++) {
    for (let y = 1; y < res - 1; y++) {
      for (let z = 1; z < res - 1; z++) {
        const idx = x + y * res + z * res * res;

        // Neighbor node sampling for Laplacian spatial derivative
        const laplacian =
          temp[(x + 1) + y * res + z * res * res] +
          temp[(x - 1) + y * res + z * res * res] +
          temp[x + (y + 1) * res + z * res * res] +
          temp[x + (y - 1) * res + z * res * res] +
          temp[x + y * res + (z + 1) * res * res] +
          temp[x + y * res + (z - 1) * res * res] -
          6 * temp[idx];

        // Joule Heating ($P = I^2 R$)
        const internalResistance = 0.015;
        const jouleSource = (Math.pow(currentAmps, 2) * internalResistance) / temp.length;

        // PDE Time Integration
        temp[idx] += (alpha * laplacian + jouleSource) * dt;

        // Phase Transition Detection (> 450K / 176.8C -> Structural Melting)
        if (temp[idx] > 450.0) {
          nodeGrid.phaseState[idx] = 1;
        }
      }
    }
  }

  // Calculate Peak & Average Metrics
  let maxTemp = 0;
  for (let i = 0; i < temp.length; i++) {
    if (temp[i] > maxTemp) maxTemp = temp[i];
  }

  // Stream raw computed arrays back to main thread/GPU
  self.postMessage({
    type: 'TICK_COMPLETE',
    payload: {
      maxTemperatureK: maxTemp,
      temperatureArray: nodeGrid.temperature.buffer,
      phaseArray: nodeGrid.phaseState.buffer,
    },
  }, [nodeGrid.temperature.buffer, nodeGrid.phaseState.buffer]);

  // Re-allocate array buffers after transfer
  nodeGrid.temperature = new Float32Array(nodeGrid.temperature.length);
  nodeGrid.phaseState = new Uint8Array(nodeGrid.phaseState.length);
}
