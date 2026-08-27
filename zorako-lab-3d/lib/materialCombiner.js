// Universal Gas Constant R = 8.314 J/(mol*K)
const R = 8.314;

// Material Database with Physical Constants
const MATERIAL_DATABASE = {
  Li: { name: "Lithium", molarMass: 6.94, density: 0.534, thermalExpansion: 46e-6, workFunction: 2.9 },
  H2O: { name: "Water", molarMass: 18.015, density: 1.0, dielectricConstant: 80.1 },
  Si: { name: "Silicon", molarMass: 28.085, density: 2.329, bandgap: 1.12, refractiveIndex: 3.44, thermalExpansion: 2.6e-6 },
  Cu: { name: "Copper", molarMass: 63.546, density: 8.96, conductivity: 5.96e7, thermalExpansion: 16.5e-6 },
  Al: { name: "Aluminum", molarMass: 26.982, density: 2.70, conductivity: 3.77e7, thermalExpansion: 23.1e-6 },
  O2: { name: "Oxygen", molarMass: 31.999, density: 0.001429 }
};

export function mergeElements(elementA, elementB, ambientTempC = 25) {
  const tempK = ambientTempC + 273.15;
  const matA = MATERIAL_DATABASE[elementA];
  const matB = MATERIAL_DATABASE[elementB];

  if (!matA || !matB) {
    return { success: false, error: "Unknown chemical species provided to solver." };
  }

  // 1. Alkali Metal + Water Hazardous Exothermic Kinetics
  if ((elementA === "Li" && elementB === "H2O") || (elementA === "H2O" && elementB === "Li")) {
    const deltaH = -222.1; // kJ/mol exothermic release
    const activationEnergy = 52.3; // kJ/mol
    
    // Arrhenius Reaction Rate Factor k = A * exp(-Ea / RT)
    const rateFactor = Math.exp((-activationEnergy * 1000) / (R * tempK));
    const heatGeneratedKJ = Math.abs(deltaH) * 1.5;
    const hydrogenGasLiters = (1.0 / matA.molarMass) * 0.5 * 22.414 * (tempK / 273.15);

    return {
      success: false,
      hazardDetected: true,
      reactionType: "Violent Alkali-Water Hydrolysis",
      kinetics: {
        arrheniusRateFactor: rateFactor.toExponential(4),
        enthalpyReleaseKJ: heatGeneratedKJ.toFixed(2),
        producedHydrogenGasLiters: hydrogenGasLiters.toFixed(3),
        peakExothermicTempC: (ambientTempC + (heatGeneratedKJ * 4.2)).toFixed(1)
      },
      structuralVerdict: "CRITICAL CRACKING & THERMAL RUNAWAY HAZARD",
      learningNote: "Direct contact between Lithium and Water generates hydrogen gas and heat. An inert solid-electrolyte interface (SEI) or encapsulation barrier is required."
    };
  }

  // 2. Semiconductor - Metal Contact Mechanics & Schottky Barrier Analysis
  if ((elementA === "Si" && elementB === "Cu") || (elementA === "Cu" && elementB === "Si")) {
    const thermalMismatch = Math.abs(matA.thermalExpansion - matB.thermalExpansion);
    const maxStressMPa = thermalMismatch * (tempK - 293.15) * 130e3; // Stress = DeltaAlpha * DeltaT * YoungsModulus
    
    return {
      success: true,
      junctionType: "Schottky Metallic Contact Interface",
      physics: {
        contactResistanceOhmCm2: 0.0042,
        schottkyBarrierHeighteV: 0.58,
        thermalMismatchCoeff: `${(thermalMismatch * 1e6).toFixed(2)} ppm/K`,
        interfacialStressMPa: maxStressMPa.toFixed(2),
        delaminationRisk: maxStressMPa > 120 ? "HIGH" : "LOW"
      },
      structuralVerdict: "Stable Contact Junction Verified"
    };
  }

  // Default Inert Alloy Synthesis Model
  return {
    success: true,
    junctionType: "Inert Binary Interface / Alloy",
    physics: {
      averageMolarMass: ((matA.molarMass + matB.molarMass) / 2).toFixed(2),
      densityDifference: Math.abs(matA.density - matB.density).toFixed(3)
    },
    structuralVerdict: "No Reactive Conflict Detected"
  };
}
