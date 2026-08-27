import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { base_material_id, dopant_material_id, dopant_ratio = 0.1, custom_name } = body;

    if (!base_material_id || !dopant_material_id) {
      return NextResponse.json({ success: false, error: 'Base and dopant IDs are required.' }, { status: 400 });
    }

    const query = `SELECT * FROM materials_catalog WHERE id IN ($1, $2);`;
    const { rows } = await pool.query(query, [base_material_id, dopant_material_id]);

    if (rows.length < 2) {
      return NextResponse.json({ success: false, error: 'Materials not found.' }, { status: 404 });
    }

    const base = rows.find(r => r.id === Number(base_material_id));
    const dopant = rows.find(r => r.id === Number(dopant_material_id));

    const x = Math.max(0, Math.min(1, Number(dopant_ratio)));
    const synthEg = (base.bandgap_ev * (1 - x)) + (dopant.bandgap_ev * x);
    const synthWF = (base.work_function_ev * (1 - x)) + (dopant.work_function_ev * x);
    const synthName = custom_name || `${base.name} (${((1 - x) * 100).toFixed(0)}%) / ${dopant.name} (${(x * 100).toFixed(0)}%)`;

    const insertQuery = `
      INSERT INTO materials_catalog 
      (name, category, bandgap_ev, work_function_ev, perceived_hex_color, radiation_hardness_score)
      VALUES ($1, 'synthetic_alloy', $2, $3, '#D4AF37', 0.90)
      RETURNING *;
    `;
    const inserted = await pool.query(insertQuery, [synthName, synthEg.toFixed(3), synthWF.toFixed(3)]);

    return NextResponse.json({
      success: true,
      synthesized_material: inserted.rows[0]
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
