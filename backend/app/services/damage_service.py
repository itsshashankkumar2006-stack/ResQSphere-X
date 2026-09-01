import os
from google import genai
from google.genai import types

class DamageService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "YOUR_ACTUAL_API_KEY_HERE")

    def analyze_field_report(self, report_text: str) -> dict:
        """
        Module 1: AI Damage Assessment (Text/Field Report fallback).
        """
        try:
            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"Analyze this emergency disaster report and respond strictly with JSON containing 'severity_level' (SEVERE, MODERATE, or LOW), 'estimated_affected_population' (an integer), and a short 'action_recommendation'. Report: {report_text}",
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            return {"status": "success", "ai_analysis": response.text}
        except Exception as e:
            # Safe AI Fallback
            return {
                "status": "fallback", 
                "ai_analysis": f'{{"severity_level": "SEVERE", "estimated_affected_population": 15000, "action_recommendation": "Deploy emergency units immediately (Fallback: {str(e)})"}}'
            }