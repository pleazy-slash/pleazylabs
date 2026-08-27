import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const simIdParam = searchParams.get('simulation_id');

    let reportQuery = `
      SELECT 
        es.*, 
        lp.lab_name, lp.brand_tagline, lp.primary_color,
        sa.project_name as architecture_name, sa.topology_type
      FROM experimental_simulations es
      LEFT JOIN lab_profiles lp ON es.lab_id = lp.id
      LEFT JOIN solar_architectures sa ON es.architecture_id = sa.id
    `;
    
    let queryParams = [];
    if (simIdParam) {
      reportQuery += ` WHERE es.id = $1;`;
      queryParams.push(simIdParam);
    } else {
      reportQuery += ` ORDER BY es.created_at DESC LIMIT 1;`;
    }

    const { rows } = await pool.query(reportQuery, queryParams);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No simulation reports available.' }, { status: 404 });
    }

    const report = rows[0];

    const layersQuery = `
      SELECT al.*, mc.name as material_name, mc.work_function_ev, mc.manufacturing_method
      FROM architecture_layers al
      JOIN materials_catalog mc ON al.material_id = mc.id
      WHERE al.architecture_id = $1
      ORDER BY al.layer_position ASC;
    `;
    const layersResult = await pool.query(layersQuery, [report.architecture_id]);

    return NextResponse.json({
      success: true,
      branding: {
        institution: report.lab_name,
        tagline: report.brand_tagline,
        accent_color: report.primary_color
      },
      experiment_metadata: {
        simulation_id: report.id,
        project_name: report.architecture_name,
        topology: report.topology_type,
        timestamp: report.created_at
      },
      performance_metrics: {
        open_circuit_voltage_v: Number(report.voc_volts),
        short_circuit_current_ma_cm2: Number(report.jsc_ma_cm2),
        fill_factor_percent: Number(report.fill_factor_pct),
        efficiency_pce_percent: Number(report.calculated_pce_pct)
      },
      layer_stack_configuration: layersResult.rows
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
