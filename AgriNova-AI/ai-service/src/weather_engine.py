"""
AgriNova Agricultural Weather Alert Engine
Synthesizes real-time Open-Meteo weather forecasts with crop biological thresholds
and phenological growth stages to generate actionable agronomic alerts.
"""

from typing import Dict, Any, List, Optional
import logging
from weather_service import get_weather_service
from crop_catalog import get_crop_catalog

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Crops highly susceptible to waterlogging
WATERLOGGING_SENSITIVE_CROPS = [
    "Potato", "Potato (Irish Potato)", "Sweet Potato", "Wheat", "Lentil",
    "Mungbean", "Mustard", "Onion", "Garlic", "Chili", "Gram"
]

# Crops susceptible to wind lodging
WIND_SENSITIVE_CROPS = [
    "Maize 1", "Maize 2", "Maize (Rabi)", "Maize (Kharif)", "Banana",
    "Sugarcane", "Jute", "Green Papaya", "Ripe Papaya"
]


class WeatherAlertEngine:
    """Evaluates agro-climatic risks and formulates actionable farmer alerts."""

    def __init__(self):
        self.weather_service = get_weather_service()
        self.catalog = get_crop_catalog()

    def generate_alerts(
        self,
        district: str,
        crop_name: Optional[str] = None,
        crop_stage: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """Generates contextual agricultural alerts for a location and optional crop."""
        weather = self.weather_service.get_weather_forecast(district, latitude, longitude)
        alerts = []

        current = weather.get("current", {})
        summary = weather.get("summary", {})
        forecast_7d = weather.get("forecast_7_day", {})

        current_temp = current.get("temperature_c", 28.0)
        current_rh = current.get("relative_humidity_pct", 70.0)
        current_wind = current.get("wind_speed_kmh", 10.0)
        total_rain = summary.get("total_forecast_rain_mm", 0.0)
        max_daily_rain = summary.get("max_rain_single_day_mm", 0.0)

        # Retrieve crop envelope if crop is known
        crop_entry = self.catalog.normalize(crop_name) if crop_name else None
        crop_canonical = crop_entry["canonical_name"] if crop_entry else "General Crops"
        env = crop_entry.get("climate_envelope", {}) if crop_entry else {}
        crop_max_temp = env.get("max_temp_c", 36.0)
        crop_min_temp = env.get("min_temp_c", 10.0)

        # 1. HEAVY RAINFALL / WATERLOGGING ALERT
        if max_daily_rain >= 35.0 or total_rain >= 70.0:
            is_sensitive = any(s.lower() in crop_canonical.lower() for s in WATERLOGGING_SENSITIVE_CROPS)
            severity = "High" if is_sensitive else "Moderate"
            action = (
                f"Heavy precipitation expected ({max_daily_rain} mm max/day, {total_rain} mm total over 7 days). "
                f"Immediately halt all planned irrigation. Ensure field drainage ditches and outlets are unblocked "
                f"to prevent root asphyxiation and soil-borne fungal rots."
            )
            if crop_stage:
                action += f" For {crop_canonical} at {crop_stage} stage, water stagnation beyond 24 hours causes severe yield decline."

            alerts.append({
                "alert_type": "Heavy Rainfall & Waterlogging Advisory",
                "severity": severity,
                "headline": f"Significant rainfall forecast for {district}",
                "trigger_value": f"{max_daily_rain} mm/day (7-day total: {total_rain} mm)",
                "recommended_action": action,
                "scientific_rationale": "Excess soil moisture drives anaerobic root conditions, reducing nutrient uptake and promoting Pythium/Phytophthora damping-off."
            })

        # 2. HEAT STRESS ALERT
        max_temps = forecast_7d.get("temp_max_c", [current_temp])
        peak_temp = max(max_temps) if max_temps else current_temp
        if peak_temp >= crop_max_temp or peak_temp >= 35.5:
            severity = "High" if peak_temp >= 38.0 else "Moderate"
            alerts.append({
                "alert_type": "High Temperature / Heat Stress Warning",
                "severity": severity,
                "headline": f"Extreme heat forecast reaching {peak_temp}°C",
                "trigger_value": f"Forecast max {peak_temp}°C (Crop threshold: {crop_max_temp}°C)",
                "recommended_action": (
                    f"Irrigate during late evening or early morning to maintain root-zone soil coolness. "
                    f"Avoid midday foliar nutrient or pesticide applications to prevent leaf scorching."
                ),
                "scientific_rationale": "High temperature during reproductive stages causes pollen desiccation, spikelet sterility in cereals, and blossom drop in vegetables."
            })

        # 3. HIGH WIND / STORM ALERT
        max_winds = forecast_7d.get("wind_speed_max_kmh", [current_wind])
        peak_wind = max(max_winds) if max_winds else current_wind
        if peak_wind >= 32.0:
            severity = "High" if peak_wind >= 45.0 else "Moderate"
            is_wind_sensitive = any(s.lower() in crop_canonical.lower() for s in WIND_SENSITIVE_CROPS)
            rec = f"Strong wind gusts expected (up to {peak_wind} km/h). Postpone aerial spraying. "
            if is_wind_sensitive:
                rec += f"Provide bamboo staking or soil earthing up for {crop_canonical} to mitigate lodging risk."
            else:
                rec += "Avoid over-saturating soil before wind events to maintain root anchoring strength."

            alerts.append({
                "alert_type": "High Wind / Squall Lodging Advisory",
                "severity": severity,
                "headline": f"Strong winds forecast up to {peak_wind} km/h",
                "trigger_value": f"{peak_wind} km/h",
                "recommended_action": rec,
                "scientific_rationale": "Saturated root zones combined with gusts exceed stem shear strength, causing mechanical lodging and crop loss."
            })

        # 4. COLD FOG / DISEASE VULNERABILITY (Late Blight / Fungal Rust)
        min_temps = forecast_7d.get("temp_min_c", [18.0])
        coldest = min(min_temps) if min_temps else 18.0
        if coldest <= 14.0 and current_rh >= 80.0:
            is_potato_wheat = any(k in crop_canonical.lower() for k in ["potato", "wheat", "tomato"])
            severity = "High" if is_potato_wheat else "Moderate"
            alerts.append({
                "alert_type": "Cool Humid Microclimate / Fungal Blight Risk",
                "severity": severity,
                "headline": "Cold and humid atmospheric conditions favorable to fungal pathogens",
                "trigger_value": f"Min Temp {coldest}°C with RH {current_rh}%",
                "recommended_action": (
                    f"Carefully scout fields for early signs of Late Blight (water-soaked lesions on leaf tips) "
                    f"or powdery/leaf rust. If disease symptoms appear, consider protective contact fungicide application."
                ),
                "scientific_rationale": "Prolonged leaf wetness under cool temperatures (10-15°C) satisfies the epidemiological criteria for Phytophthora sporulation."
            })

        # 5. DRY SPELL / DROUGHT ADVISORY
        if total_rain < 2.0 and peak_temp >= 26.0:
            alerts.append({
                "alert_type": "Dry Spell / Irrigation Advisory",
                "severity": "Low",
                "headline": f"Dry weather conditions forecast across {district}",
                "trigger_value": f"{total_rain} mm rain expected over 7 days",
                "recommended_action": "Ensure scheduled irrigation according to crop stage, especially during vegetative branching and flowering.",
                "scientific_rationale": "Evapotranspiration deficit depletes topsoil available water, triggering stomatal closure and reduced photosynthesis."
            })

        return alerts


# Singleton
_alert_engine_instance: Optional[WeatherAlertEngine] = None


def get_weather_alert_engine() -> WeatherAlertEngine:
    global _alert_engine_instance
    if _alert_engine_instance is None:
        _alert_engine_instance = WeatherAlertEngine()
    return _alert_engine_instance


if __name__ == "__main__":
    engine = get_weather_alert_engine()
    alerts = engine.generate_alerts("Rajshahi", crop_name="Potato", crop_stage="Tuber Bulking")
    print(f"Generated {len(alerts)} alerts for Potato in Rajshahi:")
    for a in alerts:
        print(f"  [{a['severity']}] {a['alert_type']}: {a['headline']}")
        print(f"      Action: {a['recommended_action'][:120]}...")
