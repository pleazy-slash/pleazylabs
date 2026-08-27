import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    database: 'zorako_db',
    port: 5432
});

// GET /api/architectures - Fetch all saved cell architectures
export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM solar_architectures ORDER BY created_at DESC;');
        return NextResponse.json(result.rows);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/architectures - Save new architecture with layer stack
export async function POST(request) {
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { project_name, topology_type, total_area_cm2, busbar_count, layers } = body;

        await client.query('BEGIN');

        const archRes = await client.query(
            `INSERT INTO solar_architectures (project_name, topology_type, total_area_cm2, busbar_count) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [project_name, topology_type || 'tandem_2t', total_area_cm2 || 156.25, busbar_count || 16]
        );
        const archId = archRes.rows[0].id;

        if (layers && Array.isArray(layers)) {
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                await client.query(
                    `INSERT INTO architecture_layers (architecture_id, layer_position, layer_name, material_id, thickness_nm, doping_type)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [archId, i + 1, layer.layer_name, layer.material_id, layer.thickness_nm, layer.doping_type || 'intrinsic']
                );
            }
        }

        await client.query('COMMIT');
        return NextResponse.json({ id: archId, status: "SUCCESS" });
    } catch (err) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}
