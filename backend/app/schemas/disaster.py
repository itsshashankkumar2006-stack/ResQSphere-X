from pydantic import BaseModel
from datetime import datetime

class DisasterBase(BaseModel):
    title: str
    disaster_type: str
    location_name: str
    latitude: float
    longitude: float

class DisasterCreate(DisasterBase):
    pass

class DisasterResponse(DisasterBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True