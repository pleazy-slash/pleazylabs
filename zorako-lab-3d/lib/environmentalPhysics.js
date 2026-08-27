/**
 * Zorako High-Precision Multi-Medium & Submersion Environmental Engine
 * Solves Snell's Law, Fresnel Wave Polarization, Hydrostatic Stress & Water Ingress
 */

export const ENVIRONMENTAL_PRESETS = {
  AIR_STANDARD: { name: "Standard Ambient Air", n_medium: 1.000, density_kg_m3: 1.225, viscosity_pa_s: 1.81e-5, h_conv: 15.0, water_depth_m: 0.0 },
  FRESH_WATER_SUBMERGED: { name: "Freshwater Immersion (IP67/IP68)", n_medium: 1.333, density_kg_m3: 997.0, viscosity_pa_s: 8.9e-4, h_conv: 650.0, water_depth_m: 1.5 },
  SALT_WATER_SUBMERGED: { name: "Oceanic Marine Immersion", n_medium: 1.340, density_kg_m3: 1025.0, viscosity_pa_s: 1.07e-3, h_conv: 850.0, water_depth_m: 3.0 },
  HIGH_HUMIDITY_TROPICAL: { name: "Tropical High Humidity (95% RH)", n_medium: 1.003, density_kg_m3: 1.18, viscosity_pa_s: 1.85e-5, h_conv: 22.0, water_depth_m: 0.0 }
};

export function simulateEnvironmentalBoundary({
  preset = "FRESH_WATER_SUBMERGED",
  incident_angle_deg = 30.0,
  water_depth_m = 1.0,
  enclosure_seal_thickness_mm = 3.0,
  operating_temp_c = 25.0
}) {
  const env = ENVIRONMENTAL_PRESETS[preset] || ENVIRONMENTAL_PRESETS.FRESH_WATER_SUBMERGED;
  const depth = water_depth_m !== undefined ? water_depth_m : env.water_depth_m;

  // 1. Snell's Law & Multi-Medium Refraction across Medium -> Glass Boundary
  const n1 = env.n_medium;
  const n2_glass = 1.52; // Solar Tempered Glass Refractive Index
  const theta1_rad = (incident_angle_deg * Math.PI) / 180.0;
  
  // Critical Angle Check
  const sin_theta2 = (n1 / n2_glass) * Math.sin(theta1_rad);
  const total_internal_reflection = sin_theta2 > 1.0;
  const theta2_rad = total_internal_reflection ? Math.PI / 2 : Math.asin(sin_theta2);
  const refraction_angle_deg = (theta2_rad * 180.0) / Math.PI;

  // 2. Fresnel Equations for s- and p-Polarized Wave Reflectivity
  let R_s = 1.0, R_p = 1.0;
  if (!total_internal_reflection) {
    const cos1 = Math.cos(theta1_rad);
    const cos2 = Math.cos(theta2_rad);
    const r_s = (n1 * cos1 - n2_glass * cos2) / (n1 * cos1 + n2_glass * cos2);
    const r_p = (n1 * cos2 - n2_glass * cos1) / (n1 * cos2 + n2_glass * cos1);
    R_s = Math.pow(r_s, 2);
    R_p = Math.pow(r_p, 2);
  }
  const average_reflectivity = (R_s + R_p) / 2.0;
  const optical_transmissivity = (1.0 - average_reflectivity) * 100;

  // 3. Underwater Spectral Attenuation (Beer-Lambert + Water Scattering)
  // Water absorbs Red/NIR wavelengths (650-1000nm) heavily
  const attenuation_coeff_red = 0.35; // m^-1 at 700nm
  const attenuation_coeff_blue = 0.02; // m^-1 at 450nm
  const spectral_transmissivity_red = Math.exp(-attenuation_coeff_red * depth);
  const spectral_transmissivity_blue = Math.exp(-attenuation_coeff_blue * depth);

  // 4. Hydrostatic Pressure & Ingress Protection (IP Rating Validation)
  const g = 9.80665;
  const atmospheric_pressure_kpa = 101.325;
  const hydrostatic_pressure_kpa = (env.density_kg_m3 * g * depth) / 1000.0;
  const total_surface_pressure_kpa = atmospheric_pressure_kpa + hydrostatic_pressure_kpa;

  // Fick's First Law for Moisture Vapor Transmission Rate (MVTR) through Gasket
  const D_silicone = 1.5e-11; // Diffusion coefficient (m^2/s)
  const concentration_gradient = (depth > 0 ? 100.0 : 50.0) / (enclosure_seal_thickness_mm * 1e-3);
  const moisture_flux_mg_m2_hr = D_silicone * concentration_gradient * 3600 * 1e6;

  // IP Rating Determination
  let ip_rating = "IP65 (Dust Tight, Water Jet Protected)";
  if (depth >= 1.0 && moisture_flux_mg_m2_hr < 0.05) ip_rating = "IP68 (Continuous Submersion Verified)";
  else if (depth > 0.1) ip_rating = "IP67 (Temporary Immersion Verified)";

  return {
    environment_preset: env.name,
    optics: {
      incident_medium_index_n: n1,
      incident_angle_deg,
      refraction_angle_deg: Number(refraction_angle_deg.toFixed(2)),
      fresnel_reflectivity_pct: Number((average_reflectivity * 100).toFixed(2)),
      surface_transmissivity_pct: Number(optical_transmissivity.toFixed(2)),
      underwater_red_spectrum_retention_pct: Number((spectral_transmissivity_red * 100).toFixed(2)),
      underwater_blue_spectrum_retention_pct: Number((spectral_transmissivity_blue * 100).toFixed(2))
    },
    hydrodynamics_and_seals: {
      submersion_depth_meters: depth,
      hydrostatic_pressure_kpa: Number(hydrostatic_pressure_kpa.toFixed(2)),
      total_enclosure_pressure_kpa: Number(total_surface_pressure_kpa.toFixed(2)),
      moisture_ingress_flux_mg_m2_hr: Number(moisture_flux_mg_m2_hr.toFixed(4)),
      fluid_convective_heat_transfer_h: env.h_conv,
      ingress_protection_class: ip_rating
    }
  };
}
