/**
 * Zorako DMLS/LPBF Additive Process Physics Engine
 * Models Melt Pool Dynamics, Residual Thermal Stress, and Porosity Defect Rates
 */

export function simulateDMLSProcess({
  laser_power_watts = 200,
  scan_speed_mm_s = 800,
  layer_thickness_um = 30,
  hatch_spacing_um = 100
}) {
  // Volumetric Energy Density (VED) = P / (v * h * t) [J/mm3]
  const VED = laser_power_watts / ((scan_speed_mm_s) * (hatch_spacing_um / 1000) * (layer_thickness_um / 1000));

  let porosity_pct = 0.15; // Optimal density (~99.85%)
  let residual_thermal_stress_mpa = 120; // Internal stress from cooling gradient

  if (VED < 50) {
    // Under-melting / Lack of Fusion defects
    porosity_pct = 1.85 + (50 - VED) * 0.05;
    residual_thermal_stress_mpa = 80;
  } else if (VED > 120) {
    // Keyhole mode porosity / Overheating
    porosity_pct = 0.95 + (VED - 120) * 0.02;
    residual_thermal_stress_mpa = 210;
  }

  return {
    volumetric_energy_density_j_mm3: Number(VED.toFixed(2)),
    as_printed_porosity_pct: Number(porosity_pct.toFixed(2)),
    residual_tensile_stress_mpa: Number(residual_thermal_stress_mpa.toFixed(1)),
    process_regime: VED < 50 ? "LACK_OF_FUSION" : VED > 120 ? "KEYHOLE_OVERHEATING" : "CONDUCTION_OPTIMAL"
  };
}
