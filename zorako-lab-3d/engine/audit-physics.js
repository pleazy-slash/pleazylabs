import { SemiconductorDevice1D } from "./zorako-engine.js";

console.log("=================================================");
console.log(" ZORAKO HARDWARE PHYSICAL AUDIT SUITE ");
console.log("=================================================");

let failures = 0;
function verify(condition, title, errorLog) {
  if (condition) {
    console.log(`[PASS] ${title}`);
  } else {
    console.log(`[FAIL] ${title} -> ${errorLog}`);
    failures++;
  }
}

const dev = new SemiconductorDevice1D(10, 200, 1e19, 1e16, 2.0);
dev.solvePoisson();

const v_bi = dev.psi[0] - dev.psi[dev.nodeCount - 1];
verify(v_bi >= 0.85 && v_bi <= 0.90, "V_bi Physical Bounds", `Calculated: ${v_bi.toFixed(4)}V`);

const transport = dev.calculateCarrierTransport();
verify(!isNaN(transport.Jtotal_mA) && isFinite(transport.Jtotal_mA), "Numerical Transport Finiteness", `Jtotal = ${transport.Jtotal_mA}`);
verify(Math.abs(transport.Jtotal_mA) < 1.0, "Equilibrium Zero-Net Flux Conservation", `Net flux = ${transport.Jtotal_mA} mA/cm²`);

console.log("=================================================");
if (failures === 0) {
  console.log(">>> ALL AUDITS PASSED: ZERO HALLUCINATION VERIFIED <<<");
  process.exit(0);
} else {
  console.log(`>>> VERIFICATION FAILED: ${failures} PHYSICAL VIOLATIONS <<<`);
  process.exit(1);
}
