import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const architecture_id = body.architecture_id || 1;
    const origin = request.headers.get('origin') || 'http://localhost:3005';

    const testScenarios = [
      { scenario: "Standard STC (25°C, Clean Air)", temp: 25, rad: 0, hum: 45 },
      { scenario: "Desert Thermal Stress (75°C, Low Humidity)", temp: 75, rad: 0, hum: 15 },
      { scenario: "Tropical Extreme (85°C, High Moisture 90% RH)", temp: 85, rad: 0, hum: 90 },
      { scenario: "Orbital Space Environment (-40°C, 25,000 Rads)", temp: -40, rad: 25000, hum: 0 }
    ];

    const results = [];

    for (const scenario of testScenarios) {
      const res = await fetch(`${origin}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architecture_id: architecture_id,
          operating_temp_c: scenario.temp,
          radiation_flux_rads: scenario.rad,
          relative_humidity_pct: scenario.hum
        })
      });

      const data = await res.json();
      if (data.success) {
        results.push({
          scenario: scenario.scenario,
          simulation_id: data.simulation_id,
          pce_efficiency_pct: data.physics_output.efficiency_pce_pct,
          voc_v: data.physics_output.open_circuit_voltage_v,
          jsc_ma_cm2: data.physics_output.short_circuit_current_ma_cm2,
          fill_factor_pct: data.physics_output.fill_factor_pct,
          status: data.system_status
        });
      }
    }

    return NextResponse.json({
      success: true,
      architecture_id: architecture_id,
      batch_test_results: results
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
