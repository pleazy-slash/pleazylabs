/**
 * Zorako High-Efficiency Power Electronics & Inverter Engine
 * Models IGBT/MOSFET conduction losses, switching heat generation, and thermal limits.
 */

export function simulateInverter({
  input_dc_voltage_v = 400.0,
  load_power_kw = 5.0,
  switching_frequency_khz = 20.0,
  ambient_temp_c = 35.0,
  heatsink_thermal_resistance_k_w = 0.4
}) {
  const load_power_w = load_power_kw * 1000;
  const current_a = load_power_w / input_dc_voltage_v;

  // Conduction losses (I^2 * R_ds_on) + Switching losses (proportional to frequency)
  const r_ds_on_ohms = 0.045; // High-power Silicon Carbide (SiC) MOSFET
  const conduction_loss_w = Math.pow(current_a, 2) * r_ds_on_ohms;
  const switching_loss_w = current_a * input_dc_voltage_v * (switching_frequency_khz * 1e3) * 1.2e-8;
  const total_heat_dissipated_w = conduction_loss_w + switching_loss_w;

  // Temperature rise on heatsink: T_junction = T_ambient + (P_loss * R_th)
  const junction_temp_c = ambient_temp_c + (total_heat_dissipated_w * heatsink_thermal_resistance_k_w);

  // Efficiency calculation
  const output_ac_power_w = load_power_w - total_heat_dissipated_w;
  const efficiency_pct = (output_ac_power_w / load_power_w) * 100;

  return {
    input_dc_power_kw: load_power_kw,
    output_ac_power_kw: Number((output_ac_power_w / 1000).toFixed(3)),
    efficiency_pct: Number(efficiency_pct.toFixed(2)),
    thermal_output: {
      heat_dissipated_watts: Number(total_heat_dissipated_w.toFixed(1)),
      junction_temperature_c: Number(junction_temp_c.toFixed(1)),
      thermal_status: junction_temp_c > 110 ? "OVERHEATING_CRITICAL" : "OPTIMAL"
    }
  };
}
