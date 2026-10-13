"""
Crop Routes for FastAPI AI Service
"""

from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "src"))

from schemas import CropPredictRequest
from prediction import get_crop_predictor
from crop_catalog import get_crop_catalog
from season_engine import get_season_engine
from barc_service import get_barc_service

router = APIRouter(prefix="", tags=["Crops & ML Prediction"])


@router.get("/crops")
async def list_crops():
    """Lists all 73 crops available in the Bangladesh Crop Catalog."""
    catalog = get_crop_catalog()
    return {
        "total_crops": len(catalog.catalog),
        "crops": catalog.get_all_crops()
    }


@router.get("/seasons")
async def list_seasons():
    """Returns Bangladesh agricultural season definitions and current calendar season."""
    engine = get_season_engine()
    return {
        "current_season": engine.get_current_season(),
        "seasons": engine.get_all_seasons_info()
    }


@router.post("/predict/crop")
async def predict_crops(req: CropPredictRequest):
    """
    Direct ML crop candidate generation based on trained SPAS-Dataset-BD pipeline.
    Returns top-k candidate crops with calibrated model confidence scores.
    """
    try:
        predictor = get_crop_predictor()
        predictions = predictor.predict_top_k(
            district=req.district,
            season=req.season,
            area=req.area,
            avg_temp=req.avg_temp or 26.0,
            avg_humidity=req.avg_humidity or 70.0,
            top_k=req.top_k
        )
        return {
            "query": {
                "district": req.district,
                "season": req.season,
                "area": req.area
            },
            "model_metadata": predictor.get_model_info(),
            "recommendations": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/recommend/crop")
async def recommend_crops_domain_filtered(req: CropPredictRequest):
    """
    Generates crop recommendations filtered through season compatibility and BARC zoning.
    """
    try:
        predictor = get_crop_predictor()
        catalog = get_crop_catalog()
        season_engine = get_season_engine()
        barc_service = get_barc_service()

        raw_candidates = predictor.predict_top_k(
            district=req.district,
            season=req.season,
            area=req.area,
            avg_temp=req.avg_temp or 26.0,
            avg_humidity=req.avg_humidity or 70.0,
            top_k=req.top_k * 2
        )

        validated = []
        for cand in raw_candidates:
            cat_entry = catalog.normalize(cand["crop"])
            if not cat_entry:
                continue

            season_check = season_engine.check_crop_season_compatibility(cat_entry["canonical_name"], req.season)
            if not season_check["is_compatible"]:
                continue

            barc_info = barc_service.get_crop_suitability(cat_entry["canonical_name"], req.district)

            validated.append({
                "rank": len(validated) + 1,
                "crop": cat_entry["canonical_name"],
                "bangla_name": cat_entry["bangla_name"],
                "model_confidence_score": cand["confidence_score"],
                "season_compatibility": season_check,
                "barc_suitability": barc_info
            })

            if len(validated) >= req.top_k:
                break

        return {
            "district": req.district,
            "season": req.season,
            "recommendations": validated
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation error: {str(e)}")
