from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="ResQSphere-X Backend", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for incoming request bodies
class AIReportRequest(BaseModel):
    report: str

class RouteRequest(BaseModel):
    start: str
    destination: str
    blocked_edges: list[str] = []

class ShelterAllocationRequest(BaseModel):
    people_count: int
    shelter_id: str

class EnergyPlanRequest(BaseModel):
    occupancy: int
    solar_kwh: float

class ScenarioRequest(BaseModel):
    scenario_type: str
    parameters: dict

class SOSRequest(BaseModel):
    lat: float
    lng: float
    message: str


@app.get("/")
def read_root():
    return {"status": "ResQSphere-X Command Center Backend Online", "target": "Gorakhpur Sector"}


# MODULE 1: AI Field Intelligence Endpoint
@app.post("/api/ai/analyze")
def analyze_field_report(data: AIReportRequest):
    text = data.report.lower()
    if "trapped" in text or "water" in text or "flood" in text or "severe" in text:
        return {
            "priority": "HIGH",
            "severity": "CRITICAL",
            "action_plan": "Deploy amphibious rescue boat and medical unit immediately to sector coordinates."
        }
    return {
        "priority": "MODERATE",
        "severity": "CAUTION",
        "action_plan": "Monitor situation and dispatch routine patrol unit."
    }


# MODULE 2: Regional Zone Safety Matrix Status
@app.get("/api/zones/status")
def get_zone_status():
    return [
        {"zone": "Zone A", "name": "Downtown Core", "status": "DANGER", "trapped": 145, "safety_percent": 15},
        {"zone": "Zone B", "name": "Northern Bypass", "status": "CAUTION", "trapped": 42, "safety_percent": 58},
        {"zone": "Zone C", "name": "Safe Sector Base", "status": "SAFE", "trapped": 0, "safety_percent": 98},
    ]


# MODULE 3: Rescue Route Planner (Graph Simulation)
@app.post("/api/routes/calculate")
def calculate_rescue_route(data: RouteRequest):
    # Mock NetworkX graph routing logic bypassing blocked roads
    default_path = ["Zone_A", "Intersection_1", "Shelter_1"]
    if data.blocked_edges:
        # Simulate alternative route if path is blocked
        default_path = ["Zone_A", "Alternate_Junction", "Shelter_1"]
    
    return {
        "start": data.start,
        "destination": data.destination,
        "optimal_route": default_path,
        "status": "ROUTE_SECURED"
    }


# MODULE 4: Shelter Capacity Allocation
@app.post("/api/shelters/allocate")
def allocate_shelter(data: ShelterAllocationRequest):
    max_capacity = 200
    if data.people_count > max_capacity:
        return {
            "success": False,
            "status": f"❌ Overflow Warning: Requested {data.people_count} exceeds shelter limit of {max_capacity}."
        }
    return {
        "success": True,
        "status": f"✅ Successfully allocated {data.people_count} evacuees to Shelter {data.shelter_id}."
    }


# MODULE 5: Emergency Broadcasts
@app.post("/api/broadcast")
def trigger_broadcast(zone_id: int, severity: str):
    return {
        "broadcast_status": "DISPATCHED",
        "zone": zone_id,
        "severity": severity,
        "message": f"EMERGENCY BROADCAST: Immediate evacuation order issued for Zone {zone_id}."
    }


# MODULE 6: Energy & Solar Grid Planner
@app.post("/api/energy/plan")
def energy_planner(data: EnergyPlanRequest):
    required_kwh = data.occupancy * 1.5  # 1.5 kWh per person baseline
    deficit = max(0.0, required_kwh - data.solar_kwh)
    coverage = min(100.0, (data.solar_kwh / required_kwh) * 100) if required_kwh > 0 else 100.0
    
    return {
        "required_kwh": round(required_kwh, 2),
        "solar_kwh": data.solar_kwh,
        "deficit_kwh": round(deficit, 2),
        "coverage_percent": round(coverage, 1),
        "generator_required": deficit > 50.0
    }


# MODULE 7: Disaster Simulator
@app.post("/api/simulation/run")
def run_simulation(data: ScenarioRequest):
    water_level = data.parameters.get("water_level_cm", 0)
    if water_level > 70:
        effect = "Severe inundation detected across low-lying districts. Evacuation protocols triggered."
    elif water_level > 30:
        effect = "Moderate water accumulation. Traffic rerouting recommended."
    else:
        effect = "Water levels within safe operational thresholds."
        
    return {
        "scenario": data.scenario_type,
        "water_level_cm": water_level,
        "simulation_result": effect
    }


# NEW: Live Weather & Meteorological Telemetry API
@app.get("/api/weather/live")
async def get_live_weather():
    return {
        "location": "Gorakhpur Command Sector",
        "temperature_c": 29.5,
        "humidity_percent": 88,
        "rainfall_mm_per_hr": 42.5,  # Heavy monsoon rain indicator
        "wind_speed_kmh": 18.2,
        "flood_risk_index": "CRITICAL",
        "timestamp": "2026-09-01T15:30:00Z"
    }