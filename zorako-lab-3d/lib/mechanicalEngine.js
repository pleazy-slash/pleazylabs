/**
 * Zorako Advanced Mechanical FEA & Materials Science Engine
 * Computes Dynamic Thermal Degradation, Fatigue Cycles, Yield Boundaries, and 3D-Print Anisotropy
 */

export function simulateAdvancedComponent({
  component_type = 'helical_spring',
  wire_diameter_mm = 2.5,
  coil_diameter_mm = 22.0,
  active_coils = 8,
  applied_force_n = 75.0,
  operating_temp_c = 25.0,
  material = {
    name: '316L Stainless Steel (DMLS Printed)',
    shear_modulus_gpa: 79.3,
    yield_strength_mpa: 450,
    ultimate_tensile_mpa: 650,
    endurance_limit_mpa: 240,
    thermal_expansion_coeff: 16.0e-6,
    print_z_axis_degradation_factor: 0.82 // 18% weaker across layer boundaries
  },
  print_orientation = 'z_axis_loaded' // 'xy_plane' vs 'z_axis_loaded'
}) {
  const d = wire_diameter_mm / 1000;
  const D = coil_diameter_mm / 1000;
  const N = active_coils;

  // 1. Thermal Degradation of Modulus: G(T) = G0 * (1 - 0.0004 * (T - 25))
  const deltaT = Math.max(0, operating_temp_c - 25.0);
  const G_effective_gpa = material.shear_modulus_gpa * (1 - (0.0004 * deltaT));
  const G = G_effective_gpa * 1e9;

  // 2. Anisotropic Material Adjustment for 3D Printing
  const printFactor = print_orientation === 'z_axis_loaded' ? material.print_z_axis_degradation_factor : 1.0;
  const effective_yield_mpa = material.yield_strength_mpa * printFactor;

  // 3. Spring Rate & Displacement
  const spring_rate_k = (G * Math.pow(d, 4)) / (8 * Math.pow(D, 3) * N);
  const displacement_mm = (applied_force_n / spring_rate_k) * 1000;

  // 4. Wahl Torsional Stress & Goodman Cyclic Fatigue Analysis
  const C = D / d;
  const K_wahl = ((4 * C - 1) / (4 * C - 4)) + (0.615 / C);
  const max_shear_stress_mpa = (K_wahl * ((8 * applied_force_n * D) / (Math.PI * Math.pow(d, 3)))) / 1e6;

  // Stress Ratio vs Yield
  const stress_ratio_yield_pct = Number(((max_shear_stress_mpa / effective_yield_mpa) * 100).toFixed(2));

  // Goodman Life Expectancy Approximation (Cycles to Failure)
  let fatigue_life_cycles = "INFINITE (>10^7)";
  if (max_shear_stress_mpa > material.endurance_limit_mpa) {
    const stressExcess = max_shear_stress_mpa / material.endurance_limit_mpa;
    const cycles = Math.max(1000, Math.round(1e7 / Math.pow(stressExcess, 5)));
    fatigue_life_cycles = cycles.toLocaleString();
  }

  // Diagnostics & Structural Risk Warnings
  const failure_modes = [];
  if (max_shear_stress_mpa > effective_yield_mpa) {
    failure_modes.push({
      severity: "CRITICAL_FAILURE",
      defect: "Plastic Yielding / Permanent Deformation",
      detail: `Max shear stress (${max_shear_stress_mpa.toFixed(1)} MPa) exceeds anisotropic yield threshold (${effective_yield_mpa.toFixed(1)} MPa).`
    });
  } else if (stress_ratio_yield_pct > 75) {
    failure_modes.push({
      severity: "WARNING",
      defect: "High Stress Concentration",
      detail: `Operating at ${stress_ratio_yield_pct}% of material yield boundary under current load.`
    });
  }

  if (print_orientation === 'z_axis_loaded') {
    failure_modes.push({
      severity: "INFO",
      defect: "3D Print Layer Anisotropy Modeled",
      detail: `Z-axis print layer boundary reduced effective shear strength to ${effective_yield_mpa.toFixed(1)} MPa.`
    });
  }

  return {
    thermal_degraded_shear_modulus_gpa: Number(G_effective_gpa.toFixed(2)),
    spring_rate_n_mm: Number((spring_rate_k / 1000).toFixed(3)),
    displacement_mm: Number(displacement_mm.toFixed(3)),
    peak_shear_stress_mpa: Number(max_shear_stress_mpa.toFixed(2)),
    anisotropic_yield_limit_mpa: Number(effective_yield_mpa.toFixed(2)),
    yield_stress_ratio_pct: stress_ratio_yield_pct,
    estimated_fatigue_life: fatigue_life_cycles,
    structural_diagnostics: failure_modes
  };
}
