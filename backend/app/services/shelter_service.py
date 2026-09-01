class ShelterService:
    def __init__(self):
        # Mocking the database state for the Gorakhpur demo
        self.shelters = {
            "Shelter_1": {"name": "Gorakhpur Main Camp", "total_capacity": 500, "current_occupancy": 450},
            "Shelter_A": {"name": "Relief Tent A", "total_capacity": 200, "current_occupancy": 190}
        }

    def allocate_capacity(self, shelter_id: str, displaced_people: int) -> dict:
        """
        Enforces shelter capacity as a hard constraint.
        A full shelter must never be over-allocated.
        """
        if shelter_id not in self.shelters:
            return {"status": "error", "message": "Shelter not found."}

        shelter = self.shelters[shelter_id]
        new_occupancy = shelter["current_occupancy"] + displaced_people

        if new_occupancy > shelter["total_capacity"]:
            # Valid system outcome: allocation rejected due to hard constraint
            return {
                "status": "unmet_demand",
                "message": f"Capacity violation: {shelter['name']} only has {shelter['total_capacity'] - shelter['current_occupancy']} beds left."
            }

        # Update the state
        self.shelters[shelter_id]["current_occupancy"] = new_occupancy
        
        return {
            "status": "success",
            "shelter_id": shelter_id,
            "new_occupancy": new_occupancy
        }