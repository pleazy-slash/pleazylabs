import math
import json

class MaxedSolarCellPhysics:
    def __init__(self, 
                 cell_area_cm2=156.25, 
                 n=1.2,                # Diode Ideality Factor
                 Rs=0.005,             # Series Resistance (Ohms)
                 Rsh=500.0,            # Shunt Resistance (Ohms)
                 I_sc_stc=9.5,         # Short Circuit Current at STC (A)
                 V_oc_stc=0.72,        # Open Circuit Voltage at STC (V)
                 temp_coeff_voc=-0.0023, # V_oc Temp Coeff (V/°C)
                 temp_coeff_isc=0.0005): # I_sc Temp Coeff (A/°C)
        
        # Fundamental Physical Constants
        self.q = 1.602176634e-19       # Electron charge (Coulombs)
        self.k = 1.380649e-23          # Boltzmann constant (J/K)
        
        # Cell Mechanical & Electronic Parameters
        self.area_m2 = cell_area_cm2 / 10000.0
        self.n = float(n)
        self.Rs = float(Rs)
        self.Rsh = float(Rsh)
        
        # Reference Parameters at STC (25°C = 298.15K, 1000 W/m²)
        self.T_ref = 298.15
        self.I_sc_stc = float(I_sc_stc)
        self.V_oc_stc = float(V_oc_stc)
        self.alpha_isc = float(temp_coeff_isc)
        self.beta_voc = float(temp_coeff_voc)

    def _calculate_diode_parameters(self, G, T_celsius):
        """Calculates temperature-adjusted saturation current and photocurrent."""
        T_k = T_celsius + 273.15
        Vt = (self.n * self.k * T_k) / self.q  # Thermal Voltage
        
        # Temperature delta from STC
        dT = T_celsius - 25.0
        
        # Adjusted Photocurrent (I_ph)
        I_ph = (G / 1000.0) * (self.I_sc_stc + self.alpha_isc * dT)
        
        # Adjusted V_oc
        V_oc_adj = self.V_oc_stc + self.beta_voc * dT
        
        # Reverse Saturation Current (I_0) derivation
        I_0 = (I_ph - (V_oc_adj / self.Rsh)) / (math.exp(V_oc_adj / Vt) - 1.0)
        I_0 = max(1e-12, I_0)
        
        return I_ph, I_0, Vt

    def solve_current_at_voltage(self, V, I_ph, I_0, Vt, tolerance=1e-6, max_iter=100):
        """Uses Newton-Raphson method to solve implicit equation: f(I) = I - I_ph + I_0*(exp((V+I*Rs)/Vt)-1) + (V+I*Rs)/Rsh = 0"""
        I = I_ph  # Initial guess
        for _ in range(max_iter):
            arg = (V + I * self.Rs) / Vt
            # Prevent overflow in exponential
            if arg > 100:
                arg = 100
            
            exp_val = math.exp(arg)
            
            # f(I)
            f_I = I - I_ph + I_0 * (exp_val - 1.0) + (V + I * self.Rs) / self.Rsh
            
            # f'(I) - Derivative with respect to I
            f_prime = 1.0 + I_0 * (self.Rs / Vt) * exp_val + (self.Rs / self.Rsh)
            
            # Newton step
            I_next = I - (f_I / f_prime)
            
            if abs(I_next - I) < tolerance:
                return max(0.0, I_next)
            I = I_next
            
        return max(0.0, I)

    def sweep_iv_curve(self, irradiance_w_m2=1000.0, cell_temp_c=25.0, steps=50):
        """Sweeps voltage from 0 to V_oc to find exact Maximum Power Point (MPP)."""
        I_ph, I_0, Vt = self._calculate_diode_parameters(irradiance_w_m2, cell_temp_c)
        
        max_power = 0.0
        v_mpp = 0.0
        i_mpp = 0.0
        v_oc = 0.0
        
        # Approximate V_oc for sweeping
        v_oc_approx = Vt * math.log(max(1.0, (I_ph / I_0)))
        
        voltage_step = v_oc_approx / steps
        
        for i in range(steps + 1):
            V = i * voltage_step
            I = self.solve_current_at_voltage(V, I_ph, I_0, Vt)
            
            P = V * I
            if I <= 0 and v_oc == 0.0:
                v_oc = V
                
            if P > max_power:
                max_power = P
                v_mpp = V
                i_mpp = I

        # Fill Factor calculation: FF = P_max / (V_oc * I_sc)
        i_sc = self.solve_current_at_voltage(0.0, I_ph, I_0, Vt)
        if v_oc == 0:
            v_oc = v_oc_approx
            
        fill_factor = max_power / max(0.001, (v_oc * i_sc))
        incident_power_watts = irradiance_w_m2 * self.area_m2
        efficiency = (max_power / max(0.001, incident_power_watts)) * 100.0

        return {
            "irradiance_w_m2": irradiance_w_m2,
            "cell_temp_c": cell_temp_c,
            "short_circuit_current_Isc_A": round(i_sc, 4),
            "open_circuit_voltage_Voc_V": round(v_oc, 4),
            "mpp_voltage_Vmp_V": round(v_mpp, 4),
            "mpp_current_Imp_A": round(i_mpp, 4),
            "max_power_watts": round(max_power, 4),
            "fill_factor_FF": round(fill_factor, 4),
            "cell_efficiency_pct": round(efficiency, 2),
            "parasitic_losses": {
                "series_resistance_loss_watts": round(i_mpp**2 * self.Rs, 4),
                "shunt_leakage_loss_watts": round(((v_mpp + i_mpp * self.Rs)**2) / self.Rsh, 4)
            }
        }

if __name__ == "__main__":
    solver = MaxedSolarCellPhysics(
        cell_area_cm2=156.25,
        n=1.15,
        Rs=0.004,
        Rsh=650.0,
        I_sc_stc=9.8,
        V_oc_stc=0.73
    )
    
    # Solve exact physics at 1000 W/m² and 50°C cell heat
    result = solver.sweep_iv_curve(irradiance_w_m2=1000.0, cell_temp_c=50.0)
    print(json.dumps(result, indent=2))
