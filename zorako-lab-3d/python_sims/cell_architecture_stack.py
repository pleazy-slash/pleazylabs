import math
import json

class FullCellArchitectureStack:
    def __init__(self):
        # Layer 1: Anti-Reflective Coating (SiNx)
        self.arc_refractive_index = 2.05
        self.target_wavelength_nm = 600.0  # Peak solar spectrum
        
        # Layer 2 & 7: Polymer Encapsulation (POE Polymer)
        self.polymer_type = "POE"
        self.poe_wvtr = 1.5   # Water Vapor Transmission Rate (g/m²/day) - Very Low
        self.eva_wvtr = 35.0  # EVA degrades faster due to acetic acid formation
        
        # Layer 3 & 5: Semiconductor Absorbers
        self.perovskite_thickness_nm = 350.0
        self.silicon_thickness_um = 160.0
        self.doping_acceptor_Na = 1.5e16  # cm^-3
        self.doping_donor_Nd = 1.0e19     # cm^-3

    def calculate_optical_arc_thickness(self):
        """Calculates optimal Quarter-Wave Anti-Reflective Coating thickness."""
        # d = lambda / (4 * n)
        d_arc_nm = self.target_wavelength_nm / (4.0 * self.arc_refractive_index)
        return round(d_arc_nm, 2)

    def evaluate_polymer_degradation(self, exposure_hours=8760, temp_c=50.0):
        """Models moisture ingress and cross-linking retention in the polymer layer."""
        # Arrhenius rate equation for polymer hydrolytic degradation
        activation_energy_ev = 0.4
        k_boltzmann = 8.617333262145e-5 # eV/K
        T_kelvin = temp_c + 273.15
        
        thermal_rate = math.exp(-activation_energy_ev / (k_boltzmann * T_kelvin))
        accumulated_moisture = self.poe_wvtr * (exposure_hours / 24.0) * thermal_rate
        
        polymer_integrity_pct = max(0.0, 100.0 - (accumulated_moisture * 0.05))
        return {
            "polymer_material": self.polymer_type,
            "operating_temp_c": temp_c,
            "accumulated_moisture_g_m2": round(accumulated_moisture, 4),
            "retained_polymer_integrity_pct": round(polymer_integrity_pct, 2)
        }

    def solve_built_in_potential(self):
        """Calculates internal P-N junction built-in voltage (V_bi) of the silicon base."""
        # V_bi = (k*T / q) * ln((Na * Nd) / ni^2)
        Vt = 0.0259 # Thermal voltage at 300K
        ni = 1.5e10 # Intrinsic carrier concentration of Silicon
        
        V_bi = Vt * math.log((self.doping_acceptor_Na * self.doping_donor_Nd) / (ni**2))
        return round(V_bi, 4)

    def run_full_stack_analysis(self):
        arc_d = self.calculate_optical_arc_thickness()
        polymer_data = self.evaluate_polymer_degradation(exposure_hours=17520, temp_c=48.0) # 2 Years
        v_bi = self.solve_built_in_potential()
        
        return {
            "layer_1_ARC": {
                "material": "Silicon Nitride (SiNx)",
                "optimal_thickness_nm": arc_d,
                "refractive_index": self.arc_refractive_index
            },
            "layer_2_polymer_encapsulation": polymer_data,
            "layer_3_4_semiconductor_stack": {
                "top_absorber": "Perovskite (1.73 eV)",
                "bottom_absorber": "Monocrystalline Silicon (1.12 eV)",
                "silicon_pn_junction_built_in_voltage_V": v_bi
            }
        }

if __name__ == "__main__":
    engine = FullCellArchitectureStack()
    print(json.dumps(engine.run_full_stack_analysis(), indent=2))
