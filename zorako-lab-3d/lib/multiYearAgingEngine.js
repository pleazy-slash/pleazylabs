export function simulateMultiYearAging({
  durationYears = 5,
  ambientTempC = 38,
  annualRainfallMm = 1500,
  sunlightIrradianceKw = 1.1,
  pressureBar = 1.05,
  encapsulationQuality = 0.85
}) {
  const timeline = [];
  let currentEfficiency = 22.5; // Base 22.5% solar cell efficiency
  let structuralIntegrity = 100.0;
  let cumulativeMoistureIngress = 0.0;

  // Activation Energy for EVA Polymer Degradation (eV)
  const Ea_uv = 0.35;
  const R_ev = 8.617e-5; // eV/K
  const tempK = ambientTempC + 273.15;

  // Temperature Acceleration Factor (Arrhenius Degradation Scaling)
  const tempFactor = Math.exp(-Ea_uv / (R_ev * tempK)) * 1e4;

  for (let year = 1; year <= durationYears; year++) {
    // 1. Moisture Ingress Rate (Fick's 2nd Law of Diffusion approximation)
    const annualMoisture = (annualRainfallMm / 1000) * (1.0 - encapsulationQuality) * 2.8;
    cumulativeMoistureIngress += annualMoisture;

    // 2. Photothermal UV Degradation Rate
    const uvYellowing = (sunlightIrradianceKw * 0.82) * tempFactor * year;

    // 3. Thermomechanical Micro-cracking from Cyclic Expansion
    const microCrackGrowth = (ambientTempC / 25) * 0.45 * Math.pow(year, 1.2);

    // 4. Efficiency Loss Calculations
    const resistanceLoss = (cumulativeMoistureIngress * 0.85); // Corrosion of busbars
    const opticalLoss = (uvYellowing * 0.35); // Encapsulation yellowing
    
    currentEfficiency -= (opticalLoss + resistanceLoss + (microCrackGrowth * 0.2));
    structuralIntegrity -= (microCrackGrowth + (annualMoisture * 1.2));

    timeline.push({
      year,
      efficiencyPct: Math.max(0, currentEfficiency).toFixed(2),
      structuralIntegrityPct: Math.max(0, structuralIntegrity).toFixed(2),
      moistureIngressPct: cumulativeMoistureIngress.toFixed(2),
      degradationFactors: {
        uvYellowing: `${uvYellowing.toFixed(2)}%`,
        cellMicrocracks: `${microCrackGrowth.toFixed(2)}%`,
        busbarCorrosion: cumulativeMoistureIngress > 3.0 ? "ACTIVE CORROSION" : "NOMINAL"
      }
    });
  }

  return {
    simulationPeriodYears: durationYears,
    testParameters: { ambientTempC, annualRainfallMm, sunlightIrradianceKw, pressureBar, encapsulationQuality },
    finalState: timeline[timeline.length - 1],
    yearlyTimeline: timeline
  };
}
