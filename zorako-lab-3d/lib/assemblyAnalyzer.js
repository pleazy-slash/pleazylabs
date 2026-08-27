/**
 * Zorako Assembly Inspector & Missing Component Detector
 */

export const PART_CATALOG = [
  { id: "pv_cell_mono", name: "Monocrystalline Silicon Cell", category: "Solar", powerOutput: "5.5W", stressLimitTemp: 85 },
  { id: "eva_encapsulant", name: "EVA Encapsulant Film", category: "Protection", UVResistance: "High", moistureBarrier: "Medium" },
  { id: "tempered_glass", name: "3.2mm Low-Iron Tempered Glass", category: "Optics", transmittance: 0.94, impactRating: "IK08" },
  { id: "bypass_diode", name: "15A Schottky Bypass Diode", category: "Electronics", maxReverseVoltage: "45V" },
  { id: "alu_frame", name: "Anodized Aluminum Frame", category: "Structure", yieldStrength: "200 MPa" }
];

export function validateAssembly(componentsList = []) {
  const missingComponents = [];
  const warnings = [];

  const hasSolarCells = componentsList.some(c => c.type === "pv_cell_mono");
  const hasGlass = componentsList.some(c => c.type === "tempered_glass");
  const hasDiode = componentsList.some(c => c.type === "bypass_diode");
  const hasEncapsulant = componentsList.some(c => c.type === "eva_encapsulant");

  if (hasSolarCells && !hasGlass) {
    missingComponents.push({
      component: "Tempered Glass Cover",
      impact: "High Vulnerability",
      reason: "Solar cells exposed to mechanical impact and weather without protective glass."
    });
  }

  if (hasSolarCells && !hasEncapsulant) {
    missingComponents.push({
      component: "EVA Encapsulant Layer",
      impact: "Corrosion & Delamination",
      reason: "Moisture will directly penetrate silicon contacts without polymeric encapsulation."
    });
  }

  if (hasSolarCells && !hasDiode) {
    warnings.push({
      issue: "Missing Bypass Diode",
      risk: "Hotspot Formation",
      explanation: "Partial shading will cause shaded cells to act as loads, generating localized heat and potential burning."
    });
  }

  return {
    isComplete: missingComponents.length === 0,
    missingComponents,
    warnings,
    assemblyIntegrityScore: Math.max(0, 100 - (missingComponents.length * 30) - (warnings.length * 15))
  };
}

export function searchAndExtractPart(searchTerm) {
  const results = PART_CATALOG.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    foundCount: results.length,
    parts: results.map(p => ({
      ...p,
      clonable: true,
      extractable: true
    }))
  };
}
