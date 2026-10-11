"""
AgriNova BARC Crop Zoning Data Downloader & Parser
Downloads official BARC Crop Zone spreadsheets (.xls), parses Upazila and District suitability,
and compiles the authoritative Bangladesh Crop Zoning Knowledge Base.
"""

from pathlib import Path
from typing import Dict, Any, List
import ssl
import json
import logging
import urllib.request
import xlrd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BARC_RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw" / "barc"
BARC_PROCESSED_FILE = Path(__file__).resolve().parent.parent / "data" / "processed" / "barc_crop_zoning.json"
BARC_RAW_DIR.mkdir(parents=True, exist_ok=True)
BARC_PROCESSED_FILE.parent.mkdir(parents=True, exist_ok=True)

BARC_CROPS = {
    "Aus": "https://apps.barc.gov.bd/cropzoning/files/data/Aus-zone.xls",
    "Aman": "https://apps.barc.gov.bd/cropzoning/files/data/Aman-zone.xls",
    "Boro": "https://apps.barc.gov.bd/cropzoning/files/data/Boro-zone.xls",
    "Wheat": "https://apps.barc.gov.bd/cropzoning/files/data/Wheat-zone.xls",
    "Maize": "https://apps.barc.gov.bd/cropzoning/files/data/Maize-zone.xls",
    "Potato": "https://apps.barc.gov.bd/cropzoning/files/data/Potato-zone.xls",
    "Lentil": "https://apps.barc.gov.bd/cropzoning/files/data/Lentil-zone.xls",
    "Mungbean": "https://apps.barc.gov.bd/cropzoning/files/data/Mung-zone.xls",
    "Gram": "https://apps.barc.gov.bd/cropzoning/files/data/Gram-zone.xls",
    "Mustard": "https://apps.barc.gov.bd/cropzoning/files/data/Mustard-zone.xls",
    "Groundnut": "https://apps.barc.gov.bd/cropzoning/files/data/Groundnut-zone.xls",
    "Chili": "https://apps.barc.gov.bd/cropzoning/files/data/Chili-zone.xls",
    "Onion and Garlic": "https://apps.barc.gov.bd/cropzoning/files/data/Oni-Gar-zone.xls",
    "Sugarcane": "https://apps.barc.gov.bd/cropzoning/files/data/Sugarcane-zone.xls",
    "Jute": "https://apps.barc.gov.bd/cropzoning/files/data/Jute-zone.xls"
}


def download_and_parse_barc():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    zoning_db: Dict[str, Any] = {
        "metadata": {
            "source": "BARC Crop Zoning (Bangladesh Agricultural Research Council)",
            "source_url": "https://apps.barc.gov.bd/cropzoning/",
            "num_crops": len(BARC_CROPS),
            "suitability_classes": [
                "Very Suitable", "Suitable", "Moderately Suitable", "Marginally Suitable", "Not Suitable"
            ]
        },
        "crops": {}
    }

    for crop_name, url in BARC_CROPS.items():
        xls_path = BARC_RAW_DIR / f"{crop_name.replace(' ', '_')}.xls"
        if not xls_path.exists():
            logger.info(f"Downloading BARC data for {crop_name} from {url}...")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
                    content = resp.read()
                    with open(xls_path, "wb") as f:
                        f.write(content)
                logger.info(f"Saved {xls_path} ({len(content)} bytes)")
            except Exception as e:
                logger.error(f"Failed to download {crop_name}: {e}")
                continue

        # Parse XLS
        try:
            wb = xlrd.open_workbook(xls_path)
            sheet = wb.sheet_by_index(0)
            
            crop_records = {}
            for r in range(1, sheet.nrows):
                row = sheet.row_values(r)
                if len(row) < 7:
                    continue
                district = str(row[0]).strip().title()
                upazila = str(row[1]).strip().title()
                
                try:
                    very_s = float(row[2])
                    s = float(row[3])
                    mod_s = float(row[4])
                    marg_s = float(row[5]) if len(row) > 7 else 0.0
                    not_s = float(row[6]) if len(row) > 7 else float(row[5])
                    total = float(row[7]) if len(row) > 7 else (very_s + s + mod_s + marg_s + not_s)
                except (ValueError, TypeError):
                    continue

                # Determine primary suitability category
                # If very_s + s > 50% of total area or > mod_s -> Suitable
                # Categorize according to maximum area share
                area_breakdown = {
                    "Very Suitable": very_s,
                    "Suitable": s,
                    "Moderately Suitable": mod_s,
                    "Marginally Suitable": marg_s,
                    "Not Suitable": not_s
                }
                primary_class = max(area_breakdown, key=area_breakdown.get)
                
                # S1/S2 dominant flag
                suitable_area = very_s + s
                suitability_level = "High" if suitable_area > (mod_s + not_s) else ("Moderate" if mod_s > not_s else "Low")

                if district not in crop_records:
                    crop_records[district] = {"upazilas": {}, "district_totals": {
                        "Very Suitable": 0.0, "Suitable": 0.0, "Moderately Suitable": 0.0,
                        "Marginally Suitable": 0.0, "Not Suitable": 0.0, "Total Area": 0.0
                    }}

                crop_records[district]["upazilas"][upazila] = {
                    "primary_suitability": primary_class,
                    "suitability_level": suitability_level,
                    "areas_ha": area_breakdown,
                    "total_area_ha": total
                }

                for k, v in area_breakdown.items():
                    crop_records[district]["district_totals"][k] += v
                crop_records[district]["district_totals"]["Total Area"] += total

            # Compute overall district suitability
            for dist, data in crop_records.items():
                totals = data["district_totals"]
                suitable_sum = totals["Very Suitable"] + totals["Suitable"]
                unsuitable_sum = totals["Not Suitable"]
                if suitable_sum > totals["Moderately Suitable"] and suitable_sum > unsuitable_sum:
                    data["overall_district_suitability"] = "Suitable"
                elif totals["Moderately Suitable"] > unsuitable_sum:
                    data["overall_district_suitability"] = "Moderately Suitable"
                else:
                    data["overall_district_suitability"] = "Marginally Suitable"

            zoning_db["crops"][crop_name] = crop_records
            logger.info(f"Successfully processed BARC zoning for {crop_name}: {len(crop_records)} districts")

        except Exception as e:
            logger.error(f"Error parsing {xls_path}: {e}")

    with open(BARC_PROCESSED_FILE, "w", encoding="utf-8") as f:
        json.dump(zoning_db, f, indent=2)

    logger.info(f"Saved complete BARC Crop Zoning database to {BARC_PROCESSED_FILE}")
    return zoning_db


if __name__ == "__main__":
    download_and_parse_barc()
