import { DynamicEnvironment, SemiconductorDevice1D } from "./zorako-engine.js";

console.log("=================================================");
console.log(" ZORAKO DYNAMIC ENVIRONMENTAL SWEEP TEST ");
console.log("=================================================\n");

const temps = [25.0, 75.0]; // Compare 25°C vs 75°C
const biasVoltages = [0.0, 0.4, 0.6]; // Sweep applied bias (V)

for (const tempC of temps) {
  console.log(`\n-------------------------------------------------`);
  console.log(` [TEST CONDITION] Operating Temperature: ${tempC}°C`);
  console.log(`-------------------------------------------------`);
  
  const env = new DynamicEnvironment(tempC, 1000.0);
  console.log(`  -> Thermal Voltage (Vt): ${(env.Vt * 1000).toFixed(2)} mV`);
  console.log(`  -> Intrinsic Density (ni): ${env.ni.toExponential(3)} cm⁻³`);
  console.log(`  -> Electron Mobility (un): ${env.un.toFixed(1)} cm²/V·s`);

  for (const bias of biasVoltages) {
    const dev = new SemiconductorDevice1D(10, 200, 1e19, 1e16, 2.0, env);
    dev.solvePoisson(bias);
    const flux = dev.calculateCarrierTransport();
    const v_bi = dev.psi[0] - dev.psi[dev.nodeCount - 1];
    
    console.log(`  * Bias: ${bias.toFixed(1)}V | V_bi Barrier: ${v_bi.toFixed(4)}V | Net Transport: ${flux.Jtotal_mA} mA/cm²`);
  }
}

console.log("\n=================================================");
console.log(" DYNAMIC SWEEP COMPLETE ");
console.log("=================================================");
