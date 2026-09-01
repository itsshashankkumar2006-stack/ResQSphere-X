from fastapi import APIRouter
from pydantic import BaseModel
from app.services.damage_service import DamageService
from app.services.severity_service import SeverityService

router = APIRouter()
damage_service = DamageService()
severity_service = SeverityService()

class AIReportInput(BaseModel):
    report_text: str

@router.post("/analyze-report")
def analyze_disaster_report(input: AIReportInput):
    """Module 1: Process unstructured field reports via Gemini."""
    return damage_service.analyze_field_report(report_text=input.report_text)

class SeverityInput(BaseModel):
    damage_class: str
    population_density: int
    road_access_score: int

@router.post("/calculate-severity")
def calculate_severity(input: SeverityInput):
    """Module 2: Calculate deterministic priority score."""
    return severity_service.calculate_priority(
        damage_class=input.damage_class,
        population_density=input.population_density,
        road_access_score=input.road_access_score
    )