# 1. Import the SIH Demo models we just created
from .shelter import Shelter
from .disaster import DisasterZone

# 2. Future-proofing: As you populate the other files in your models folder, 
# you will uncomment these lines so the database engine can see them.
# (Leaving them commented for now so your app doesn't crash looking for empty files)

# from .damage import DamageAssessment
# from .route import RoutePlan
# from .simulation import SimulationScenario
# from .user import User

# Also exposing Base so that alembic (database migrations) or main.py 
# can easily import 'Base' directly from 'app.models'
from app.core.database import Base