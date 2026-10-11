# AgriNova Agricultural Intelligence API Reference

## 1. High-Level Communication Architecture
The frontend (React / Vite) communicates exclusively with the **Node.js Express Backend**. The Express backend validates user identity, loads field and soil context from **MongoDB Atlas**, calls the internal **Python FastAPI AI Microservice**, persists the recommendation snapshot for auditability, and returns a structured response contract to the **Farmer Portal**.

---

## 2. Main Backend (Node.js / Express) Endpoints

### `POST /api/ai/farm-recommendation`
The unified master decision-support endpoint.

**Request Payload:**
```json
{
  "field": {
    "district": "Rajshahi",
    "upazila": "Paba",
    "area": 2.0,
    "area_unit": "acre",
    "latitude": 24.3745,
    "longitude": 88.6042
  },
  "soil": {
    "ph": 6.5,
    "organic_matter": 1.8,
    "nitrogen": 0.12,
    "phosphorus": 14.5,
    "potassium": 0.22,
    "sulfur": 18.0,
    "zinc": 1.2,
    "boron": 0.35
  },
  "season": "Rabi",
  "irrigation_available": true,
  "crop_stage": null
}
```

**Response Contract:**
```json
{
  "success": true,
  "recommendation": {
    "primary_crop": {
      "rank": 1,
      "canonical_name": "Potato (Irish Potato)",
      "bangla_name": "গোল আলু",
      "model_confidence_score": 0.553,
      "score_label": "Model confidence score (decision support, not guaranteed yield)",
      "category": "Tuber",
      "barc_suitability": {
        "is_tracked": true,
        "suitability_class": "Suitable",
        "suitability_level": "High"
      },
      "season_compatibility": {
        "is_compatible": true,
        "target_season": "Rabi",
        "lifecycle": {
          "transplant_window": "November to December",
          "growth_window": "December to February",
          "harvest_window": "February to March"
        }
      },
      "why_recommended": [
        "Predicted by ML model as viable candidate for Rajshahi (55.3% confidence score).",
        "Agronomically compatible with Rabi season in Bangladesh.",
        "Official BARC Crop Zoning classifies this crop as 'Suitable' for Rajshahi."
      ]
    },
    "alternatives": [
      {
        "rank": 2,
        "canonical_name": "Wheat",
        "bangla_name": "গম",
        "model_confidence_score": 0.215,
        "barc_suitability": { "is_tracked": true, "suitability_class": "Moderately Suitable" }
      }
    ],
    "fertilizer_plan": {
      "crop": "Potato (Irish Potato)",
      "has_frg_guidance": true,
      "field_area": { "acres": 2.0, "decimals": 200.0, "hectares": 0.8094 },
      "fertilizer_products": [
        { "product_name": "Urea", "quantity_kg": 237.5, "bags_50kg": 4.8 },
        { "product_name": "TSP", "quantity_kg": 121.4, "bags_50kg": 2.4 },
        { "product_name": "MoP", "quantity_kg": 202.3, "bags_50kg": 4.0 },
        { "product_name": "Gypsum", "quantity_kg": 80.9, "bags_50kg": 1.6 },
        { "product_name": "Zinc Sulfate", "quantity_kg": 6.8, "bags_50kg": 0.14 },
        { "product_name": "Boric Acid", "quantity_kg": 5.7, "bags_50kg": 0.11 }
      ],
      "application_schedule": [
        { "timing_stage": "Basal (Furrow before planting)", "products_to_apply": ["118.8 kg Urea", "121.4 kg TSP", "..."] },
        { "timing_stage": "Earthing Up (30-35 DAP)", "products_to_apply": ["118.8 kg Urea", "101.2 kg MoP"] }
      ]
    },
    "weather": {
      "source": "Open-Meteo",
      "current": { "temperature_c": 30.7, "relative_humidity_pct": 76.0, "precipitation_mm": 0.0 },
      "summary": { "total_forecast_rain_mm": 83.0 }
    },
    "weather_alerts": [
      {
        "alert_type": "Heavy Rainfall & Waterlogging Advisory",
        "severity": "High",
        "recommended_action": "Heavy rain forecast. Halt irrigation and unblock field drains."
      }
    ],
    "actions": [
      "Prepare seedbed according to Rabi calendar.",
      "Apply phosphate, sulfur, and zinc as basal plowing dose.",
      "Monitor agro-meteorological alerts before top-dressing urea."
    ],
    "warnings": [
      "Model predictions are decision support and do not guarantee commercial harvest yield."
    ],
    "sources": [
      { "source_key": "SPAS_DATASET_BD", "title": "SPAS-Dataset-BD (v2.0, 2025)" },
      { "source_key": "BARC_CROP_ZONING", "title": "BARC Crop Zoning" },
      { "source_key": "BARC_FRG_2024", "title": "BARC Fertilizer Recommendation Guide 2024" },
      { "source_key": "OPEN_METEO", "title": "Open-Meteo Weather API" }
    ],
    "disclaimer": "AgriNova provides decision support based on official Bangladesh agricultural guidelines..."
  }
}
```

---

## 3. Other Express Endpoints
- `POST /api/ai/crop-recommendation`: Raw ML candidate generation.
- `POST /api/ai/fertilizer-recommendation`: Area-scaled BARC FRG-2024 calculation.
- `GET /api/weather/:location`: Real-time weather and 7-day forecast.
- `GET /api/weather/:location/alerts`: Meteorological alerts for specific crops and stages.
- `GET /api/ai/history`: Historical recommendation logs for the authenticated farmer.
