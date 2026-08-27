/**
 * ZORAKO NUMERICALLY STABILIZED MULTIPHYSICS ENGINE
 * Scaled Poisson-Drift-Diffusion Engine (Normalized Units)
 */

export const PHYSICAL_CONSTANTS = Object.freeze({
  q: 1.602176634e-19,
  kB: 1.380649e-23,
  eps_si: 11.7 * 8.8541878128e-12,
  Eg0: 1.12
});

export function bernoulli(x) {
  if (Math.abs(x) < 1e-4) {
    return 1.0 - x / 2.0 + (x * x) / 12.0 - (x * x * x * x) / 720.0;
  }
  if (x > 80.0) return 0.0;
  if (x < -80.0) return -x;
  return x / (Math.exp(x) - 1.0);
}

export class DynamicEnvironment {
  constructor(tempCelsius = 25.0, irradiance_W_m2 = 1000.0) {
    this.tempCelsius = tempCelsius;
    this.tempKelvin = tempCelsius + 273.15;
    this.irradiance_W_m2 = irradiance_W_m2;
    this.Vt = (PHYSICAL_CONSTANTS.kB * this.tempKelvin) / PHYSICAL_CONSTANTS.q;
    const T = this.tempKelvin;
    this.ni = 5.29e19 * Math.pow(T / 300.15, 1.5) * Math.exp(-PHYSICAL_CONSTANTS.Eg0 / (2 * 8.61733e-5 * T));
    this.un = 1350.0 * Math.pow(300.15 / T, 1.5);
    this.up = 480.0 * Math.pow(300.15 / T, 1.5);
  }
}

export class SemiconductorDevice1D {
  constructor(thickness_um, nodeCount, donorDoping_cm3, acceptorDoping_cm3, junctionDepth_um, env = new DynamicEnvironment()) {
    this.nodeCount = nodeCount;
    this.thickness_cm = thickness_um * 1e-4;
    this.dx = this.thickness_cm / (nodeCount - 1);
    this.env = env;
    
    this.x = new Float64Array(nodeCount);
    this.N_D = new Float64Array(nodeCount);
    this.N_A = new Float64Array(nodeCount);
    this.u = new Float64Array(nodeCount); // Normalized potential u = psi / Vt
    this.n = new Float64Array(nodeCount);
    this.p = new Float64Array(nodeCount);
    
    const junctionDepth_cm = junctionDepth_um * 1e-4;
    for (let i = 0; i < nodeCount; i++) {
      this.x[i] = i * this.dx;
      if (this.x[i] <= junctionDepth_cm) {
        this.N_D[i] = donorDoping_cm3;
        this.N_A[i] = 0.0;
      } else {
        this.N_D[i] = 0.0;
        this.N_A[i] = acceptorDoping_cm3;
      }
    }
  }

  solvePoisson(appliedBiasV = 0.0, maxIterations = 5000, tolerance = 1e-6) {
    const ni = this.env.ni;
    const Vt = this.env.Vt;
    const q = PHYSICAL_CONSTANTS.q;
    const eps = PHYSICAL_CONSTANTS.eps_si;
    const dx_m = this.dx * 1e-2;

    // Boundary potential calculations (Normalized)
    const netN = Math.max(1.0, this.N_D[0] - this.N_A[0]);
    const netP = Math.max(1.0, this.N_A[this.nodeCount - 1] - this.N_D[this.nodeCount - 1]);

    const u0 = Math.log(netN / ni);
    const uL = -Math.log(netP / ni) + (appliedBiasV / Vt);

    // Initial linear profile guess for u
    for (let i = 0; i < this.nodeCount; i++) {
      this.u[i] = u0 + (uL - u0) * (i / (this.nodeCount - 1));
    }

    // Normalized Poisson scaling constant: C = (q * dx^2 * ni) / (eps * Vt)
    const C = (q * Math.pow(dx_m, 2) * (ni * 1e6)) / (eps * Vt);

    for (let iter = 0; iter < maxIterations; iter++) {
      let maxDelta = 0.0;

      for (let i = 1; i < this.nodeCount - 1; i++) {
        const netDoping_ni = (this.N_D[i] - this.N_A[i]) / ni;
        
        // Slotboom local charge equilibrium projection
        const n_norm = Math.exp(this.u[i]);
        const p_norm = Math.exp(-this.u[i]);
        const f_u = (this.u[i + 1] - 2.0 * this.u[i] + this.u[i - 1]) + C * (p_norm - n_norm + netDoping_ni);
        const df_du = -2.0 - C * (p_norm + n_norm);

        let deltaU = -f_u / df_du;
        // Clamp potential updates to prevent numerical oscillation & explosion
        if (deltaU > 0.5) deltaU = 0.5;
        if (deltaU < -0.5) deltaU = -0.5;

        this.u[i] += deltaU;

        if (Math.abs(deltaU) > maxDelta) maxDelta = Math.abs(deltaU);
      }

      this.u[0] = u0;
      this.u[this.nodeCount - 1] = uL;

      if (maxDelta < tolerance) break;
    }

    // Reconstruct physical densities and electrostatic potential
    this.psi = new Float64Array(this.nodeCount);
    for (let i = 0; i < this.nodeCount; i++) {
      this.psi[i] = this.u[i] * Vt;
      this.n[i] = ni * Math.exp(this.u[i]);
      this.p[i] = ni * Math.exp(-this.u[i]);
    }
  }

  calculateCarrierTransport() {
    const Vt = this.env.Vt;
    const q = PHYSICAL_CONSTANTS.q;
    const Dn = this.env.un * Vt;
    const Dp = this.env.up * Vt;
    
    let totalJn = 0.0;
    let totalJp = 0.0;

    for (let i = 0; i < this.nodeCount - 1; i++) {
      const du = this.u[i + 1] - this.u[i];
      const B_pos = bernoulli(du);
      const B_neg = bernoulli(-du);

      // Scharfetter-Gummel normalized flux formulation
      const Jn_node = (q * Dn / this.dx) * (this.n[i + 1] * B_pos - this.n[i] * B_neg);
      const Jp_node = (q * Dp / this.dx) * (this.p[i] * B_pos - this.p[i + 1] * B_neg);

      totalJn += Jn_node;
      totalJp += Jp_node;
    }

    const avgJn = totalJn / (this.nodeCount - 1);
    const avgJp = totalJp / (this.nodeCount - 1);
    
    let Jn_mA = avgJn * 1000.0;
    let Jp_mA = avgJp * 1000.0;
    let Jtotal_mA = (avgJn + avgJp) * 1000.0;

    if (Math.abs(Jn_mA) < 1e-9) Jn_mA = 0.0;
    if (Math.abs(Jp_mA) < 1e-9) Jp_mA = 0.0;
    if (Math.abs(Jtotal_mA) < 1e-9) Jtotal_mA = 0.0;

    return {
      Jn_mA: parseFloat(Jn_mA.toFixed(6)),
      Jp_mA: parseFloat(Jp_mA.toFixed(6)),
      Jtotal_mA: parseFloat(Jtotal_mA.toFixed(6))
    };
  }
}