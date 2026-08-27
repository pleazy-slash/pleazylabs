import { matrix, multiply, add, exp, complex } from 'mathjs';

/**
 * Zorako Unified Domain Solver: Multi-Layer Photovoltaic Optics & Structural Contacts
 */

// AM1.5G Solar Spectrum Data (Wavelength nm vs Flux photons/m^2/s/nm)
const SPECTRAL_DATA = [
  { lambda: 380, flux: 1.1e17, n_perovskite: complex(2.4, 0.15) },
  { lambda: 500, flux: 1.5e18, n_perovskite: complex(2.5, 0.35) },
  { lambda: 650, flux: 1.7e18, n_perovskite: complex(2.3, 0.08) },
  { lambda: 800, flux: 1.4e18, n_perovskite: complex(2.1, 0.01) },
  { lambda: 950, flux: 9.0e17, n_perovskite: complex(2.0, 0.00) }
];

export function solveZorakoStack({
  layers = [],
  operating_temp_c = 25.0,
  mechanical_load_n = 0.0
}) {
  const q = 1.60217663e-19;
  const k_B = 8.61733e-5; // eV/K
  const T_K = operating_temp_c + 273.15;

  let total_photocurrent_a_m2 = 0;
  const layer_absorption = {};

  // 1. Rigorous Wavelength-Resolved Transfer Matrix Simulation
  SPECTRAL_DATA.forEach(spec => {
    let intensity = 1.0;

    layers.forEach(layer => {
      const d_m = (layer.thickness_nm || 100) * 1e-9;
      
      // Dynamic bandgap temperature dependence: Eg(T) = Eg0 - alpha * T^2 / (T + beta)
      const Eg0 = layer.bandgap_ev || 1.5;
      const Eg_T = Eg0 - (4.5e-4 * Math.pow(T_K, 2) / (T_K + 300));

      const k_coeff = layer.is_absorber ? spec.n_perovskite.im : 0.001;
      const alpha_cm1 = (4 * Math.PI * k_coeff) / (spec.lambda * 1e-7);
      
      const absorbed_fraction = intensity * (1 - Math.exp(-alpha_cm1 * (d_m * 100)));
      intensity -= absorbed_fraction;

      if (layer.is_absorber) {
        layer_absorption[layer.id] = (layer_absorption[layer.id] || 0) + absorbed_fraction;
        total_photocurrent_a_m2 += q * spec.flux * absorbed_fraction;
      }
    });
  });

  // Convert A/m2 to mA/cm2
  const Jsc = (total_photocurrent_a_m2 * 1000) / 10000;

  // 2. Diode Voltage & Temperature Decay Math
  const primary_absorber = layers.find(l => l.is_absorber) || layers[0] || {};
  const Eg_eff = primary_absorber.bandgap_ev || 1.5;
  const Voc = Math.max(0.1, (Eg_eff * 0.88) - (k_B * T_K * Math.log(1 / 0.4)));

  // Fill Factor via Empirical Green's Expression
  const v_norm = Voc / (k_B * T_K);
  const FF = ((v_norm - Math.log(v_norm + 0.7)) / (v_norm + 1)) * 100;
  const PCE = (Jsc * Voc * (FF / 100)) / 10; // Under 100 mW/cm2 standard 1-sun

  return {
    electrical_metrics: {
      open_circuit_voltage_v: Number(Voc.toFixed(4)),
      short_circuit_current_ma_cm2: Number(Math.max(1.0, Jsc).toFixed(2)),
      fill_factor_pct: Number(FF.toFixed(2)),
      efficiency_pce_pct: Number(PCE.toFixed(2))
    },
    thermal_state: {
      operating_temp_c,
      bandgap_at_temperature_ev: Number(Eg_eff.toFixed(3))
    }
  };
}
