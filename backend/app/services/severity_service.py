class SeverityService:
    def calculate_priority(self, damage_class: str, population_density: int, road_access_score: int) -> dict:
        """
        Module 2: Severity Engine.
        Deterministically calculates priority score (1-100) based on hard factors.
        """
        # Base score based on visible damage
        damage_weights = {"SEVERE": 50, "MODERATE": 30, "LOW": 10, "NONE": 0}
        base_score = damage_weights.get(damage_class.upper(), 0)
        
        # Add exposure (population) weight: max 30 points
        exposure_score = min((population_density / 1000) * 10, 30)
        
        # Add accessibility penalty (lower access = higher urgency): max 20 points
        accessibility_penalty = (10 - road_access_score) * 2
        
        total_priority = min(base_score + exposure_score + accessibility_penalty, 100)
        
        return {
            "priority_score": total_priority,
            "explanation": f"Base damage ({base_score}) + Exposure ({exposure_score}) + Access Penalty ({accessibility_penalty})"
        }