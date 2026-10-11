"""
AgriNova AI Service Test Suite
Comprehensive testing for FastAPI endpoints, ML inference, domain filters, and fertilizer engine.
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))
sys.path.append(str(Path(__file__).resolve().parent.parent / "api"))

import pytest
from starlette.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AgriNova" in data["service"]


def test_model_info_endpoint():
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "XGBoost"
    assert data["dataset"] == "SPAS-Dataset-BD"
    assert data["dataset_version"] == "2.0_cleaned"
    assert data["num_classes"] == 72


def test_list_crops_endpoint():
    response = client.get("/crops")
    assert response.status_code == 200
    data = response.json()
    assert data["total_crops"] >= 72
    assert len(data["crops"]) >= 72


def test_list_seasons_endpoint():
    response = client.get("/seasons")
    assert response.status_code == 200
    data = response.json()
    assert "current_season" in data
    assert "Kharif 1" in data["seasons"]
    assert "Kharif 2" in data["seasons"]
    assert "Rabi" in data["seasons"]


def test_predict_crops_endpoint():
    payload = {
        "district": "Rajshahi",
        "season": "Rabi",
        "area": 2.0,
        "avg_temp": 22.0,
        "avg_humidity": 65.0,
        "top_k": 5
    }
    response = client.post("/predict/crop", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) == 5
    first = data["recommendations"][0]
    assert "crop" in first
    assert "confidence_score" in first
    assert 0.0 <= first["confidence_score"] <= 1.0


def test_fertilizer_recommendation_endpoint():
    payload = {
        "crop_name": "Potato",
        "area": 2.0,
        "area_unit": "acre",
        "soil": {
            "ph": 6.2,
            "phosphorus": 14.5,
            "potassium": 0.22
        }
    }
    response = client.post("/recommend/fertilizer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["has_frg_guidance"] is True
    assert "Urea" in [p["product_name"].split()[0] for p in data["fertilizer_products"]]
    assert len(data["application_schedule"]) >= 2


def test_weather_endpoint():
    response = client.get("/weather/Rajshahi")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "temperature_c" in data["current"]
    assert "forecast_7_day" in data


def test_weather_alerts_endpoint():
    payload = {
        "district": "Rajshahi",
        "crop_name": "Potato",
        "crop_stage": "Vegetative"
    }
    response = client.post("/weather/alerts", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert isinstance(data["alerts"], list)


def test_unified_farm_recommendation_endpoint():
    payload = {
        "field": {
            "district": "Rajshahi",
            "upazila": "Paba",
            "area": 2.5,
            "area_unit": "acre"
        },
        "soil": {
            "ph": 6.5,
            "nitrogen": 0.12,
            "phosphorus": 15.0,
            "potassium": 0.22
        },
        "season": "Rabi",
        "irrigation_available": True
    }
    response = client.post("/recommend/farm", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "primary_crop" in data
    assert "alternatives" in data
    assert "fertilizer_plan" in data
    assert "weather" in data
    assert "weather_alerts" in data
    assert "sources" in data
    assert "disclaimer" in data
    assert len(data["sources"]) == 4
