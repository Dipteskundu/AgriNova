"""
AgriNova BARC Crop Suitability Service
Provides official Bangladesh Agricultural Research Council (BARC) crop zoning
suitability lookups for 64 districts and 467 upazilas across 15 core crops.
"""

from pathlib import Path
from typing import Dict, Any, Optional
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BARC_JSON_PATH = Path(__file__).resolve().parent.parent / "data" / "processed" / "barc_crop_zoning.json"


class BarcSuitabilityService:
    """Provides authoritative lookups from BARC Crop Zoning datasets."""

    def __init__(self, json_path: Path = BARC_JSON_PATH):
        if not json_path.exists():
            logger.warning(f"BARC database not found at {json_path}. Running downloader...")
            from barc_downloader import download_and_parse_barc
            self.db = download_and_parse_barc()
        else:
            with open(json_path, "r", encoding="utf-8") as f:
                self.db = json.load(f)

        self.crops_tracked = list(self.db.get("crops", {}).keys())
        logger.info(f"Loaded BARC Suitability Service with {len(self.crops_tracked)} crops")

    def get_crop_suitability(
        self,
        crop_name: str,
        district: str,
        upazila: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Looks up official BARC crop suitability.
        Preserves original BARC classifications without fake probabilities.
        """

        clean_crop = str(crop_name).strip()
        clean_district = str(district).strip().title()
        clean_upazila = str(upazila).strip().title() if upazila else None

        # Normalize common district-name variants to the names in the BARC dataset.
        district_aliases = {
            "Bogura": "Bogra",
        }
        clean_district = district_aliases.get(clean_district, clean_district)


        # Resolve BARC crop mapping (bidirectional match)
        barc_crop_key = None
        for k in self.crops_tracked:
            if clean_crop.lower() == k.lower():
                barc_crop_key = k
                break
            if k.lower() in clean_crop.lower() or clean_crop.lower() in k.lower():
                barc_crop_key = k
                break

        # Handle Onion / Garlic combined BARC table
        if clean_crop.lower() in ["onion", "garlic"]:
            barc_crop_key = "Onion and Garlic"
        elif clean_crop.lower() in ["mustard", "rape & mustard"]:
            barc_crop_key = "Mustard"
        elif clean_crop.lower() in ["chickpea", "gram"]:
            barc_crop_key = "Gram"
        elif clean_crop.lower() in ["mungbean", "mug"]:
            barc_crop_key = "Mungbean"

        if not barc_crop_key or barc_crop_key not in self.db.get("crops", {}):
            return {
                "crop": crop_name,
                "is_barc_tracked": False,
                "suitability_class": "Not tracked in official BARC Crop Zoning",
                "suitability_level": "Unclassified",
                "details": "This crop is not one of the 16 core crops evaluated under BARC National Crop Zoning. SPAS historical cultivation data applies.",
                "source": "BARC Crop Zoning (Official)"
            }

        crop_data = self.db["crops"][barc_crop_key]

        # Match District
        dist_match = None
        for d in crop_data.keys():
            if d.lower() == clean_district.lower():
                dist_match = d
                break

        if not dist_match:
            return {
                "crop": barc_crop_key,
                "district": district,
                "is_barc_tracked": True,
                "suitability_class": "District data unavailable in BARC records",
                "suitability_level": "Unknown",
                "source": "BARC Crop Zoning (Official)"
            }

        dist_data = crop_data[dist_match]

        # If upazila specified, match upazila
        if clean_upazila and "upazilas" in dist_data:
            for up, up_info in dist_data["upazilas"].items():
                if clean_upazila.lower() in up.lower() or up.lower() in clean_upazila.lower():
                    return {
                        "crop": barc_crop_key,
                        "district": dist_match,
                        "upazila": up,
                        "is_barc_tracked": True,
                        "suitability_class": up_info["primary_suitability"],
                        "suitability_level": up_info["suitability_level"],
                        "area_breakdown_ha": up_info["areas_ha"],
                        "total_upazila_ha": up_info["total_area_ha"],
                        "source": "BARC Crop Zoning (Official)"
                    }

        # Return district level summary
        totals = dist_data["district_totals"]
        overall = dist_data.get("overall_district_suitability", "Suitable")

        return {
            "crop": barc_crop_key,
            "district": dist_match,
            "upazila": None,
            "is_barc_tracked": True,
            "suitability_class": overall,
            "suitability_level": "High" if overall == "Suitable" else ("Moderate" if overall == "Moderately Suitable" else "Low"),
            "district_totals_ha": totals,
            "source": "BARC Crop Zoning (Official)"
        }


# Singleton
_barc_service_instance: Optional[BarcSuitabilityService] = None


def get_barc_service() -> BarcSuitabilityService:
    global _barc_service_instance
    if _barc_service_instance is None:
        _barc_service_instance = BarcSuitabilityService()
    return _barc_service_instance


if __name__ == "__main__":
    service = get_barc_service()
    res = service.get_crop_suitability("Wheat", "Rajshahi")
    print("Wheat in Rajshahi:", res["suitability_class"], "-", res["suitability_level"])
    res_up = service.get_crop_suitability("Potato", "Barisal", "Babuganj")
    print("Potato in Barisal (Babuganj):", res_up["suitability_class"], "-", res_up["suitability_level"])
