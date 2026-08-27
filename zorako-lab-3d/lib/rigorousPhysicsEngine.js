/**
 * Zorako Fully Calibrated Electro-Optical & Hydro-Thermal Engine
 * Standard Silicon Diode Parameters & Dynamic Water Column Extinction
 */

const AM15G_SPECTRUM = [
  { lambda: 300, E: 0.05 }, { lambda: 350, E: 0.28 }, { lambda: 400, E: 0.72 },
  { lambda: 450, E: 1.25 }, { lambda: 500, E: 1.54 }, { lambda: 550, E: 1.52 },
  { lambda: 600, E: 1.48 }, { lambda: 650, E: 1.33 }, { lambda: 700, E: 1.21 },
  { lambda: 750, E: 1.05 }, { lambda: 800, E: 0.95 }, { lambda: 850, E: 0.88 },
  { lambda: 900, E: 0.73 }, { lambda: 950, E: 0.35 }, { lambda: 1000, E: 0.62 },
  { lambda: 1050, E: 0.58 }, { lambda: 1100, E: 0.49 }, { lambda: 1150, E: 0.22 },
  { lambda: 1200, E: 0.38 }
];

const Q = 1.602176634e-19;
const KB = 1.380649e-23;
const H = 6.62607015e-34;
const C = 299792458;

export function calculateFluidConvectiveH(depth_m, velocity_m_s, surface_temp_c, fluid_temp_c) {
  if (depth_m <= 0) return 15.0; // Air baseline

  const delta_T = Math.max(0.1, Math.abs(surface_temp_c - fluid_temp_c));
  const L = 1.0;
  const k_w = 0.606;
  const nu = 1.006e-6;
  const beta = 2.07e-4;
  const Pr = 7.01;
  const g = 9.80665;

  const Ra = (g * beta * delta_T * Math.pow(L, 3)) / (nu * (nu / Pr));
  const Nu_natural = Math.pow(0.825 + (0.387 * Math.pow(Ra, 1/6)) / Math.pow(1 + Math.pow(0.492 / Pr, 9/16), 8/27), 2);
  
  const Re = (velocity_m_s * L) / nu;
  const Nu_forced = 0.037 * Math.pow(Re, 0.8) * Math.pow(Pr, 1/3);

  return Number((Math.max(Nu_natural, Nu_forced) * k_w / L).toFixed(2));
}

export function solveRigorousSolarPhysics({
  incident_angle_deg = 0,
  water_depth_m = 0,
  operating_temp_c = 25
}) {
  const T_kelvin = operating_temp_c + 273.15;
  const V_thermal = (KB * T_kelvin) / Q;

  const theta_rad = (incident_angle_deg * Math.PI) / 180.0;
  const n1 = water_depth_m > 0 ? 1.333 : 1.000;
  const n2 = 1.52;

  const sin_t2 = (n1 / n2) * Math.sin(theta_rad);
  const theta2_rad = sin_t2 > 1.0 ? Math.PI / 2 : Math.asin(sin_t2);

  const cos1 = Math.cos(theta_rad);
  const cos2 = Math.cos(theta2_rad);
  const r_s = (n1 * cos1 - n2 * cos2) / (n1 * cos1 + n2 * cos2);
  const r_p = (n1 * cos2 - n2 * cos1) / (n1 * cos2 + n2 * cos1);
  const R_fresnel = (Math.pow(r_s, 2) + Math.pow(r_p, 2)) / 2.0;
  const T_fresnel = 1.0 - R_fresnel;

  let total_incident_power_w_m2 = 0;
  let total_photon_flux = 0;

  // Temperature-dependent bandgap (Varshni relation for Silicon)
  const Eg_eV = 1.17 - (4.73e-4 * Math.pow(T_kelvin, 2)) / (T_kelvin + 636);

  AM15G_SPECTRUM.forEach(spec => {
    const lambda_m = spec.lambda * 1e-9;
    const E_photon_J = (H * C) / lambda_m;
    const E_photon_eV = E_photon_J / Q;

    // Underwater optical extinction
    const alpha_water = 0.015 * Math.exp((spec.lambda - 400) / 180.0);
    const water_transmission = Math.exp(-alpha_water * water_depth_m);
    
    const spectral_irradiance = spec.E * T_fresnel * water_transmission * 20.0;
    total_incident_power_w_m2 += spectral_irradiance;

    if (E_photon_eV >= Eg_eV) {
      const IQE = 0.92;
      total_photon_flux += (spectral_irradiance / E_photon_J) * IQE;
    }
  });

  // Short-circuit current density (mA/cm^2)
  const Jsc = (total_photon_flux * Q) / 10.0;

  // Calibrated Reverse Saturation Current J0 for Silicon (A/cm^2)
  const J0_ref = 1e-11; 
  const Eg_ref = 1.12;
  const J0 = J0_ref * Math.pow(T_kelvin / 298.15, 3) * Math.exp((-Eg_eV / V_thermal) + (Eg_ref / ((KB * 298.15) / Q)));

  // Ideal diode voltage calculation
  const n_ideality = 1.1; 
  const Voc = Jsc > 0 ? n_ideality * V_thermal * Math.log(((Jsc / 1000.0) / J0) + 1) : 0;

  // Green's equation for Fill Factor
  const v_oc_n = Voc / (n_ideality * V_thermal);
  const FF = v_oc_n > 0 ? (v_oc_n - Math.log(v_oc_n + 0.72)) / (v_oc_n + 1) : 0;

  // Power Conversion Efficiency relative to local incident irradiance
  const max_power_w_m2 = (Jsc * 10) * Voc * FF;
  const PCE = total_incident_power_w_m2 > 0 ? (max_power_w_m2 / total_incident_power_w_m2) * 100 : 0;

  return {
    incident_irradiance_w_m2: Number(total_incident_power_w_m2.toFixed(2)),
    short_circuit_current_jsc_ma_cm2: Number(Jsc.toFixed(3)),
    open_circuit_voltage_voc_v: Number(Voc.toFixed(4)),
    fill_factor_pct: Number((FF * 100).toFixed(2)),
    power_conversion_efficiency_pce_pct: Number(PCE.toFixed(2)),
    bandgap_ev: Number(Eg_eV.toFixed(3)),
    fresnel_reflection_loss_pct: Number((R_fresnel * 100).toFixed(2))
  };
}
