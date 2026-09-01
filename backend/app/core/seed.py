from sqlalchemy.orm import Session
from app.core.database import SessionLocal

# Import models safely based on your file structure
try:
    from app.models.shelter import Shelter
    from app.models.disaster import DisasterZone
except ImportError:
    # Fallback in case they are stored in __init__.py or models.py
    from app.models import Shelter, DisasterZone

def seed_database():
    """
    Injects the baseline Gorakhpur demo scenario into PostGIS.
    This fulfills the 'Offline/Demo Fallback' requirement.
    """
    db: Session = SessionLocal()
    try:
        # Check if the database is already seeded to prevent duplicates on restart
        if db.query(Shelter).first():
            print("Database already contains data. Skipping seed.")
            return

        print("Injecting Gorakhpur SIH Demo Data into PostGIS...")

        # 1. Create Gorakhpur Shelters
        shelter1 = Shelter(
            name="Gorakhpur Main Camp", 
            lat=26.7600, lng=83.3700, 
            total_capacity=500, current_occupancy=450, 
            has_power=True, water_liters=10000
        )
        shelter2 = Shelter(
            name="Relief Tent A", 
            lat=26.7400, lng=83.4200, 
            total_capacity=200, current_occupancy=190, 
            has_power=False, water_liters=2500
        )

        # 2. Create Gorakhpur Disaster Zone
        zone1 = DisasterZone(
            severity="SEVERE", 
            lat=26.7600, lng=83.3700, 
            radius_meters=3000, 
            description="Severe regional flood due to Rapti river overflow."
        )

        # Add and commit all data to the database
        db.add_all([shelter1, shelter2, zone1])
        db.commit()
        print("✅ Database successfully seeded!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()