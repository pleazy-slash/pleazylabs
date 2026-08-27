import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { architecture_id, material_id, layer_name, thickness_nm, layer_position } = body;

    if (!architecture_id || !material_id || !layer_name || !thickness_nm) {
      return NextResponse.json({ success: false, error: 'Missing required layer parameters.' }, { status: 400 });
    }

    const position = layer_position || 1;

    // Shift existing layers down if inserting at an existing position
    await pool.query(`
      UPDATE architecture_layers 
      SET layer_position = layer_position + 1 
      WHERE architecture_id = $1 AND layer_position >= $2;
    `, [architecture_id, position]);

    // Insert new layer
    const insertQuery = `
      INSERT INTO architecture_layers (architecture_id, material_id, layer_name, thickness_nm, layer_position)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const res = await pool.query(insertQuery, [architecture_id, material_id, layer_name, thickness_nm, position]);

    return NextResponse.json({
      success: true,
      inserted_layer: res.rows[0]
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
