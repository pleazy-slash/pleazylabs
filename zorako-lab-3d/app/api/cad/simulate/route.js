import { NextResponse } from 'next/server';
import { simulateAdvancedComponent } from '../../../../lib/mechanicalEngine';
import { runDiscretizedFEA } from '../../../../lib/feaDiscretizer';
import { simulateDMLSProcess } from '../../../../lib/dmlsPhysics';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const wire_diameter_mm = parseFloat(body.wire_diameter_mm) || 2.5;
    const coil_diameter_mm = parseFloat(body.coil_diameter_mm) || 22.0;
    const active_coils = parseInt(body.active_coils) || 8;
    const applied_force_n = parseFloat(body.applied_force_n) || 75.0;
    const operating_temp_c = parseFloat(body.operating_temp_c) || 120.0;
    const print_orientation = body.print_orientation || 'z_axis_loaded';

    // 1. Lumped Analytical Physics
    const mechanicalResults = simulateAdvancedComponent({
      wire_diameter_mm,
      coil_diameter_mm,
      active_coils,
      applied_force_n,
      operating_temp_c,
      print_orientation
    });

    // 2. Spatial Discretization FEA
    const feaResults = runDiscretizedFEA({
      wire_diameter_mm,
      coil_diameter_mm,
      active_coils,
      applied_force_n,
      shear_modulus_gpa: mechanicalResults.thermal_degraded_shear_modulus_gpa,
      num_elements: 60
    });

    // 3. Additive Manufacturing Melt Physics
    const dmlsResults = simulateDMLSProcess({
      laser_power_watts: body.laser_power_watts || 190,
      scan_speed_mm_s: body.scan_speed_mm_s || 750
    });

    return NextResponse.json({
      success: true,
      simulation_engine: "Zorako High-Fidelity Spatial FEA & Melt-Pool Core v3.0",
      mechanical_physics: mechanicalResults,
      spatial_fea_discretization: feaResults,
      additive_process_physics: dmlsResults
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
