from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class DamageAssessmentBase(BaseModel):
    disaster_id: int
    zone_name: str
    damage_level: str
    confidence: float
    latitude: float
    longitude: float
    affected_population: int
    priority_score: float

class DamageAssessmentResponse(DamageAssessmentBase):
    id: int
    model_version: str
    timestamp: datetime
    severity_factors: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True