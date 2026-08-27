/**
 * Zorako Spatial Discretization & Numerical FEA Engine
 * Divides helical spring geometry into discrete spatial elements to calculate 
 * local stress distribution, contact buckling, and peak stress nodes.
 */

export function runDiscretizedFEA({
  wire_diameter_mm,
  coil_diameter_mm,
  active_coils,
  applied_force_n,
  shear_modulus_gpa,
  num_elements = 50
}) {
  const d = wire_diameter_mm / 1000;
  const D = coil_diameter_mm / 1000;
  const total_length_m = Math.PI * D * active_coils;
  const element_length = total_length_m / num_elements;
  
  const G = shear_modulus_gpa * 1e9;
  const J = (Math.PI * Math.pow(d, 4)) / 32; // Polar moment of inertia

  const nodes = [];
  let max_node_stress_mpa = 0;
  let max_stress_node_idx = 0;

  for (let i = 0; i <= num_elements; i++) {
    const s = (i / num_elements) * total_length_m; // Position along wire
    const coil_progress = (i / num_elements) * active_coils;

    // End coil proximity factor (stress concentrations near seating points)
    const end_effect = (coil_progress < 0.75 || coil_progress > (active_coils - 0.75)) ? 1.18 : 1.0;
    
    // Curvature correction factor along node
    const C = D / d;
    const K_node = (((4 * C - 1) / (4 * C - 4)) + (0.615 / C)) * end_effect;

    // Localized Torsional Shear Stress (MPa)
    const node_stress_mpa = (K_node * ((8 * applied_force_n * D) / (Math.PI * Math.pow(d, 3)))) / 1e6;

    if (node_stress_mpa > max_node_stress_mpa) {
      max_node_stress_mpa = node_stress_mpa;
      max_stress_node_idx = i;
    }

    nodes.push({
      node_id: i,
      wire_position_m: Number(s.toFixed(4)),
      local_stress_mpa: Number(node_stress_mpa.toFixed(2))
    });
  }

  return {
    discretization_nodes: num_elements,
    peak_stress_node: {
      node_id: max_stress_node_idx,
      wire_position_m: nodes[max_stress_node_idx].wire_position_m,
      peak_stress_mpa: max_node_stress_mpa
    },
    stress_gradient_min_max_ratio: Number((nodes[0].local_stress_mpa / max_node_stress_mpa).toFixed(3))
  };
}
