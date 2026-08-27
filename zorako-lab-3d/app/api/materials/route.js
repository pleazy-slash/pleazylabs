import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM materials_catalog ORDER BY category, name ASC;');
    return NextResponse.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      bandgap_ev,
      refractive_index_n,
      manufacturing_method,
      oxidation_states,
      work_function_ev,
      reduction_potential_v,
      electrical_resistivity_ohm_m
    } = body;

    if (!name || !category) {
      return NextResponse.json({ success: false, error: 'Name and Category are required.' }, { status: 400 });
    }

    const query = `
      INSERT INTO materials_catalog (
        name, category, bandgap_ev, refractive_index_n, manufacturing_method,
        oxidation_states, work_function_ev, reduction_potential_v, electrical_resistivity_ohm_m
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      name, category, bandgap_ev || 0.0, refractive_index_n || 1.0, manufacturing_method || 'Custom',
      oxidation_states || '0', work_function_ev || null, reduction_potential_v || null, electrical_resistivity_ohm_m || null
    ];

    const result = await pool.query(query, values);
    return NextResponse.json({ success: true, material: result.rows[0] }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
