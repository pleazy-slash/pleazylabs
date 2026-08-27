import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const archId = searchParams.get('architecture_id') || 1;

    // Fetch Architecture Profile
    const archQuery = `SELECT * FROM solar_architectures WHERE id = $1;`;
    const archRes = await pool.query(archQuery, [archId]);

    if (archRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Architecture not found.' }, { status: 404 });
    }

    // Fetch Stack Layers and Physical Color Scheme Mappings
    const layersQuery = `
      SELECT al.id, al.layer_position, al.layer_name, al.thickness_nm,
             mc.name as material_name, mc.category, mc.bandgap_ev, mc.work_function_ev,
             mc.refractive_index_n, mc.electrical_resistivity_ohm_m, mc.oxidation_states
      FROM architecture_layers al
      JOIN materials_catalog mc ON al.material_id = mc.id
      WHERE al.architecture_id = $1
      ORDER BY al.layer_position ASC;
    `;
    const layersRes = await pool.query(layersQuery, [archId]);

    // Color Palette Mapping for Visualizing Layers
    const categoryColors = {
      metal_contact: '#C0C0C0',
      grid_contact: '#E5E4E2',
      tco: '#38BDF8',
      anti_reflective: '#818CF8',
      semiconductor: '#F59E0B',
      encapsulant: '#34D399',
      substrate: '#94A3B8'
    };

    // Build Visual CAD Schematics Structure
    let accumulatedDepth = 0;
    const visualLayers = layersRes.rows.map(layer => {
      const thickness = Number(layer.thickness_nm) || 100;
      // Visual height scaling (logarithmic factor so thin 80nm TCO and thick 180,000nm Silicon are both visible)
      const visualScaleHeight = Math.round(Math.max(20, Math.min(120, Math.log10(thickness) * 22)));
      const startDepth = accumulatedDepth;
      accumulatedDepth += visualScaleHeight;

      return {
        layer_id: layer.id,
        position: layer.layer_position,
        label: layer.layer_name,
        material: layer.material_name,
        category: layer.category,
        actual_thickness_nm: thickness,
        bandgap_ev: layer.bandgap_ev ? Number(layer.bandgap_ev) : null,
        work_function_ev: layer.work_function_ev ? Number(layer.work_function_ev) : null,
        render_properties: {
          hex_color: categoryColors[layer.category] || '#6B7280',
          visual_height_px: visualScaleHeight,
          y_offset_start: startDepth,
          y_offset_end: accumulatedDepth,
          opacity: layer.category === 'encapsulant' || layer.category === 'tco' ? 0.75 : 1.0
        }
      };
    });

    return NextResponse.json({
      success: true,
      architecture: archRes.rows[0],
      total_stack_layers: visualLayers.length,
      total_visual_canvas_height_px: accumulatedDepth,
      visual_stack: visualLayers
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
