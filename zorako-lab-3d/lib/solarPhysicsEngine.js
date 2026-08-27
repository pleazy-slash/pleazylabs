const q = 1.602176634e-19;
const k = 1.380649e-23;

export function calculateIVCurve({ tempC = 25, irradianceW = 1000, areaCm2 = 156 } = {}) {
  const tempK = tempC + 273.15;
  const Vt = (k * tempK) / q;
  const Jph = (irradianceW / 1000) * 0.038 * areaCm2;
  const J0 = 1.5e-11 * Math.pow(tempK / 298.15, 3) * Math.exp(-1.12 / Vt);
  let Voc = Vt * 1.2 * Math.log((Jph / J0) + 1);
  let maxPower = 0;
  
  for (let i = 0; i <= 20; i++) {
    let V = (Voc * i) / 20;
    let I = Math.max(0, Jph - J0 * (Math.exp(V / (1.2 * Vt)) - 1));
    let P = V * I;
    if (P > maxPower) maxPower = P;
  }

  return {
    openCircuitVoltageVoc: Voc.toFixed(3),
    shortCircuitCurrentIsc: Jph.toFixed(3),
    maxPowerW: maxPower.toFixed(3),
    efficiencyPct: ((maxPower / ((irradianceW / 10000) * areaCm2)) * 100).toFixed(2)
  };
}

export function calculateOpticalAbsorption(thicknessMicrons = 180) {
  const spectrum = [{ lambda: 400, alpha: 100000 }, { lambda: 600, alpha: 5000 }, { lambda: 900, alpha: 300 }];
  return spectrum.map(item => ({
    wavelengthNm: item.lambda,
    absorptionPct: ((1 - Math.exp(-item.alpha * thicknessMicrons * 1e-4)) * 100).toFixed(2)
  }));
}