import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { simulation_id, format = 'csv' } = body;

    const query = `
      SELECT es.*, sa.project_name as architecture_name, sa.topology_type
      FROM experimental_simulations es
      JOIN solar_architectures sa ON es.architecture_id = sa.id
      WHERE es.id = $1;
    `;
    const { rows } = await pool.query(query, [simulation_id || 15]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Simulation record not found.' }, { status: 404 });
    }

    const sim = rows[0];

    if (format === 'csv') {
      const csvHeader = "Simulation ID,Project Name,Topology,Voc (V),Jsc (mA/cm2),Fill Factor (%),PCE Efficiency (%)\n";
      const csvRow = `${sim.id},"${sim.project_name}","${sim.topology_type}",${sim.voc_volts},${sim.jsc_ma_cm2},${sim.fill_factor_pct},${sim.calculated_pce_pct}\n`;
      
      return new Response(csvHeader + csvRow, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="zorako_lab_sim_${sim.id}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      export_summary: {
        simulation_id: sim.id,
        project_name: sim.project_name,
        metrics: {
          voc_v: sim.voc_volts,
          jsc_ma_cm2: sim.jsc_ma_cm2,
          fill_factor_pct: sim.fill_factor_pct,
          pce_pct: sim.calculated_pce_pct
        }
      }
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
