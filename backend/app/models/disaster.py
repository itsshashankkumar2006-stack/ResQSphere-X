from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class DisasterZone(Base):
    __tablename__ = "disasters"  # Fixed to match route.py's foreign key

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String, index=True) # SEVERE, MODERATE, LOW
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    radius_meters = Column(Integer, default=1000)
    description = Column(String)