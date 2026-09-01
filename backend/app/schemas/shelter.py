from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ShelterBase(BaseModel):
    disaster_id: int
    name: str
    latitude: float
    longitude: float
    total_capacity: int
    current_occupancy: Optional[int] = 0
    is_operational: Optional[bool] = True
    water_liters: Optional[float] = 1000.0
    food_rations: Optional[int] = 500
    medical_kits: Optional[int] = 50
    power_backup_hours: Optional[float] = 12.0

class ShelterCreate(ShelterBase):
    pass

class ShelterResponse(ShelterBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True