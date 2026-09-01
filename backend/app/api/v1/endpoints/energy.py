from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class EnergyRequest(BaseModel):
    shelter_occupancy: int
    solar_resource_kwh: float

@router.post("/estimate")
def estimate_energy(req: EnergyRequest):
    """
    Module 6: Energy Planner.
    Calculates power demand vs. renewable supply for emergency shelters.
    """
    # Assuming baseline emergency need is 2.5 kWh per person per day
    daily_demand = req.shelter_occupancy * 2.5
    
    # Calculate how much of the demand is covered by solar
    coverage = 100.0
    if daily_demand > 0:
        coverage = min((req.solar_resource_kwh / daily_demand) * 100, 100.0)

    return {
        "status": "success",
        "daily_demand_kwh": daily_demand,
        "solar_capacity_kwh": req.solar_resource_kwh,
        "coverage_percent": round(coverage, 1),
        "generator_required": coverage < 100,
        "deficit_kwh": max(0, daily_demand - req.solar_resource_kwh)
    }