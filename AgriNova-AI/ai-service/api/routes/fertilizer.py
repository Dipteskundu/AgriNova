"""
Fertilizer Routes for FastAPI AI Service
"""

from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "src"))

from schemas import FertilizerRequest
from fertilizer_engine import (
    calculate_fertilizer_plan,
    FERTILIZER_CARRIERS,
    BARC_FRG_CROP_NUTRIENTS
)

router = APIRouter(prefix="", tags=["Fertilizer Recommendations (BARC FRG-2024)"])


@router.get("/fertilizers")
async def list_fertilizer_metadata():
    """Returns official commercial fertilizer carriers and tracked crop baselines from FRG-2024."""
    return {
        "commercial_carriers": FERTILIZER_CARRIERS,
        "available_crops_with_frg_doses": list(BARC_FRG_CROP_NUTRIENTS.keys()),
        "source": "BARC Fertilizer Recommendation Guide 2024 (FRG-2024)"
    }


@router.post("/recommend/fertilizer")
async def recommend_fertilizer(req: FertilizerRequest):
    """
    Computes an exact, area-scaled fertilizer recommendation plan adhering strictly to BARC FRG-2024.
    """
    try:
        soil_dict = req.soil.model_dump() if req.soil else None
        plan = calculate_fertilizer_plan(
            crop_name=req.crop_name,
            area=req.area,
            area_unit=req.area_unit,
            soil_data=soil_dict
        )
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fertilizer calculation error: {str(e)}")
