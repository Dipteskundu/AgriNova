"""
AgriNova AI Service Pydantic Request & Response Schemas
Enforces strict schema validation, physical boundary checking, and API contracts.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# ----------------------------------------------------
# Field & Location Models
# ----------------------------------------------------
class FieldLocation(BaseModel):
    district: str = Field(..., description="Administrative district in Bangladesh", example="Rajshahi")
    upazila: Optional[str] = Field(None, description="Upazila name for granular BARC zoning", example="Paba")
    area: float = Field(1.0, gt=0.0, description="Field surface area", example=2.0)
    area_unit: str = Field("acre", description="Unit of area: acre, decimal, hectare, bigha", example="acre")
    latitude: Optional[float] = Field(None, ge=20.0, le=27.0, description="GPS latitude in Bangladesh", example=24.3745)
    longitude: Optional[float] = Field(None, ge=88.0, le=93.0, description="GPS longitude in Bangladesh", example=88.6042)


# ----------------------------------------------------
# Soil Test Models
# ----------------------------------------------------
class SoilData(BaseModel):
    ph: Optional[float] = Field(None, ge=3.0, le=10.0, description="Soil pH reaction", example=6.5)
    organic_matter: Optional[float] = Field(None, ge=0.0, le=20.0, description="Soil organic matter (%)", example=1.8)
    nitrogen: Optional[float] = Field(None, ge=0.0, le=2.0, description="Total nitrogen (%)", example=0.12)
    phosphorus: Optional[float] = Field(None, ge=0.0, le=200.0, description="Available phosphorus (ppm)", example=14.5)
    potassium: Optional[float] = Field(None, ge=0.0, le=5.0, description="Exchangeable potassium (meq/100g)", example=0.22)
    sulfur: Optional[float] = Field(None, ge=0.0, le=100.0, description="Available sulfur (ppm)", example=18.0)
    zinc: Optional[float] = Field(None, ge=0.0, le=20.0, description="Available zinc (ppm)", example=1.2)
    boron: Optional[float] = Field(None, ge=0.0, le=10.0, description="Available boron (ppm)", example=0.35)


# ----------------------------------------------------
# Prediction & Recommendation Requests
# ----------------------------------------------------
class CropPredictRequest(BaseModel):
    district: str = Field(..., example="Rajshahi")
    season: str = Field("Rabi", example="Rabi")
    area: float = Field(1.0, gt=0.0, example=2.0)
    avg_temp: Optional[float] = Field(26.0, ge=5.0, le=50.0, example=24.0)
    avg_humidity: Optional[float] = Field(70.0, ge=10.0, le=100.0, example=65.0)
    top_k: int = Field(5, ge=1, le=15, example=5)


class FertilizerRequest(BaseModel):
    crop_name: str = Field(..., description="Target crop", example="Potato")
    area: float = Field(1.0, gt=0.0, description="Field area", example=2.0)
    area_unit: str = Field("acre", description="Unit of measurement", example="acre")
    soil: Optional[SoilData] = None


class WeatherAlertRequest(BaseModel):
    district: str = Field(..., example="Rajshahi")
    crop_name: Optional[str] = Field(None, example="Potato")
    crop_stage: Optional[str] = Field(None, example="Tuber Bulking")
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class FarmRecommendationRequest(BaseModel):
    field: FieldLocation
    soil: Optional[SoilData] = None
    season: Optional[str] = Field(None, description="Agricultural season (Kharif 1, Kharif 2, Rabi); auto-detected if omitted", example="Rabi")
    irrigation_available: bool = Field(True, description="Availability of irrigation infrastructure", example=True)
    crop_stage: Optional[str] = Field(None, description="Current growth stage if crop already chosen", example=None)


# ----------------------------------------------------
# Response Models
# ----------------------------------------------------
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str


class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    dataset: str
    dataset_version: str
    trained_at: Optional[str]
    num_classes: int
    classes_sample: List[str]
