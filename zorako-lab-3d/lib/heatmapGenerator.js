/**
 * Zorako WebGL / Three.js Spatial Heatmap Buffer Generator
 * Converts 3D spatial node data into normalized Float32 arrays for vertex color shaders.
 */

export function generateShaderHeatmapBuffer(num_nodes = 100, peak_intensity = 0.85) {
  const colorBuffer = [];
  
  for (let i = 0; i < num_nodes; i++) {
    const normalized_pos = i / num_nodes;
    // Gaussian intensity distribution across 3D component body
    const intensity = Math.exp(-Math.pow((normalized_pos - 0.5) / 0.2, 2)) * peak_intensity;

    // RGB Heatmap mapping (Blue -> Green -> Yellow -> Red)
    const r = Math.min(1.0, Math.max(0.0, 2 * intensity - 0.5));
    const g = Math.min(1.0, Math.max(0.0, 1.0 - Math.abs(2 * intensity - 1)));
    const b = Math.min(1.0, Math.max(0.0, 1.0 - 2 * intensity));

    colorBuffer.push(Number(r.toFixed(3)), Number(g.toFixed(3)), Number(b.toFixed(3)));
  }

  return {
    vertex_count: num_nodes,
    rgb_buffer_length: colorBuffer.length,
    shader_attribute_array: colorBuffer
  };
}
