/**
 * ZORAKO DYNAMIC MICRO-LAYER & COMPONENT ENGINE
 * Multi-layer stacking, Equivalent Series Resistance (ESR), 
 * and Time-Series Thermal Degradation Solvers.
 */

export class MaterialLayer {
  constructor(config) {
    this.name = config.name;
    this.thickness_um = config.thickness_um;          // Thickness in microns
    this.permittivity = config.permittivity || 1.0;    // Relative permittivity (k)
    this.conductivity = config.conductivity || 1e-12; // Thermal/Electrical conductivity
    this.specificHeat = config.specificHeat || 900;   // J/(kg·K)
    this.density = config.density || 2330;             // kg/m^3
    this.maxTempCelsius = config.maxTempCelsius || 125;// Thermal breakdown limit
    this.resistivity_ohm_m = config.resistivity_ohm_m || 1e-5;
  }
}

export class ComponentStack {
  constructor(name, type) {
    this.name = name;
    this.type = type; // "Capacitor", "SolarPanel", "Conductor", "Inductor"
    this.layers = [];
    this.area_cm2 = 1.0;
  }

  addLayer(layer) {
    this.layers.push(layer);
  }

  /**
   * Calculates total Equivalent Series Resistance (ESR) across layer stack
   */
  calculateStackESR() {
    let totalESR = 0;
    const area_m2 = this.area_cm2 * 1e-4;

    for (const layer of this.layers) {
      const thickness_m = layer.thickness_um * 1e-6;
      const resistance = (layer.resistivity_ohm_m * thickness_m) / area_m2;
      totalESR += resistance;
    }
    return totalESR;
  }

  /**
   * Calculates Total Thermal Mass (J/K) for the component
   */
  calculateThermalMass() {
    let totalMass_kg = 0;
    let totalHeatCapacity = 0;
    const area_m2 = this.area_cm2 * 1e-4;

    for (const layer of this.layers) {
      const volume_m3 = area_m2 * (layer.thickness_um * 1e-6);
      const mass_kg = volume_m3 * layer.density;
      totalMass_kg += mass_kg;
      totalHeatCapacity += mass_kg * layer.specificHeat;
    }
    return { totalMass_kg, totalHeatCapacity };
  }
}

export class TimeSeriesThermalSolver {
  /**
   * Simulates continuous operational hours and tracks temperature, ESR, and failure state.
   */
  static simulateOperationalHours(component, current_A, durationHours, ambientTempC = 25.0) {
    const esr = component.calculateStackESR();
    const { totalHeatCapacity } = component.calculateThermalMass();
    
    // Dissipated Power P = I^2 * R (Joule Heating)
    const powerLoss_Watts = Math.pow(current_A, 2) * esr;
    
    // Dissipation coefficient (h * Area) in W/K
    const heatDissipationRate = 0.015 * (component.area_cm2 * 1e-4); 

    let currentTempC = ambientTempC;
    const totalSeconds = durationHours * 3600;
    const dt = 1.0; // 1-second time step integration
    
    let failureOccurred = false;
    let failureTimeHours = 0;
    let maxLayerLimit = 125.0;

    for (const layer of component.layers) {
      if (layer.maxTempCelsius < maxLayerLimit) {
        maxLayerLimit = layer.maxTempCelsius;
      }
    }

    for (let t = 0; t < totalSeconds; t += dt) {
      // Net heat power = Heat Generated - Heat Dissipated
      const heatIn = powerLoss_Watts;
      const heatOut = heatDissipationRate * (currentTempC - ambientTempC);
      const netPower = heatIn - heatOut;

      // dT = (P_net * dt) / HeatCapacity
      const deltaT = (netPower * dt) / Math.max(totalHeatCapacity, 1e-6);
      currentTempC += deltaT;

      if (currentTempC >= maxLayerLimit) {
        failureOccurred = true;
        failureTimeHours = parseFloat((t / 3600).toFixed(2));
        break;
      }
    }

    return {
      componentName: component.name,
      testDurationHours: durationHours,
      operatingCurrent_A: current_A,
      calculatedESR_Ohm: parseFloat(esr.toExponential(4)),
      powerLoss_Watts: parseFloat(powerLoss_Watts.toFixed(4)),
      finalTemperatureC: parseFloat(currentTempC.toFixed(2)),
      maxAllowedTempC: maxLayerLimit,
      isThermalRunaway: failureOccurred,
      failureHour: failureOccurred ? failureTimeHours : "N/A (Passed)"
    };
  }
}
