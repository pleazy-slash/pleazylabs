import { computeExactJsc } from './tmmOptics';

export function solveMultiPhysicsStack(layers, interfaces = [], environment = {}) {
  const {
    temp_c = 25.0,
    irradiance_w_m2 = 1000.0,
    relative_humidity_pct = 45.0
  } = environment;

  const diagnostics = [];

  // 1. TMM Photogenerated Current Integration
  const jsc_exact = computeExactJsc(layers);

  // 2. Interfacial Lubricant & Thermal Resistance Solver
  let totalInterfacialThermalResistance = 0.001; // K*m2/W

  interfaces.forEach(inf => {
    const k_fluid = parseFloat(inf.thermal_conductivity_w_mk) || 0.25;
    const thickness_m = (parseFloat(inf.interfacial_thickness_nm) || 10) * 1e-9;
    const vis = parseFloat(inf.viscosity_pas) || 0.05;

    // R_th = d / k
    const r_th = thickness_m / k_fluid;
    totalInterfacialThermalResistance += r_th;

    diagnostics.push({
      type: 'FLUID_DYNAMIC_ANALYSIS',
      message: `Interfacial Media (${inf.media_name}): Viscosity = ${vis} Pa·s, Local Boundary Thermal Resistance = ${r_th.toExponential(3)} K·m²/W.`
    });
  });

  // Effective junction operating temperature accounting for thermal resistance dissipation
  const junction_temp_c = temp_c + (irradiance_w_m2 * 0.0008 * (1 + totalInterfacialThermalResistance * 1000));

  // 3. Shockley-Queisser Voltage Calculation with Temperature Decay
  const primaryAbsorber = layers.find(l => Number(l.bandgap_ev) >= 0.8) || layers[0];
  const Eg = parseFloat(primaryAbsorber.bandgap_ev) || 1.34;
  const k_B = 8.617333262e-5; // eV/K
  const T_kelvin = junction_temp_c + 273.15;

  // Voc = (Eg / q) - (k_B * T / q) * ln(I_0 / I_ph)
  const radLossFactor = 0.38;
  const voc_exact = Math.max(0.1, (Eg * 0.85) - (k_B * T_kelvin * Math.log(1 / radLossFactor)));

  // Fill Factor (Empirical Green's Formula)
  const v_oc_normalized = voc_exact / (k_B * T_kelvin);
  const ff_exact = Math.min(88.0, Math.max(30.0, ((v_oc_normalized - Math.log(v_oc_normalized + 0.7)) / (v_oc_normalized + 1)) * 100));

  const inputPower = irradiance_w_m2 / 10;
  const outputPower = jsc_exact * voc_exact * (ff_exact / 100);
  const pce = parseFloat(((outputPower / inputPower) * 100).toFixed(2));

  return {
    metrics: {
      primary_absorber: primaryAbsorber.material_name || primaryAbsorber.layer_name,
      junction_temperature_c: Number(junction_temp_c.toFixed(2)),
      open_circuit_voltage_v: Number(voc_exact.toFixed(4)),
      short_circuit_current_ma_cm2: jsc_exact,
      fill_factor_pct: Number(ff_exact.toFixed(2)),
      pce_efficiency_pct: pce
    },
    diagnostics
  };
}
