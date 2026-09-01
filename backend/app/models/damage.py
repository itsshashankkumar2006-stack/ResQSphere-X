from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from app.core.database import Base

class DamageAssessment(Base):
    __tablename__ = "damage_assessments"

    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer, ForeignKey("disasters.id"), nullable=False)
    zone_name = Column(String, nullable=False)
    damage_level = Column(String, nullable=False)  # NO_LOW, MODERATE, SEVERE
    confidence = Column(Float, nullable=False)
    model_version = Column(String, default="v1.0-baseline")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    affected_population = Column(Integer, default=0)
    priority_score = Column(Float, default=0.0)
    severity_factors = Column(JSON, nullable=True)  # Explainable factors
    timestamp = Column(DateTime, default=datetime.utcnow)