from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from app.core.database import Base

class RescueRoute(Base):
    __tablename__ = "rescue_routes"

    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer, ForeignKey("disasters.id"), nullable=False)
    origin_zone = Column(String, nullable=False)
    destination_shelter = Column(String, nullable=False)
    status = Column(String, default="FEASIBLE")  # FEASIBLE, NO_FEASIBLE_ROUTE, BLOCKED
    total_distance_km = Column(Float, nullable=False)
    estimated_time_min = Column(Float, nullable=False)
    waypoints = Column(JSON, nullable=False)  # List of [lat, lon]
    constraints_considered = Column(JSON, nullable=True)  # Blocked roads, flood zones
    explanation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)