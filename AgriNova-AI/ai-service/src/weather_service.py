"""
AgriNova Open-Meteo Weather Service
Fetches real-time agro-meteorological forecasts for all 64 Bangladesh districts,
manages local caching with 1-hour TTL, and handles network timeouts gracefully.
"""

from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
import json
import logging
import urllib.request
import urllib.parse
import ssl

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

CACHE_FILE = Path(__file__).resolve().parent.parent / "data" / "processed" / "weather_cache.json"

# Authoritative Centroid Coordinates for all 64 Bangladesh Districts
BANGLADESH_DISTRICT_COORDS = {
    "Bagerhat": (22.6602, 89.7895), "Bandarban": (22.1953, 92.2184), "Barguna": (22.1587, 90.1264),
    "Barisal": (22.7010, 90.3535), "Barishal": (22.7010, 90.3535), "Bhola": (22.6859, 90.6481),
    "Bogura": (24.8465, 89.3777), "Bogra": (24.8465, 89.3777), "Brahmanbaria": (23.9608, 91.1115),
    "Chandpur": (23.2333, 90.6667), "Chapai Nawabganj": (24.5965, 88.2775), "Nawabganj": (24.5965, 88.2775),
    "Chattogram": (22.3569, 91.7832), "Chittagong": (22.3569, 91.7832), "Chuadanga": (23.6402, 88.8418),
    "CoxsBazar": (21.4272, 92.0058), "Cox's Bazar": (21.4272, 92.0058), "Cumilla": (23.4607, 91.1809),
    "Comilla": (23.4607, 91.1809), "Dhaka": (23.8103, 90.4125), "Dinajpur": (25.6217, 88.6355),
    "Faridpur": (23.6071, 89.8429), "Feni": (23.0159, 91.3976), "Gaibandha": (25.3288, 89.5430),
    "Gazipur": (24.0023, 90.4267), "Gopalganj": (23.0051, 89.8266), "Habiganj": (24.3749, 91.4155),
    "Jamalpur": (24.9375, 89.9378), "Jashore": (23.1664, 89.2081), "Jessore": (23.1664, 89.2081),
    "Jhallokati": (22.6406, 90.1987), "Jhalokati": (22.6406, 90.1987), "Jhenaidah": (23.5450, 89.1726),
    "Joypurhat": (25.0968, 89.0227), "Khagrachari": (23.1193, 91.9847), "Khulna": (22.8456, 89.5403),
    "Kishoreganj": (24.4449, 90.7766), "Kurigram": (25.8054, 89.6362), "Kushtia": (23.9013, 89.1205),
    "Lakshmipur": (22.9425, 90.8412), "Lalmonirhat": (25.9923, 89.2847), "Madaripur": (23.1641, 90.1897),
    "Magura": (23.4873, 89.4198), "Manikganj": (23.8644, 90.0047), "Meherpur": (23.7622, 88.6318),
    "Moulvibazar": (24.4829, 91.7774), "Munshiganj": (23.5422, 90.5305), "Mymensingh": (24.7471, 90.4203),
    "Naogaon": (24.7936, 88.9318), "Narail": (23.1725, 89.5127), "Narayanganj": (23.6337, 90.4965),
    "Narsingdi": (23.9322, 90.7154), "Natore": (24.4206, 88.9324), "Netrokona": (24.8709, 90.7279),
    "Nilphamari": (25.9318, 88.8560), "Noakhali": (22.8696, 91.0994), "Pabna": (24.0064, 89.2372),
    "Panchagar": (26.3411, 88.5542), "Panchagarh": (26.3411, 88.5542), "Patuakhali": (22.3596, 90.3299),
    "Pirojpur": (22.5841, 89.9720), "Rajbari": (23.7574, 89.6445), "Rajshahi": (24.3745, 88.6042),
    "Rangamati": (22.6533, 92.1753), "Rangpur": (25.7439, 89.2752), "Satkhira": (22.7185, 89.0705),
    "Shariatpur": (23.2423, 90.4348), "Sherpur": (25.0205, 90.0153), "Sirajganj": (24.4534, 89.7008),
    "Sunamganj": (25.0658, 91.3950), "Sylhet": (24.8949, 91.8687), "Tangail": (24.2513, 89.9167),
    "Thakurgaon": (26.0337, 88.4617)
}


class WeatherService:
    """Manages weather data acquisition from Open-Meteo with local file caching."""

    def __init__(self, cache_file: Path = CACHE_FILE):
        self.cache_file = cache_file
        self.cache = self._load_cache()

    def _load_cache(self) -> Dict[str, Any]:
        if self.cache_file.exists():
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load weather cache: {e}")
        return {}

    def _save_cache(self):
        self.cache_file.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            logger.warning(f"Failed to save weather cache: {e}")

    def get_coordinates_for_district(self, district: str) -> Tuple[float, float]:
        """Resolves district name to lat/lon coordinates."""
        clean = " ".join(str(district).strip().casefold().split())
        normalized_coords = {
            " ".join(name.casefold().split()).replace("’", "'"): coords
            for name, coords in BANGLADESH_DISTRICT_COORDS.items()
        }
        clean = clean.replace("’", "'")
        if clean in normalized_coords:
            return normalized_coords[clean]
        # Fallback to Dhaka centroid
        logger.warning(f"District '{district}' not recognized; defaulting coordinates to Dhaka centroid.")
        return BANGLADESH_DISTRICT_COORDS["Dhaka"]

    def get_weather_forecast(
        self,
        district: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        max_cache_age_seconds: int = 3600
    ) -> Dict[str, Any]:
        """
        Fetches current weather and 7-day daily forecast from Open-Meteo.
        Caches responses for 1 hour to prevent redundant external API calls.
        """
        if latitude is None or longitude is None:
            lat, lon = self.get_coordinates_for_district(district)
        else:
            lat, lon = float(latitude), float(longitude)

        cache_key = f"{district.strip().casefold()}_{round(lat, 2)}_{round(lon, 2)}"
        now_ts = datetime.now(timezone.utc).timestamp()

        # Check Cache
        cached_entry = self.cache.get(cache_key)
        if cached_entry:
            retrieved_at = cached_entry.get("retrieved_at_timestamp", 0)
            if (now_ts - retrieved_at) < max_cache_age_seconds:
                logger.info(f"Returning cached weather for key {cache_key} ({district})")
                return cached_entry["data"]

        # Build Open-Meteo Query
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&"
            f"daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&"
            f"timezone=Asia%2FDhaka"
        )

        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        try:
            req = urllib.request.Request(url, headers={"User-Agent": "AgriNova-Platform/1.0"})
            with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
                raw_data = json.loads(resp.read().decode("utf-8"))
                
                current = raw_data.get("current", {})
                daily = raw_data.get("daily", {})

                # Construct clean agro-meteorological snapshot
                weather_snapshot = {
                    "source": "Open-Meteo (No-Key Non-Commercial Free API)",
                    "source_url": "https://open-meteo.com/",
                    "location": {
                        "district": district,
                        "latitude": lat,
                        "longitude": lon,
                        "timezone": raw_data.get("timezone", "Asia/Dhaka")
                    },
                    "current": {
                        "temperature_c": current.get("temperature_2m"),
                        "relative_humidity_pct": current.get("relative_humidity_2m"),
                        "precipitation_mm": current.get("precipitation"),
                        "wind_speed_kmh": current.get("wind_speed_10m"),
                        "weather_code": current.get("weather_code")
                    },
                    "forecast_7_day": {
                        "dates": daily.get("time", []),
                        "temp_max_c": daily.get("temperature_2m_max", []),
                        "temp_min_c": daily.get("temperature_2m_min", []),
                        "precipitation_sum_mm": daily.get("precipitation_sum", []),
                        "precipitation_prob_pct": daily.get("precipitation_probability_max", []),
                        "wind_speed_max_kmh": daily.get("wind_speed_10m_max", [])
                    },
                    "summary": {
                        "avg_next_7_days_temp": round(float(sum(daily.get("temperature_2m_max", [28])) / max(1, len(daily.get("temperature_2m_max", [1])))), 1),
                        "total_forecast_rain_mm": round(float(sum(daily.get("precipitation_sum", [0]))), 1),
                        "max_rain_single_day_mm": max(daily.get("precipitation_sum", [0])) if daily.get("precipitation_sum") else 0.0
                    },
                    "retrieved_at": datetime.now(timezone.utc).isoformat()
                }

                # Update cache
                self.cache[cache_key] = {
                    "retrieved_at_timestamp": now_ts,
                    "data": weather_snapshot
                }
                self._save_cache()
                logger.info(f"Fetched live weather from Open-Meteo for {district}")
                return weather_snapshot

        except Exception as e:
            logger.error(f"Open-Meteo API query failed for {district}: {e}")
            # If cache exists (even if expired), return it gracefully
            if cached_entry:
                logger.warning(f"Falling back to stale weather cache for {district}")
                return cached_entry["data"]

            # Degrade gracefully with regional seasonal baseline
            return {
                "source": "Open-Meteo Fallback (Offline Estimation)",
                "location": {"district": district, "latitude": lat, "longitude": lon},
                "current": {
                    "temperature_c": 28.0,
                    "relative_humidity_pct": 70.0,
                    "precipitation_mm": 0.0,
                    "wind_speed_kmh": 8.0
                },
                "forecast_7_day": {"dates": [], "precipitation_sum_mm": []},
                "summary": {"total_forecast_rain_mm": 0.0, "max_rain_single_day_mm": 0.0},
                "note": "Live weather service currently unreachable; standard regional climatology applied."
            }


# Singleton
_weather_service_instance: Optional[WeatherService] = None


def get_weather_service() -> WeatherService:
    global _weather_service_instance
    if _weather_service_instance is None:
        _weather_service_instance = WeatherService()
    return _weather_service_instance


if __name__ == "__main__":
    ws = get_weather_service()
    data = ws.get_weather_forecast("Rajshahi")
    print(f"Weather for Rajshahi: Temp {data['current']['temperature_c']}°C, Humidity {data['current']['relative_humidity_pct']}%, Rain next 7 days: {data['summary']['total_forecast_rain_mm']} mm")
