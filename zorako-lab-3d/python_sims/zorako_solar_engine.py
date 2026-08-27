import math
import json

class ZorakoSolarCellEngine:
    def __init__(self, cell_area_cm2=156.25, base_efficiency=0.22, temp_coeff_pmax=-0.0035):
        # Primary Physics Parameters
        self.area_m2 = cell_area_cm2 / 10000.0   # Convert cm² to m²
        self.eta_ref = base_efficiency           # Reference efficiency (e.g., 22%)
        self.gamma = temp_coeff_pmax             # Power temperature coefficient (%/°C)
        self.t_ref = 25.0                        # Standard Test Condition (STC) Temp in °C
        
        # Electrical Joint Specifications
        self.v_mp_stc = 0.60    # Maximum power voltage per cell (Volts)
        self.i_mp_stc = 9.0     # Maximum power current per cell (Amps)

    def calculate_cell_output(self, irradiance_w_m2=1000.0, cell_temp_c=25.0):
        """
        Calculates exact I-V and P-V curve parameters considering thermal degradation.
        """
        if irradiance_w_m2 <= 0:
            return {"power_watts": 0.0, "current_amps": 0.0, "voltage_volts": 0.0, "efficiency": 0.0}

        # Temperature Correction Factor
        temp_delta = cell_temp_c - self.t_ref
        thermal_degradation = 1.0 + (self.gamma * temp_delta)
        
        # Effective Efficiency under real conditions
        effective_efficiency = self.eta_ref * thermal_degradation * (irradiance_w_m2 / 1000.0)
        
        # Power output calculation: P = Irradiance * Area * Efficiency
        power_watts = irradiance_w_m2 * self.area_m2 * (self.eta_ref * thermal_degradation)
        
        # Scaled V_mp and I_mp
        v_mp = self.v_mp_stc * (1.0 - 0.003 * temp_delta)
        i_mp = max(0.0, power_watts / max(0.001, v_mp))

        return {
            "irradiance_w_m2": irradiance_w_m2,
            "cell_temp_c": cell_temp_c,
            "power_watts": round(power_watts, 3),
            "voltage_vmp": round(v_mp, 3),
            "current_imp": round(i_mp, 3),
            "effective_efficiency_pct": round(effective_efficiency * 100, 2)
        }

class ZorakoInverterEngine:
    def __init__(self, nominal_power_kw=5.0, peak_efficiency=0.98):
        self.p_nom = nominal_power_kw * 1000.0
        self.eta_max = peak_efficiency

    def convert_dc_to_ac(self, dc_power_watts, ambient_temp_c=30.0):
        """
        Simulates MPPT tracking and DC-to-AC conversion loss.
        """
        if dc_power_watts <= 0:
            return {"ac_power_watts": 0.0, "efficiency_pct": 0.0, "heat_loss_watts": 0.0}

        # Load ratio
        load_ratio = min(1.2, dc_power_watts / self.p_nom)
        
        # Efficiency curve approximation (low load = lower efficiency)
        if load_ratio < 0.1:
            efficiency = self.eta_max * (load_ratio / 0.1) * 0.85
        else:
            efficiency = self.eta_max - (0.02 * (load_ratio - 0.7)**2)

        ac_power = dc_power_watts * efficiency
        heat_loss = dc_power_watts - ac_power

        return {
            "dc_input_watts": round(dc_power_watts, 2),
            "ac_output_watts": round(ac_power, 2),
            "conversion_efficiency_pct": round(efficiency * 100, 2),
            "heat_dissipation_watts": round(heat_loss, 2)
        }

if __name__ == "__main__":
    # Assemble a 60-cell Solar Module Matrix
    cell_engine = ZorakoSolarCellEngine(cell_area_cm2=156.25, base_efficiency=0.23)
    inverter_engine = ZorakoInverterEngine(nominal_power_kw=3.0)

    # Simulate realistic operating conditions (High Sun, High Heat: 1000 W/m², 50°C cell temp)
    single_cell_data = cell_engine.calculate_cell_output(irradiance_w_m2=1000.0, cell_temp_c=50.0)
    
    # 60 Cells connected in series
    panel_array_dc_power = single_cell_data["power_watts"] * 60 * 10  # 10 panels
    inverter_data = inverter_engine.convert_dc_to_ac(panel_array_dc_power, ambient_temp_c=35.0)

    result = {
        "zorako_cell_single": single_cell_data,
        "zorako_array_10_panels_dc_watts": round(panel_array_dc_power, 2),
        "zorako_inverter_ac_output": inverter_data
    }

    print(json.dumps(result, indent=2))
