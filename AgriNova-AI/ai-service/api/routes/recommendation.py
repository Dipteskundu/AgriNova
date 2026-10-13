"""
Unified Farm Recommendation Route for FastAPI AI Service
"""

from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "src"))

from schemas import FarmRecommendationRequest
from recommendation_engine import get_farm_recommendation_engine

router = APIRouter(prefix="", tags=["Unified Farm Recommendation"])


@router.post("/recommend/farm")
async def generate_full_farm_recommendation(req: FarmRecommendationRequest):
    """
    Unified Agricultural Decision-Support Endpoint:
    Processes field area, location, soil tests, season, and irrigation status to return:
    1. Primary recommended crop with model confidence score and why-recommended breakdown.
    2. Ranked alternative crops.
    3. Official BARC Crop Zoning suitability assessment.
    4. Official BARC FRG-2024 fertilizer product requirements and split application schedule.
    5. Real-time Open-Meteo weather snapshot and 7-day forecast.
    6. Actionable weather alerts and irrigation guidance.
    7. Full data provenance and safety disclaimer.
    """
    try:
        engine = get_farm_recommendation_engine()
        field_dict = req.field.model_dump()
        soil_dict = req.soil.model_dump() if req.soil else None

        recommendation = engine.generate_farm_recommendation(
            field=field_dict,
            soil=soil_dict,
            season=req.season,
            irrigation_available=req.irrigation_available,
            crop_stage=req.crop_stage
        )
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Farm recommendation error: {str(e)}")
