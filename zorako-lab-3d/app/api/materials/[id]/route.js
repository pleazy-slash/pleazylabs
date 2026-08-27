import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET single material details
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await pool.query('SELECT * FROM materials_catalog WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, material: result.rows[0] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Update physical parameters of a material
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(body)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields provided to update' }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE materials_catalog SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *;`;
    
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, material: result.rows[0] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE material
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await pool.query('DELETE FROM materials_catalog WHERE id = $1 RETURNING id;', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted_id: id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
