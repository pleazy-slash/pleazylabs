import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM solar_architectures ORDER BY id ASC;');
    return NextResponse.json({ success: true, experiments: result.rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { project_name, topology_type, total_area_cm2, target_efficiency_pct } = body;

    const result = await pool.query(
      `INSERT INTO solar_architectures (project_name, topology_type, total_area_cm2, target_efficiency_pct)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [project_name, topology_type || 'Custom Experimental', total_area_cm2 || 156.25, target_efficiency_pct || 25.0]
    );

    return NextResponse.json({ success: true, experiment: result.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
