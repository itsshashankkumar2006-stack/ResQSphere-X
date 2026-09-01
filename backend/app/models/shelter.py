from sqlalchemy import Column, Integer, String, Float, Boolean
from app.core.database import Base

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    total_capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    has_power = Column(Boolean, default=True)
    water_liters = Column(Integer, default=0)