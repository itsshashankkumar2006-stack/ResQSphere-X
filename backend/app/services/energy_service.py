class EnergyService:
    def estimate_requirements(self, shelter_occupancy: int, solar_resource_kwh: float) -> dict:
        """
        Module 6: Renewable Energy Planner.
        Estimates the required PV array and battery backup size for a shelter.
        """
        # Assume 2.5 kWh daily requirement per person for basic emergency loads
        daily_demand_kwh = shelter_occupancy * 2.5 
        
        # Calculate Solar PV size based on available local solar resource
        pv_size_kw = (daily_demand_kwh / solar_resource_kwh) if solar_resource_kwh > 0 else 0
        
        # Calculate battery backup for 1.5 days of autonomy
        battery_backup_kwh = daily_demand_kwh * 1.5
        
        return {
            "daily_demand_kwh": round(daily_demand_kwh, 2),
            "recommended_pv_kw": round(pv_size_kw, 2),
            "battery_backup_kwh": round(battery_backup_kwh, 2)
        }