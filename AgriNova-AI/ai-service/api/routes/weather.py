"""
Weather & Alert Routes for FastAPI AI Service
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "src"))

from schemas import WeatherAlertRequest
from weather_service import get_weather_service
from weather_engine import get_weather_alert_engine

router = APIRouter(prefix="", tags=["Weather & Agricultural Alerts"])


@router.get("/weather/{location}")
async def get_weather_by_location(
    location: str,
    latitude: Optional[float] = Query(None, description="Optional GPS latitude"),
    longitude: Optional[float] = Query(None, description="Optional GPS longitude")
):
    """
    Fetches real-time weather and 7-day forecast from Open-Meteo with 1-hour cache.
    Location can be any Bangladesh district name (e.g. Rajshahi, Dinajpur, Bogura).
    """
    try:
        ws = get_weather_service()
        data = ws.get_weather_forecast(district=location, latitude=latitude, longitude=longitude)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather retrieval error: {str(e)}")


@router.post("/weather/alerts")
async def get_agricultural_alerts(req: WeatherAlertRequest):
    """
    Evaluates weather conditions against crop-specific thresholds and returns actionable agronomic alerts.
    """
    try:
        engine = get_weather_alert_engine()
        alerts = engine.generate_alerts(
            district=req.district,
            crop_name=req.crop_name,
            crop_stage=req.crop_stage,
            latitude=req.latitude,
            longitude=req.longitude
        )
        return {
            "district": req.district,
            "crop": req.crop_name,
            "crop_stage": req.crop_stage,
            "total_alerts": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather alert error: {str(e)}")
