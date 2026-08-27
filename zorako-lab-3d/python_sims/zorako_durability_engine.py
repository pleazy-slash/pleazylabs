import math
import json

class ZorakoEncapsulationEngine:
    def __init__(self, 
                 initial_efficiency=0.28, 
                 encapsulant_type="POE", # Polyolefin Elastomer (POE) vs EVA
                 busbar_count=16,         # Multi-busbar (MBB) topology
                 series_res_finger=0.0015):
        
        self.eta_0 = initial_efficiency
        self.busbars = busbar_count
        self.R_finger = series_res_finger
        
        # Degradation Constants
        # POE has significantly lower moisture ingress than traditional EVA
        self.k_pid = 0.00012 if encapsulant_type == "POE" else 0.00085
        self.k_uv = 0.0005   # UV discoloration factor

    def simulate_lifespan_degradation(self, operating_years=10, avg_temp_c=45.0, relative_humidity_pct=75.0):
        """
        Simulates year-by-year power loss breaking down PID, UV degradation, and thermal stress.
        """
        yearly_projection = []
        current_efficiency = self.eta_0
        
        # Grid line resistive scaling factor: More busbars reduce distance current travels
        grid_loss_factor = 1.0 / math.sqrt(self.busbars)
        effective_R_series = self.R_finger * grid_loss_factor
        
        for year in range(1, operating_years + 1):
            # PID Leakage degradation
            pid_loss = self.k_pid * (relative_humidity_pct / 100.0) * year
            
            # UV degradation on glass/encapsulant optical transmittance
            uv_loss = self.k_uv * year
            
            # Thermal stress micro-crack expansion factor
            thermal_stress = 1.0 + (max(0.0, avg_temp_c - 25.0) * 0.002)
            
            total_degradation = (pid_loss + uv_loss) * thermal_stress
            retained_factor = max(0.5, 1.0 - total_degradation)
            
            degraded_eff = self.eta_0 * retained_factor
            
            yearly_projection.append({
                "year": year,
                "retained_efficiency_pct": round(degraded_eff * 100, 2),
                "power_retention_pct": round(retained_factor * 100, 2),
                "effective_series_resistance_ohms": round(effective_R_series * (1 + 0.01 * year), 5)
            })

        return {
            "encapsulant_technology": "POE (Polyolefin Elastomer)" if self.k_pid < 0.0005 else "EVA",
            "busbar_architecture": f"{self.busbars}-Busbar Mesh",
            "10_year_retained_efficiency_pct": yearly_projection[-1]["retained_efficiency_pct"],
            "yearly_breakdown": yearly_projection
        }

if __name__ == "__main__":
    # Test Zorako's high-durability POE + 16 Busbar Mesh
    engine = ZorakoEncapsulationEngine(initial_efficiency=0.28, encapsulant_type="POE", busbar_count=16)
    results = engine.simulate_lifespan_degradation(operating_years=10, avg_temp_c=48.0, relative_humidity_pct=80.0)
    
    print(json.dumps(results, indent=2))
