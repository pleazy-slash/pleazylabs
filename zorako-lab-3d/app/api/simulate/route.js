import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { solveMultiPhysicsStack } from '../../../lib/physicsEngine';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const architecture_id = body.architecture_id || 1;
    const temp_c = body.operating_temp_c ?? 25.0;
    const irradiance = body.incident_irradiance_w_m2 || 1000;
    const humidity = body.relative_humidity_pct || 45.0;

    // Fetch layers with advanced optical/thermal constants
    const layersQuery = `
      SELECT al.*, mc.bandgap_ev, mc.work_function_ev, mc.category, mc.name as material_name,
             mc.temp_coeff_voc_pct_k, mc.refractive_index_n, mc.extinction_coeff_k, mc.thermal_conductivity_w_mk
      FROM architecture_layers al
      JOIN materials_catalog mc ON al.material_id = mc.id
      WHERE al.architecture_id = $1
      ORDER BY al.layer_position ASC;
    `;
    const { rows: layers } = await pool.query(layersQuery, [architecture_id]);

    if (layers.length === 0) {
      return NextResponse.json({ success: false, error: 'No layers found for this architecture.' }, { status: 400 });
    }

    // Fetch interfacial media/lubricant configurations
    const interfacesQuery = `
      SELECT li.*, im.name as media_name, im.refractive_index_n as media_refractive_index
      FROM layer_interfaces li
      JOIN interfacial_media im ON li.interfacial_media_id = im.id
      WHERE li.architecture_id = $1;
    `;
    const { rows: interfaces } = await pool.query(interfacesQuery, [architecture_id]);

    // Execute Physics Solver
    const simResult = solveMultiPhysicsStack(layers, interfaces, {
      temp_c,
      irradiance_w_m2: irradiance,
      relative_humidity_pct: humidity
    });

    return NextResponse.json({
      success: true,
      architecture_id,
      physics_output: simResult.metrics,
      diagnostics: simResult.diagnostics
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
