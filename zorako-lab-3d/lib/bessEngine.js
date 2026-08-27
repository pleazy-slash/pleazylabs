/**
 * Zorako Battery Energy Storage System (BESS) Core
 * Models LiFePO4 / NMC internal resistance, C-rate heat generation, and capacity fade.
 */

export function simulateBatteryPack({
  capacity_kwh = 10.0,
  charge_discharge_power_kw = 3.5,
  operating_temp_c = 30.0,
  cycles_completed = 500
}) {
  // C-rate = Power / Capacity
  const c_rate = charge_discharge_power_kw / capacity_kwh;

  // Internal Resistance degradation over temperature and cycles
  const base_internal_res_ohms = 0.02;
  const cycle_degradation_factor = 1 + (cycles_completed * 0.00015);
  const temp_res_factor = operating_temp_c < 20 ? 1.4 : operating_temp_c > 45 ? 1.2 : 1.0;
  
  const effective_resistance_ohms = base_internal_res_ohms * cycle_degradation_factor * temp_res_factor;

  // Joule Heating (P = I^2 * R)
  const pack_voltage_v = 51.2; // 16S LiFePO4
  const current_a = (charge_discharge_power_kw * 1000) / pack_voltage_v;
  const internal_heat_watts = Math.pow(current_a, 2) * effective_resistance_ohms;

  // Health Estimation (SOH %)
  const state_of_health_pct = Math.max(50.0, 100 - (cycles_completed * 0.012) - (operating_temp_c > 35 ? (operating_temp_c - 35) * 0.4 : 0));

  return {
    pack_capacity_kwh: capacity_kwh,
    c_rate: Number(c_rate.toFixed(2)),
    state_of_health_pct: Number(state_of_health_pct.toFixed(1)),
    internal_resistance_milli_ohms: Number((effective_resistance_ohms * 1000).toFixed(2)),
    internal_joule_heating_w: Number(internal_heat_watts.toFixed(1)),
    bess_diagnostics: state_of_health_pct < 80 ? "CAPACITY_FADE_WARNING" : "HEALTHY"
  };
}
