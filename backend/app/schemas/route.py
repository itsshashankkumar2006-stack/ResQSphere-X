from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class RescueRouteBase(BaseModel):
    disaster_id: int
    origin_zone: str
    destination_shelter: str

class RescueRouteCreate(RescueRouteBase):
    pass

class RescueRouteResponse(RescueRouteBase):
    id: int
    status: str
    total_distance_km: float
    estimated_time_min: float
    waypoints: List[List[float]]
    constraints_considered: Optional[Any] = None
    explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True