/**
 * Multi-Physics Environmental & Thermodynamic Solver
 * Computes convective dissipation, atmospheric pressure shifts, and hydrolysis reactions.
 */

self.onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === 'COMPUTE_ENVIRONMENTAL_STEP') {
    const result = solveEnvironmentalPhysics(payload);
    self.postMessage({ type: 'ENVIRONMENTAL_TICK', payload: result });
  }
};

function solveEnvironmentalPhysics({
  surfaceTempK,
  corePressurePa,
  ambientTempK = 298.15,      // 25°C default
  ambientPressurePa = 101325, // 1 atm default
  humidityRatio = 0.5,        // 50% RH
  surfaceAreaM2 = 0.005,
  heatTransferCoeff = 15.0,    // W/(m²·K) forced air convection
  deltaTime
}) {
  // 1. Newton's Law of Cooling (Convective Heat Dissipation)
  const qConvection = heatTransferCoeff * surfaceAreaM2 * (surfaceTempK - ambientTempK);
  
  // 2. Pressure Differential (Internal vs Atmospheric)
  const deltaPressurePa = corePressurePa - ambientPressurePa;
  const isCasingRuptured = deltaPressurePa > 1.5e6; // 1.5 MPa yield limit

  // 3. Antoine Equation for Solvent Vapor Pressure (Outgassing Kinetics)
  // log10(P) = A - (B / (T + C)) for EC/DMC Solvents
  const A = 4.2, B = 1300.0, C = -40.0;
  const vaporPressurePa = Math.pow(10, A - (B / (surfaceTempK + C))) * 100000;
  const isBoiling = vaporPressurePa > ambientPressurePa;

  // 4. Moisture Hydrolysis Reaction Rate (If Ruptured)
  let hydrolysisGasMoles = 0.0;
  if (isCasingRuptured) {
    const reactionRate = 1.2e-4 * humidityRatio;
    hydrolysisGasMoles = reactionRate * deltaTime;
  }

  return {
    qConvectionWatts: qConvection,
    deltaPressurePa,
    isCasingRuptured,
    isBoiling,
    hydrolysisGasMoles,
    vaporPressurePa
  };
}
