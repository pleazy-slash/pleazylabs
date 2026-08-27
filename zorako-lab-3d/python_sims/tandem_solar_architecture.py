import math
import json

class PerovskiteSiliconTandemCell:
    def __init__(self, 
                 top_eg_ev=1.75,      # Perovskite Bandgap (eV)
                 bottom_eg_ev=1.12,   # Silicon Bandgap (eV)
                 area_cm2=156.25,
                 top_thickness_nm=350,
                 bottom_thickness_um=180):
        
        self.q = 1.602176634e-19
        self.k = 1.380649e-23
        self.area_m2 = area_cm2 / 10000.0
        
        # Bandgaps
        self.Eg_top = top_eg_ev
        self.Eg_bottom = bottom_eg_ev
        
        # Parasitics
        self.Rs_total = 0.003  # Low internal series resistance
        self.Rsh_total = 1200.0 # High shunt resistance to prevent current leakage

    def simulate_spectrum_absorption(self, irradiance_w_m2, cell_temp_c):
        """
        Simulates top and bottom cell photocurrent generation based on bandgap absorption.
        """
        T_k = cell_temp_c + 273.15
        dT = cell_temp_c - 25.0
        
        # Top Cell (Perovskite) absorbs high-energy photons (UV/Visible)
        top_photocurrent_density = (irradiance_w_m2 / 1000.0) * 0.021 # A/cm2
        top_Iph = top_photocurrent_density * (self.area_m2 * 10000.0)
        
        # Bottom Cell (Silicon) absorbs remaining low-energy photons (Infrared)
        bottom_photocurrent_density = (irradiance_w_m2 / 1000.0) * 0.019 # A/cm2
        bottom_Iph = bottom_photocurrent_density * (self.area_m2 * 10000.0)
        
        # In a 2-terminal series-connected tandem cell, current is limited by the lower sub-cell
        matched_Iph = min(top_Iph, bottom_Iph)
        
        # Open Circuit Voltages add up in series connection
        # Voc ~ (Eg / q) minus thermal recombination losses
        Voc_top = (self.Eg_top * 0.72) - (0.0018 * dT)
        Voc_bottom = (self.Eg_bottom * 0.62) - (0.0022 * dT)
        
        Voc_tandem = Voc_top + Voc_bottom
        
        return matched_Iph, Voc_tandem, Voc_top, Voc_bottom, T_k

    def calculate_tandem_performance(self, irradiance_w_m2=1000.0, cell_temp_c=25.0):
        Iph, Voc, Voc_top, Voc_bottom, T_k = self.simulate_spectrum_absorption(irradiance_w_m2, cell_temp_c)
        
        # Fill Factor for tandem architecture
        FF = 0.82 - (0.0004 * (cell_temp_c - 25.0))
        
        # Max Power Point Calculation
        max_power = Voc * Iph * FF
        Vmp = Voc * 0.85
        Imp = max_power / max(0.001, Vmp)
        
        pin_watts = irradiance_w_m2 * self.area_m2
        efficiency = (max_power / max(0.001, pin_watts)) * 100.0
        
        return {
            "cell_architecture": "2-Terminal Perovskite-on-Silicon Tandem",
            "operating_conditions": {
                "irradiance_w_m2": irradiance_w_m2,
                "cell_temperature_c": cell_temp_c
            },
            "subcell_voltage_breakdown": {
                "perovskite_top_Voc_V": round(Voc_top, 4),
                "silicon_bottom_Voc_V": round(Voc_bottom, 4),
                "total_tandem_Voc_V": round(Voc, 4)
            },
            "mpp_performance": {
                "matched_short_circuit_current_A": round(Iph, 4),
                "mpp_voltage_V": round(Vmp, 4),
                "mpp_current_A": round(Imp, 4),
                "output_power_watts": round(max_power, 4),
                "fill_factor": round(FF, 4),
                "tandem_efficiency_pct": round(efficiency, 2)
            }
        }

if __name__ == "__main__":
    tandem = PerovskiteSiliconTandemCell()
    result = tandem.calculate_tandem_performance(irradiance_w_m2=1000.0, cell_temp_c=50.0)
    print(json.dumps(result, indent=2))
