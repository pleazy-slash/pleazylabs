/**
 * ZORAKO LAB: Spatial Tolerance & CAD Assembly Validator
 * Verifies component fit clearances, enclosure seals, and virtual bonding actions.
 */

export function validateEnclosureFit(innerComponent, outerContainer) {
  const innerRadius = innerComponent.outerRadiusMm || 0;
  const innerHeight = innerComponent.heightMm || 0;
  const containerInnerRadius = outerContainer.innerRadiusMm || 0;
  const containerInnerHeight = outerContainer.innerHeightMm || 0;

  const radialClearanceMm = containerInnerRadius - innerRadius;
  const heightClearanceMm = containerInnerHeight - innerHeight;

  const passesFit = radialClearanceMm >= 0 && heightClearanceMm >= 0;

  return {
    passesFit,
    radialClearanceMm,
    heightClearanceMm,
    status: passesFit
      ? `FIT OK (${radialClearanceMm.toFixed(2)}mm clearance)`
      : `CLASH DETECTED: Inner component exceeds container by ${Math.abs(radialClearanceMm).toFixed(2)}mm`,
  };
}

export const ASSEMBLY_OPERATIONS = {
  SPOT_WELD: { name: 'Spot Weld', jointStrengthMPa: 250, executionTimeMs: 100 },
  LASER_WELD: { name: 'Laser Weld (Hermetic Seal)', jointStrengthMPa: 450, executionTimeMs: 50 },
  THREAD_TAP: { name: 'Thread Tap Fasten', jointStrengthMPa: 180, executionTimeMs: 200 },
  PRESS_FIT: { name: 'Interference Press Fit', jointStrengthMPa: 120, executionTimeMs: 30 },
};
