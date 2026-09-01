from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.shelter_service import ShelterService

router = APIRouter()
shelter_service = ShelterService()

class AllocationRequest(BaseModel):
    displaced_people: int
    shelter_id: str

@router.post("/allocate")
def allocate_shelter(request: AllocationRequest):
    """
    Module 5: Shelter Manager.
    Attempts to allocate displaced populations strictly within available capacity constraints.
    """
    result = shelter_service.allocate_capacity(
        shelter_id=request.shelter_id,
        displaced_people=request.displaced_people
    )
    
    if result["status"] == "error" or result["status"] == "unmet_demand":
        raise HTTPException(status_code=400, detail=result["message"])
        
    # Standardize the output for the frontend state manager
    return {"status": "allocated", "new_occupancy": result["new_occupancy"]}