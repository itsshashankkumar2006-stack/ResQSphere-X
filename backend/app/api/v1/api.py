from fastapi import APIRouter
from app.api.v1.endpoints import routes, shelters, energy, simulations, damage, disasters

api_router = APIRouter()

# Registering all SIH Target Build Modules
api_router.include_router(damage.router, prefix="/ai", tags=["AI & Severity"])
api_router.include_router(routes.router, prefix="/routes", tags=["Rescue Planner"])
api_router.include_router(shelters.router, prefix="/shelters", tags=["Shelter Manager"])
api_router.include_router(energy.router, prefix="/energy", tags=["Energy Planner"])
api_router.include_router(simulations.router, prefix="/simulations", tags=["Disaster Simulator"])

# SOS and SMS Alerts (Mounted without a prefix to match frontend API calls)
api_router.include_router(disasters.router, tags=["Disasters & Alerts"])