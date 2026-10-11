"""
AgriNova Bangladesh Agricultural Season Engine
Validates crop compatibility across Bangladesh's agricultural seasons:
Kharif 1 (Pre-Monsoon), Kharif 2 (Monsoon), and Rabi (Winter).
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date
import logging
from crop_catalog import get_crop_catalog

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Official Bangladesh Cropping Seasons
SEASONS_METADATA = {
    "Kharif 1": {
        "bangla_name": "খরিপ-১ (গ্রীষ্মকালীন)",
        "duration": "Mid-March to Mid-July",
        "months": [3, 4, 5, 6, 7],
        "rice_season": "Aus",
        "characteristics": "Rising temperature, intermittent pre-monsoon showers, high humidity."
    },
    "Kharif 2": {
        "bangla_name": "খরিপ-২ (বর্ষাকালীন)",
        "duration": "Mid-July to Mid-November",
        "months": [7, 8, 9, 10, 11],
        "rice_season": "Aman",
        "characteristics": "Heavy monsoon rainfall, high humidity, waterlogging risk."
    },
    "Rabi": {
        "bangla_name": "রবি (শীতকালীন)",
        "duration": "Mid-November to Mid-March",
        "months": [11, 12, 1, 2, 3],
        "rice_season": "Boro",
        "characteristics": "Cool and dry climate, minimal rainfall, irrigation dependent."
    }
}


SEASON_ALIASES = {
    # Kharif 1 — pre-monsoon / early summer
    "kharif 1": "Kharif 1",
    "kharif-1": "Kharif 1",
    "kharif1": "Kharif 1",
    "kharif-1 (early summer)": "Kharif 1",
    "kharif 1 (early summer)": "Kharif 1",
    "kharif 1 (pre-monsoon)": "Kharif 1",
    "aus": "Kharif 1",
    "summer": "Kharif 1",
    "pre-monsoon": "Kharif 1",

    # Kharif 2 — monsoon
    "kharif 2": "Kharif 2",
    "kharif-2": "Kharif 2",
    "kharif2": "Kharif 2",
    "kharif-2 (monsoon)": "Kharif 2",
    "kharif 2 (monsoon)": "Kharif 2",
    "aman": "Kharif 2",
    "monsoon": "Kharif 2",

    # Rabi — winter
    "rabi": "Rabi",
    "rabi (winter)": "Rabi",
    "rabi winter": "Rabi",
    "boro": "Rabi",
    "winter": "Rabi",
}



class SeasonEngine:
    """Manages season determination, canonical mapping, and crop compatibility checks."""

    def __init__(self):
        self.catalog = get_crop_catalog()

    def normalize_season(self, season_input: Optional[str]) -> str:
        """Normalizes user season string to canonical 'Kharif 1', 'Kharif 2', or 'Rabi'."""
        if not season_input:
            return self.get_current_season()
        clean = str(season_input).strip().lower()
        return SEASON_ALIASES.get(clean, self.get_current_season())

    def get_current_season(self, current_date: Optional[date] = None) -> str:
        """Determines current Bangladesh agricultural season based on calendar date."""
        if current_date is None:
            current_date = date.today()
        month = current_date.month

        # November to February -> Rabi
        if month in [11, 12, 1, 2]:
            return "Rabi"
        # March to June -> Kharif 1
        elif month in [3, 4, 5, 6]:
            return "Kharif 1"
        # July to October -> Kharif 2
        else:
            return "Kharif 2"

    def check_crop_season_compatibility(self, crop_name: str, target_season: str) -> Dict[str, Any]:
        """
        Validates whether a crop is compatible with the requested season.
        Returns compatibility flag, verified seasons, and agronomic guidance.
        """
        canonical_season = self.normalize_season(target_season)
        crop_entry = self.catalog.normalize(crop_name)

        if not crop_entry:
            return {
                "crop": crop_name,
                "target_season": canonical_season,
                "is_compatible": False,
                "reason": f"Crop '{crop_name}' not found in Bangladesh crop catalog.",
                "verified_seasons": []
            }

        verified_seasons = crop_entry.get("verified_seasons", [])
        
        # Check direct or alias match
        is_compat = False
        for s in verified_seasons:
            if self.normalize_season(s) == canonical_season:
                is_compat = True
                break

        if is_compat:
            reason = f"Verified compatible with {canonical_season} season in Bangladesh."
        else:
            reason = (
                f"Agronomic mismatch: {crop_entry['canonical_name']} is typically cultivated in "
                f"{', '.join(verified_seasons)}, not {canonical_season}."
            )

        return {
            "crop": crop_entry["canonical_name"],
            "spas_label": crop_entry["spas_label"],
            "target_season": canonical_season,
            "is_compatible": is_compat,
            "reason": reason,
            "verified_seasons": verified_seasons,
            "lifecycle": crop_entry.get("lifecycle", {})
        }

    def get_all_seasons_info(self) -> Dict[str, Any]:
        return SEASONS_METADATA


# Singleton
_season_engine_instance: Optional[SeasonEngine] = None


def get_season_engine() -> SeasonEngine:
    global _season_engine_instance
    if _season_engine_instance is None:
        _season_engine_instance = SeasonEngine()
    return _season_engine_instance


if __name__ == "__main__":
    engine = get_season_engine()
    print("Current Season:", engine.get_current_season())
    test_potato = engine.check_crop_season_compatibility("Potato", "Rabi")
    print("Potato in Rabi:", test_potato["is_compatible"], "-", test_potato["reason"])
    test_potato_summer = engine.check_crop_season_compatibility("Potato", "Kharif 2")
    print("Potato in Kharif 2:", test_potato_summer["is_compatible"], "-", test_potato_summer["reason"])
