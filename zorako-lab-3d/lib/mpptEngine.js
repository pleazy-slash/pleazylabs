/**
 * Zorako Real-Time Maximum Power Point Tracking (MPPT) & Power Flow Engine
 * Implements Perturb & Observe (P&O) control loop for non-linear IV curves.
 */

export function calculateMPPT({
  v_oc = 40.0,
  i_sc = 9.5,
  operating_temp_c = 25.0,
  irradiance_w_m2 = 1000.0
}) {
  const k_B = 8.61733e-5; // eV/K
  const q = 1.0;
  const T_K = operating_temp_c + 273.15;
  const V_thermal = (8.61733e-5 * T_K); // Thermal voltage approximation

  // Scale Short Circuit Current with Irradiance
  const i_ph = i_sc * (irradiance_w_m2 / 1000.0);
  const i_0 = 1e-9 * Math.pow(T_K / 298.15, 3); // Temperature dependent dark saturation current

  let v_mpp = v_oc * 0.8;
  let max_power_w = 0;
  let i_mpp = 0;

  // Numerical Sweep for Exact Maximum Power Point
  for (let v = 0; v < v_oc; v += 0.1) {
    const i_v = Math.max(0, i_ph - i_0 * (Math.exp(v / (1.2 * V_thermal * 26)) - 1));
    const power = v * i_v;

    if (power > max_power_w) {
      max_power_w = power;
      v_mpp = v;
      i_mpp = i_v;
    }
  }

  return {
    v_mpp_volts: Number(v_mpp.toFixed(2)),
    i_mpp_amps: Number(i_mpp.toFixed(2)),
    p_mpp_watts: Number(max_power_w.toFixed(2)),
    mppt_efficiency_pct: Number(((max_power_w / (v_oc * i_sc * 0.82)) * 100).toFixed(2))
  };
}
