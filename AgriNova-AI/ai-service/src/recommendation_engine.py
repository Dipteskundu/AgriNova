"""
AgriNova Unified Agricultural Intelligence & Farm Recommendation Pipeline
Synthesizes SPAS ML prediction, Bangladesh Crop Catalog, BARC Crop Zoning,
BARC FRG-2024 Fertilizer Engine, and Open-Meteo Weather Alerts into a cohesive response.
"""

from typing import Dict, Any, List, Optional
import logging
from prediction import get_crop_predictor
from crop_catalog import get_crop_catalog
from season_engine import get_season_engine
from barc_service import get_barc_service
from fertilizer_engine import calculate_fertilizer_plan
from weather_service import get_weather_service
from weather_engine import get_weather_alert_engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class FarmRecommendationEngine:
    """Orchestrates end-to-end multi-criteria agricultural recommendation."""

    def __init__(self):
        self.predictor = get_crop_predictor()
        self.catalog = get_crop_catalog()
        self.season_engine = get_season_engine()
        self.barc_service = get_barc_service()
        self.weather_service = get_weather_service()
        self.alert_engine = get_weather_alert_engine()

    def generate_farm_recommendation(
        self,
        field: Dict[str, Any],
        soil: Optional[Dict[str, Any]] = None,
        season: Optional[str] = None,
        irrigation_available: bool = True,
        crop_stage: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes the end-to-end multi-stage recommendation pipeline.
        """
        district = field.get("district", "Rajshahi")
        upazila = field.get("upazila")
        area = float(field.get("area", 1.0))
        area_unit = field.get("area_unit", "acre")
        latitude = field.get("latitude")
        longitude = field.get("longitude")

        # 1. Determine & Normalize Cropping Season
        target_season = self.season_engine.normalize_season(season)
        season_meta = self.season_engine.get_all_seasons_info().get(target_season, {})

        # 2. Acquire Weather Context
        weather_snapshot = self.weather_service.get_weather_forecast(district, latitude, longitude)
        curr_weather = weather_snapshot.get("current", {})
        avg_temp = curr_weather.get("temperature_c", 26.0)
        avg_rh = curr_weather.get("relative_humidity_pct", 70.0)


        print("[AI prediction diagnostic]", {
            "district": district,
            "season": target_season,
            "area": area,
            "avg_temp": avg_temp,
            "avg_humidity": avg_rh,
            "latitude": latitude,
            "longitude": longitude,
        })

        # 3. ML Top-K Candidate Generation (SPAS-Dataset-BD Model)
        raw_candidates = self.predictor.predict_top_k(
            district=district,
            season=target_season,
            area=area,
            avg_temp=avg_temp,
            avg_humidity=avg_rh,
            top_k=len(self.predictor.classes)
        )


        # 4. Filter candidates and incorporate explicit BARC suitability
        validated_candidates = []

        # Lower values mean stronger BARC suitability.
        barc_priority = {
            "Very Suitable": 0,
            "Suitable": 1,
            "Moderately Suitable": 2,
            "Marginally Suitable": 3,
            "Not Suitable": 4,
        }

        for cand in raw_candidates:
            spas_label = cand["crop"]
            cat_entry = self.catalog.normalize(spas_label)

            if not cat_entry:
                continue

            season_check = self.season_engine.check_crop_season_compatibility(
                cat_entry["canonical_name"], target_season
            )
            if not season_check["is_compatible"]:
                continue

            if (
                "boro" in cat_entry["canonical_name"].lower()
                and not irrigation_available
            ):
                continue

            # Use the explicit catalogue mapping where available.
            barc_crop_name = (
                cat_entry.get("barc_crop_name")
                or cat_entry["canonical_name"]
            )
            barc_info = self.barc_service.get_crop_suitability(
                barc_crop_name, district, upazila
            )

            suitability_class = barc_info.get(
                "suitability_class", "Unclassified"
            )
            is_tracked = barc_info.get("is_barc_tracked", False)

            # Never recommend a crop explicitly classified as unsuitable.
            if suitability_class == "Not Suitable":
                continue

            reasons = [
                (
                    f"Predicted by the ML model for {district} "
                    f"({cand['confidence_score'] * 100:.1f}% model confidence)."
                ),
                f"Compatible with the {target_season} season according to the season rules.",
            ]

            if is_tracked:
                reasons.append(
                    f"BARC Crop Zoning classifies this crop as "
                    f"'{suitability_class}' for the selected location."
                )
            else:
                reasons.append(
                    "BARC suitability could not be verified for this crop "
                    "and location."
                )

            validated_candidates.append({
                "rank": 0,  # Assigned after suitability-aware sorting.
                "canonical_name": cat_entry["canonical_name"],
                "bangla_name": cat_entry["bangla_name"],
                "spas_label": spas_label,
                "model_confidence_score": cand["confidence_score"],
                "score_label": (
                    "Model confidence score (decision support, not yield guarantee)"
                ),
                "category": cat_entry["category"],
                "barc_suitability": {
                    "is_tracked": is_tracked,
                    "suitability_class": suitability_class,
                    "suitability_level": barc_info.get(
                        "suitability_level", "Unknown"
                    ),
                },
                "season_compatibility": {
                    "is_compatible": True,
                    "target_season": target_season,
                    "lifecycle": cat_entry.get("lifecycle", {}),
                },
                "why_recommended": reasons,
                "_barc_priority": (
                    barc_priority.get(suitability_class, 5)
                    if is_tracked else 5
                ),
            })


        # Rank using local BARC evidence first; ML confidence remains supporting evidence.
        barc_scores = {
            "Very Suitable": 5,
            "Suitable": 4,
            "Moderately Suitable": 3,
            "Marginally Suitable": 2,
        }
        for item in validated_candidates:
            info = item["barc_suitability"]
            cls = info["suitability_class"]
            tracked = info["is_tracked"] and cls in barc_scores
            item["suitability_score"] = (
                barc_scores[cls] * 20 if tracked else None
            )
            item["suitability_status"] = (
                "BARC-verified for location" if tracked
                else "Unverified: BARC suitability data unavailable"
            )

        for item in validated_candidates:
            item["confidence_warning"] = (
                "Low model confidence; verify with local agricultural guidance."
                if item["model_confidence_score"] < 0.01 else None
            )

        validated_candidates.sort(
            key=lambda item: (
                item["suitability_score"] is not None,
                item["suitability_score"] if item["suitability_score"] is not None else -1,
                item["model_confidence_score"],
            ),
            reverse=True,
        )
        validated_candidates = validated_candidates[:5]


        for rank, candidate in enumerate(validated_candidates, start=1):
            candidate["rank"] = rank
            candidate.pop("_barc_priority", None)

        # Do not silently invent a fallback if no candidate passes validation.
        if not validated_candidates:
            raise ValueError(
                "No crop candidates passed season, irrigation, and BARC "
                "suitability checks for this location. Verify the farm's "
                "district/upazila and try another season."
            )

        primary_crop = validated_candidates[0]
        alternatives = validated_candidates[1:4]


        # 5. Compute BARC FRG-2024 Fertilizer Plan for Primary Crop
        fertilizer_plan = calculate_fertilizer_plan(
            crop_name=primary_crop["canonical_name"],
            area=area,
            area_unit=area_unit,
            soil_data=soil
        )

        # 6. Generate Contextual Agricultural Weather Alerts
        weather_alerts = self.alert_engine.generate_alerts(
            district=district,
            crop_name=primary_crop["canonical_name"],
            crop_stage=crop_stage,
            latitude=latitude,
            longitude=longitude
        )

        # 7. Actionable Recommendations & Warnings
        recommended_actions = [
            f"Prepare seedbed or land according to standard {target_season} schedule ({primary_crop['season_compatibility']['lifecycle'].get('transplant_window', 'standard calendar')}).",
            "Follow the split fertilizer schedule: apply all phosphate (TSP), sulfur (Gypsum), and zinc as basal dose during final plowing.",
            "Monitor local agro-meteorological advisories before top-dressing urea or applying foliar sprays."
        ]

        warnings = [
            "Model predictions represent algorithmic decision support and do NOT guarantee harvest yields or commercial profitability.",
            "Weather conditions can change rapidly; inspect real-time forecasts prior to field operations."
        ]
        if not soil:
            warnings.append("Soil test results were not provided; standard BARC medium-fertility baseline rates were applied. A local soil test from SRDI is recommended for maximum precision.")
        if not irrigation_available and target_season == "Rabi":
            warnings.append("No irrigation available in Rabi season: dry-season crops may experience drought stress without supplemental watering.")

        return {
            "primary_crop": primary_crop,
            "alternatives": alternatives,
            "model_information": self.predictor.get_model_info(),
            "season_context": {
                "season": target_season,
                "bangla_name": season_meta.get("bangla_name"),
                "duration": season_meta.get("duration"),
                "characteristics": season_meta.get("characteristics")
            },
            "barc_suitability": primary_crop["barc_suitability"],
            "fertilizer_plan": fertilizer_plan,
            "weather": weather_snapshot,
            "weather_alerts": weather_alerts,
            "actions": recommended_actions,
            "warnings": warnings,
            "sources": [
                {
                    "source_key": "SPAS_DATASET_BD",
                    "title": "SPAS-Dataset-BD (v2.0, 2025)",
                    "description": "Dataset for Smart Precision Agriculture System in Bangladesh (4,191+ records, 64 districts, BBS 2022 Yearbook and farmer survey).",
                    "url": "https://data.mendeley.com/datasets/cphdw4z5kw/2"
                },
                {
                    "source_key": "BARC_CROP_ZONING",
                    "title": "BARC Crop Zoning (Bangladesh Agricultural Research Council)",
                    "description": "Official agro-edaphic and agro-climatic land suitability assessment covering 64 districts and 467 upazilas.",
                    "url": "https://apps.barc.gov.bd/cropzoning/"
                },
                {
                    "source_key": "BARC_FRG_2024",
                    "title": "BARC Fertilizer Recommendation Guide 2024",
                    "description": "Official soil-test-based and AEZ-based fertilizer recommendation guide published October 30, 2024.",
                    "url": "https://apps.barc.gov.bd/fertilizer_recommendation/"
                },
                {
                    "source_key": "OPEN_METEO",
                    "title": "Open-Meteo Weather API",
                    "description": "Real-time non-commercial open weather and hydrological forecast API.",
                    "url": "https://open-meteo.com/"
                }
            ],
            "disclaimer": (
                "AgriNova Agricultural Intelligence Subsystem provides agro-meteorological and scientific decision support. "
                "Recommendations are based on historical government statistical datasets, official agricultural research council guidelines, "
                "and numerical weather models. Yields and cultivation success depend on localized on-farm management, seed vigor, "
                "unforeseen weather anomalies, and pest outbreaks."
            )
        }


# Singleton
_rec_engine_instance: Optional[FarmRecommendationEngine] = None


def get_farm_recommendation_engine() -> FarmRecommendationEngine:
    global _rec_engine_instance
    if _rec_engine_instance is None:
        _rec_engine_instance = FarmRecommendationEngine()
    return _rec_engine_instance


if __name__ == "__main__":
    engine = get_farm_recommendation_engine()
    result = engine.generate_farm_recommendation(
        field={"district": "Rajshahi", "upazila": "Paba", "area": 2.0, "area_unit": "acre"},
        soil={"ph": 6.5, "phosphorus": 14.0, "potassium": 0.20},
        season="Rabi",
        irrigation_available=True,
        crop_stage="Vegetative"
    )
    print("Primary Crop:", result["primary_crop"]["canonical_name"], f"({result['primary_crop']['model_confidence_score']*100:.1f}%)")
    print("BARC Suitability:", result["primary_crop"]["barc_suitability"])
    print("Alternatives Count:", len(result["alternatives"]))
    print("Fertilizer Products Count:", len(result["fertilizer_plan"].get("fertilizer_products", [])))
    print("Weather Alerts Count:", len(result["weather_alerts"]))
