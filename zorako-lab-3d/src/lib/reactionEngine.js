/**
 * ZORAKO LAB: Dynamic First-Principles Chemistry & Environmental Engine
 * Solves oxidation states, solution conductivity, and phase dynamics across media.
 */

// Fundamental Constants
const FARADAY = 96485.3321; // C/mol
const R_GAS = 8.314462;     // J/(mol·K)

export const ENVIRONMENTAL_MEDIA = {
  AIR: { id: 'AIR', density: 1.225, dielectricConst: 1.0005, ambientPressurePa: 101325 },
  WATER: { id: 'WATER', density: 997.0, dielectricConst: 80.1, ambientPressurePa: 101325 },
  VACUUM: { id: 'VACUUM', density: 0.0, dielectricConst: 1.0, ambientPressurePa: 0.0 },
};

/**
 * Calculates dynamic ion mobility and electrical conductivity in solution
 */
export function calculateSolutionConductivity(soluteConcentrationMolar, temperatureK, ionValency) {
  // Kohlrausch's Law of Independent Migration of Ions
  const molarConductivity0 = 0.014; // S·m²/mol base
  const kohlrauschCoeff = 0.003;
  
  const molarConductivity = molarConductivity0 - kohlrauschCoeff * Math.sqrt(soluteConcentrationMolar);
  const conductivitySperM = molarConductivity * soluteConcentrationMolar;
  
  // Nernst-Einstein relation for diffusion coefficient D = (u * k * T) / (q)
  const diffusionCoeff = (R_GAS * temperatureK) / (Math.pow(ionValency, 2) * FARADAY * FARADAY);

  return {
    conductivitySperM: Math.max(0, conductivitySperM),
    diffusionCoeffM2s: diffusionCoeff,
  };
}

/**
 * Determines dynamic oxidation states and redox potential via Nernst Equation
 */
export function calculateRedoxState(standardPotentialVolts, oxidizedConc, reducedConc, electronsTransferred, tempK) {
  if (reducedConc === 0) return { currentPotentialVolts: standardPotentialVolts, oxidationState: +electronsTransferred };

  // Nernst Equation: E = E0 - (RT / nF) * ln([Red] / [Ox])
  const nernstFactor = (R_GAS * tempK) / (electronsTransferred * FARADAY);
  const currentPotentialVolts = standardPotentialVolts - nernstFactor * Math.log(reducedConc / oxidizedConc);

  return {
    currentPotentialVolts,
    oxidationState: currentPotentialVolts > 0 ? `+${electronsTransferred}` : '0 (Reduced)',
    isSpontaneous: currentPotentialVolts > 0,
  };
}

/**
 * Solves fluid behavior based on medium (Air vs Submerged Water vs Vacuum)
 */
export function solveFluidBehaviorInMedium(fluid, medium, tempK) {
  const isBoiling = medium.ambientPressurePa < fluid.vaporPressurePa;
  const buoyancyForceN = medium.density * 9.81 * fluid.volumeM3;
  
  // Evaporation rate (Hertz-Knudsen relation)
  const molarMass = fluid.molarMassKgMol || 0.018; // Default water/solvent
  const evapRateKgM2s = isBoiling 
    ? 0.05 * (fluid.vaporPressurePa - medium.ambientPressurePa)
    : 0.0001 * (fluid.vaporPressurePa / (2 * Math.PI * molarMass * R_GAS * tempK));

  return {
    phaseState: isBoiling ? 'VAPOR_OUTGASSING' : 'LIQUID',
    buoyancyForceN,
    evapRateKgM2s: Math.max(0, evapRateKgM2s),
  };
}
