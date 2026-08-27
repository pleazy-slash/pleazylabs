/**
 * ZORAKO LAB: Material Synthesis & Cable Extrusion Engine
 * Calculates physical, electrical, and optical properties of mixed compounds.
 */

export const BASE_LIQUIDS = {
  SILICONE_RESIN: { name: 'Silicone Resin', density: 1.1, elasticityMPa: 5, conductivitySm: 1e-12, refractiveIndex: 1.4 },
  SILICA_GLASS: { name: 'Pure Silica (Melt)', density: 2.2, elasticityMPa: 70000, conductivitySm: 1e-14, refractiveIndex: 1.44 },
  POLYURETHANE: { name: 'Polyurethane', density: 1.2, elasticityMPa: 25, conductivitySm: 1e-10, refractiveIndex: 1.5 },
};

export const ADDITIVES = {
  GRAPHENE_NANO: { name: 'Graphene Nanopowder', density: 2.2, effect: 'CONDUCTIVITY', value: 1e5, percolationThreshold: 0.15 },
  PLASTICIZER: { name: 'Phthalate Plasticizer', density: 0.9, effect: 'ELASTICITY', value: -0.5, percolationThreshold: 0 },
  GERMANIUM_DIOXIDE: { name: 'Germanium Dioxide (Dopant)', density: 4.2, effect: 'REFRACTION', value: 1.6, percolationThreshold: 0 },
};

export function mixMaterial(baseId, additiveId, additivePercentage) {
  const base = BASE_LIQUIDS[baseId];
  const additive = ADDITIVES[additiveId];
  const f_additive = additivePercentage / 100;
  const f_base = 1 - f_additive;

  // 1. Rule of Mixtures: Density
  const newDensity = (base.density * f_base) + (additive.density * f_additive);

  // 2. Percolation Theory: Electrical Conductivity
  let newConductivity = base.conductivitySm;
  if (additive.effect === 'CONDUCTIVITY') {
    if (f_additive >= additive.percolationThreshold) {
      // Conductive network formed
      newConductivity = additive.value * Math.pow((f_additive - additive.percolationThreshold), 1.5);
    }
  }

  // 3. Elasticity Modifiers
  let newElasticity = base.elasticityMPa;
  if (additive.effect === 'ELASTICITY') {
    newElasticity = Math.max(0.1, base.elasticityMPa * (1 + (additive.value * f_additive * 2)));
  }

  // 4. Optical Refraction Modifiers
  let newRefraction = base.refractiveIndex;
  if (additive.effect === 'REFRACTION') {
    newRefraction = (base.refractiveIndex * f_base) + (additive.value * f_additive);
  }

  return {
    density: newDensity,
    elasticityMPa: newElasticity,
    conductivitySm: newConductivity,
    refractiveIndex: newRefraction,
    isConductive: newConductivity > 1e-3,
  };
}

export function testCableCurrent(conductivitySm, voltageV, lengthM, radiusMm) {
  const areaM2 = Math.PI * Math.pow(radiusMm / 1000, 2);
  // R = L / (σ * A)
  const resistanceOhms = lengthM / (conductivitySm * areaM2);
  const currentAmps = voltageV / resistanceOhms;
  return { resistanceOhms, currentAmps };
}
