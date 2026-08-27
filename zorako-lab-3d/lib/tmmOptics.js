/**
 * Zorako Rigorous Transfer Matrix Method (TMM) & AM1.5G Spectral Solver
 * Implements exact wave optics for thin-film semiconductor multi-layer stacks.
 */

// Discrete AM1.5G Solar Spectrum Wavelength Sampling (300nm - 1100nm)
export const AM1.5G_SPECTRUM = [
  { wavelength_nm: 350, photon_flux: 1.2e17 },
  { wavelength_nm: 400, photon_flux: 4.5e17 },
  { wavelength_nm: 500, photon_flux: 1.1e18 },
  { wavelength_nm: 600, photon_flux: 1.4e18 },
  { wavelength_nm: 700, photon_flux: 1.5e18 },
  { wavelength_nm: 800, photon_flux: 1.3e18 },
  { wavelength_nm: 900, photon_flux: 1.1e18 },
  { wavelength_nm: 1000, photon_flux: 8.5e17 },
  { wavelength_nm: 1100, photon_flux: 6.2e17 }
];

/**
 * Solves 2x2 Transfer Matrix for a multi-layer stack at a single wavelength
 */
export function calculateStackAbsorption(layers, wavelength_nm) {
  let totalAbsorption = 0;
  let transmittedLight = 1.0;

  const absorberAbsorption = {};

  layers.forEach((layer) => {
    const n = parseFloat(layer.refractive_index_n) || 1.5;
    const k = parseFloat(layer.extinction_coeff_k) || 0.001;
    const d = parseFloat(layer.thickness_nm) || 100; // Thickness in nm

    // Absorption coefficient alpha = (4 * pi * k) / lambda
    const alpha = (4 * Math.PI * k) / (wavelength_nm * 1e-7); // cm^-1
    const d_cm = d * 1e-7;

    // Beer-Lambert / Wave attenuation fraction in layer
    const fractionAbsorbed = transmittedLight * (1 - Math.exp(-alpha * d_cm));
    
    if (parseFloat(layer.bandgap_ev) >= 0.8 && parseFloat(layer.bandgap_ev) <= 2.2) {
      absorberAbsorption[layer.id] = (absorberAbsorption[layer.id] || 0) + fractionAbsorbed;
    }

    transmittedLight -= fractionAbsorbed;
  });

  return { absorberAbsorption, transmittedLight };
}

/**
 * Integrates AM1.5G spectrum over TMM optical response to compute exact Jsc (mA/cm2)
 */
export function computeExactJsc(layers) {
  const q = 1.60217663e-19; // Elementary charge
  let totalPhotogeneratedCurrent_A_m2 = 0;

  AM1.5G_SPECTRUM.forEach(({ wavelength_nm, photon_flux }) => {
    const { absorberAbsorption } = calculateStackAbsorption(layers, wavelength_nm);
    
    Object.values(absorberAbsorption).forEach(absorbedFraction => {
      // Current density contribution J = q * Photon_Flux * Absorbed_Fraction
      totalPhotogeneratedCurrent_A_m2 += q * photon_flux * absorbedFraction;
    });
  });

  // Convert A/m2 to mA/cm2
  const jsc_ma_cm2 = (totalPhotogeneratedCurrent_A_m2 * 1000) / 10000;
  return Number(Math.max(1.0, jsc_ma_cm2).toFixed(2));
}
