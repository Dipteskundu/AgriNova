"""
AgriNova AI Microservice — FastAPI Main Application
Provides RESTful APIs for SPAS-Dataset-BD Crop ML, BARC Zoning,
BARC FRG-2024 Fertilizer Planning, and Open-Meteo Weather Intelligence.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))

from schemas import HealthResponse, ModelInfoResponse
from prediction import get_crop_predictor
from routes.crop import router as crop_router
from routes.fertilizer import router as fertilizer_router
from routes.weather import router as weather_router
from routes.recommendation import router as rec_router

app = FastAPI(
    title="AgriNova Agricultural Intelligence API",
    description=(
        "High-performance AI microservice powering the AgriNova Bangladesh Smart Agriculture Platform. "
        "Integrates machine learning trained on SPAS-Dataset-BD (v2.0), official BARC Crop Zoning, "
        "BARC Fertilizer Recommendation Guide 2024 (FRG-2024), and real-time Open-Meteo weather intelligence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(crop_router)
app.include_router(fertilizer_router)
app.include_router(weather_router)
app.include_router(rec_router)


@app.on_event("startup")
async def startup_event():
    """Pre-loads model and knowledge bases into memory on application startup."""
    print("Pre-loading AgriNova AI models and knowledge bases...")
    get_crop_predictor()
    print("AgriNova AI Microservice initialized successfully.")


@app.get("/health", response_model=HealthResponse, tags=["System Health"])
async def health_check():
    """Health check endpoint indicating service status."""
    return {
        "status": "healthy",
        "service": "AgriNova AI Intelligence Microservice",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/model/info", response_model=ModelInfoResponse, tags=["System Health"])
async def model_information():
    """Returns provenance and diagnostic details of the active ML champion pipeline."""
    predictor = get_crop_predictor()
    return predictor.get_model_info()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


