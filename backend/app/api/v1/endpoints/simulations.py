from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class SimulationRequest(BaseModel):
    scenario_type: str
    variables_changed: Dict[str, Any]

@router.post("/run")
def run_scenario(req: SimulationRequest):
    """
    Module 7: Disaster Simulator.
    Outputs dynamic response plans based on changing environmental variables.
    """
    plan = "Monitor situation and maintain current operational posture."
    
    if req.scenario_type.lower() == "flood":
        # Safely extract the water level, defaulting to 0 if not provided
        water_level = float(req.variables_changed.get("water_level_cm", 0))
        
        if water_level >= 150:
            plan = f"🚨 CRITICAL: Water level reached {water_level}cm. Abandon ground operations. Initiate rooftop airlift protocols immediately."
        elif water_level >= 50:
            plan = f"⚠️ WARNING: Water level at {water_level}cm. Deploy heavy-duty sandbags, reroute light vehicles, and prepare secondary shelters."
        else:
            plan = f"✅ STABLE: Water level at {water_level}cm. Standard evacuation routes remain viable. Continue monitoring."

    return {
        "status": "success",
        "scenario_type": req.scenario_type,
        "updated_plan": plan
    }