from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from app.core.database import Base

class SimulationRecord(Base):
    __tablename__ = "simulation_records"

    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer, ForeignKey("disasters.id"), nullable=False)
    scenario_name = Column(String, nullable=False)
    modified_parameters = Column(JSON, nullable=False)  # e.g., closed roads, full shelters
    baseline_summary = Column(JSON, nullable=False)
    updated_summary = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)