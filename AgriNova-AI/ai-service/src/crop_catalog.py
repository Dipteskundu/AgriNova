"""
AgriNova Bangladesh Crop Catalog & Normalization Service
Canonical mapping of 72 SPAS Bangladesh crops and BARC official crops, aliases, Bangla names,
SPAS labels, BARC equivalents, verified seasons, and phenological lifecycles.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

CATALOG_PATH = Path(__file__).resolve().parent.parent / "data" / "processed" / "crop_catalog.json"
SPAS_CLEANED_PATH = Path(__file__).resolve().parent.parent / "data" / "processed" / "spas_cleaned.csv"


CROP_TAXONOMY_OVERRIDE = {
    "Aman": {
        "canonical_name": "Aman Rice",
        "bangla_name": "আমন ধান",
        "aliases": ["aman", "roba aman", "broadcast aman", "aman rice"],
        "barc_crop": "Aman",
        "category": "Cereal",
        "verified_seasons": ["Kharif 2", "Aman"],
        "has_frg_fertilizer": True
    },
    "Boro": {
        "canonical_name": "Boro Rice",
        "bangla_name": "বোরো ধান",
        "aliases": ["boro", "boro dhan", "boro rice", "winter rice"],
        "barc_crop": "Boro",
        "category": "Cereal",
        "verified_seasons": ["Rabi", "Boro"],
        "has_frg_fertilizer": True
    },
    "Aus": {
        "canonical_name": "Aus Rice",
        "bangla_name": "আউশ ধান",
        "aliases": ["aus", "aus dhan", "aus rice", "summer rice"],
        "barc_crop": "Aus",
        "category": "Cereal",
        "verified_seasons": ["Kharif 1", "Aus"],
        "has_frg_fertilizer": True
    },
    "Wheat": {
        "canonical_name": "Wheat",
        "bangla_name": "গম",
        "aliases": ["wheat", "gom"],
        "barc_crop": "Wheat",
        "category": "Cereal",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Maize 1": {
        "canonical_name": "Maize (Rabi)",
        "bangla_name": "ভুট্টা (রবি)",
        "aliases": ["maize 1", "rabi maize", "corn"],
        "barc_crop": "Maize",
        "category": "Cereal",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Maize 2": {
        "canonical_name": "Maize (Kharif)",
        "bangla_name": "ভুট্টা (খরিফ)",
        "aliases": ["maize 2", "summer maize", "kharif maize"],
        "barc_crop": "Maize",
        "category": "Cereal",
        "verified_seasons": ["Kharif 1", "Kharif 2"],
        "has_frg_fertilizer": True
    },
    "Sweet Potato": {
        "canonical_name": "Sweet Potato",
        "bangla_name": "মিষ্টি আলু",
        "aliases": ["sweet potato", "misti alu", "sakarkand"],
        "barc_crop": None,
        "category": "Tuber",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Lentil": {
        "canonical_name": "Lentil",
        "bangla_name": "মসুর ডাল",
        "aliases": ["lentil", "mosur", "masur dal"],
        "barc_crop": "Lentil",
        "category": "Pulse",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Mug": {
        "canonical_name": "Mungbean",
        "bangla_name": "মুগ ডাল",
        "aliases": ["mug", "mung", "mungbean", "mug dal"],
        "barc_crop": "Mungbean",
        "category": "Pulse",
        "verified_seasons": ["Kharif 1", "Rabi"],
        "has_frg_fertilizer": True
    },
    "Gram": {
        "canonical_name": "Chickpea (Gram)",
        "bangla_name": "ছোলা / বুট",
        "aliases": ["gram", "chola", "chana", "chickpea", "boot"],
        "barc_crop": "Gram",
        "category": "Pulse",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Rape & Mustard": {
        "canonical_name": "Mustard",
        "bangla_name": "সরিষা",
        "aliases": ["mustard", "sorisha", "shorshe", "sarson", "rape & mustard"],
        "barc_crop": "Mustard",
        "category": "Oilseed",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Groundnut": {
        "canonical_name": "Groundnut (Peanut)",
        "bangla_name": "চীনাবাদাম",
        "aliases": ["groundnut", "chinabadam", "peanut", "badam"],
        "barc_crop": "Groundnut",
        "category": "Oilseed",
        "verified_seasons": ["Rabi", "Kharif 1"],
        "has_frg_fertilizer": True
    },
    "Sesame": {
        "canonical_name": "Sesame",
        "bangla_name": "তিল",
        "aliases": ["sesame", "til"],
        "barc_crop": None,
        "category": "Oilseed",
        "verified_seasons": ["Kharif 1", "Rabi"],
        "has_frg_fertilizer": True
    },
    "Chili": {
        "canonical_name": "Chili",
        "bangla_name": "মরিচ",
        "aliases": ["chili", "chilli", "morich", "kacha morich"],
        "barc_crop": "Chili",
        "category": "Spice",
        "verified_seasons": ["Rabi", "Kharif 1"],
        "has_frg_fertilizer": True
    },
    "Onion": {
        "canonical_name": "Onion",
        "bangla_name": "পেঁয়াজ",
        "aliases": ["onion", "peyaj", "piaj"],
        "barc_crop": "Onion and Garlic",
        "category": "Spice",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Garlic": {
        "canonical_name": "Garlic",
        "bangla_name": "রসুন",
        "aliases": ["garlic", "roshun", "roshon"],
        "barc_crop": "Onion and Garlic",
        "category": "Spice",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Ginger": {
        "canonical_name": "Ginger",
        "bangla_name": "আদা",
        "aliases": ["ginger", "ada"],
        "barc_crop": None,
        "category": "Spice",
        "verified_seasons": ["Kharif 1", "Rabi"],
        "has_frg_fertilizer": True
    },
    "Jute": {
        "canonical_name": "Jute",
        "bangla_name": "পাট",
        "aliases": ["jute", "pat", "tosha pat", "deshi pat"],
        "barc_crop": "Jute",
        "category": "Fiber",
        "verified_seasons": ["Kharif 1"],
        "has_frg_fertilizer": True
    },
    "Sugarcane": {
        "canonical_name": "Sugarcane",
        "bangla_name": "আখ / কুশিয়ার",
        "aliases": ["sugarcane", "aakh", "kushiar"],
        "barc_crop": "Sugarcane",
        "category": "Cash Crop",
        "verified_seasons": ["Rabi", "Kharif 1"],
        "has_frg_fertilizer": True
    },
    "Taramind": {
        "canonical_name": "Tamarind",
        "bangla_name": "তেঁতুল",
        "aliases": ["taramind", "tamarind", "tentul", "tetul"],
        "barc_crop": None,
        "category": "Fruit / Minor Crop",
        "verified_seasons": ["Kharif 1"],
        "has_frg_fertilizer": False
    },
    "Cheena": {
        "canonical_name": "Cheena (Proso Millet)",
        "bangla_name": "চীনা (কাউন / বাজরা)",
        "aliases": ["cheena", "china millet", "proso millet"],
        "barc_crop": None,
        "category": "Millet / Minor Grain",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": False
    },
    "Betelnut": {
        "canonical_name": "Betelnut (Areca Nut)",
        "bangla_name": "সুপারি",
        "aliases": ["betelnut", "supari", "areca nut"],
        "barc_crop": None,
        "category": "Plantation / Fruit",
        "verified_seasons": ["Kharif 2"],
        "has_frg_fertilizer": False
    },
    "Lady's Finger": {
        "canonical_name": "Lady's Finger (Okra)",
        "bangla_name": "ঢেঁড়শ",
        "aliases": ["lady's finger", "okra", "dherosh", "bhendi"],
        "barc_crop": None,
        "category": "Vegetable",
        "verified_seasons": ["Kharif 1", "Kharif 2"],
        "has_frg_fertilizer": True
    },
    "Cabbage": {
        "canonical_name": "Cabbage",
        "bangla_name": "বাঁধাকপি",
        "aliases": ["cabbage", "badhakopi"],
        "barc_crop": None,
        "category": "Vegetable",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Cauliflower": {
        "canonical_name": "Cauliflower",
        "bangla_name": "ফুলকপি",
        "aliases": ["cauliflower", "fulkopi", "phulkopi"],
        "barc_crop": None,
        "category": "Vegetable",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    },
    "Cucumber": {
        "canonical_name": "Cucumber",
        "bangla_name": "শসা",
        "aliases": ["cucumber", "shosa", "sosha"],
        "barc_crop": None,
        "category": "Vegetable",
        "verified_seasons": ["Kharif 1", "Rabi"],
        "has_frg_fertilizer": True
    },
    "Pumpkin": {
        "canonical_name": "Pumpkin",
        "bangla_name": "মিষ্টি কুমড়া",
        "aliases": ["pumpkin", "misti kumra", "misti kumda"],
        "barc_crop": None,
        "category": "Vegetable",
        "verified_seasons": ["Rabi", "Kharif 1"],
        "has_frg_fertilizer": True
    },
    "Radish": {
        "canonical_name": "Radish",
        "bangla_name": "মুলা",
        "aliases": ["radish", "mula"],
        "barc_crop": None,
        "category": "Vegetable",
        "verified_seasons": ["Rabi"],
        "has_frg_fertilizer": True
    }
}


def build_and_save_crop_catalog():
    """Extracts all 72 crops from cleaned SPAS data and creates the comprehensive catalog."""
    import pandas as pd
    df = pd.read_csv(SPAS_CLEANED_PATH, encoding="utf-8")
    crops_in_data = df.drop_duplicates(subset=["Crop Name"])

    catalog = {}
    for _, row in crops_in_data.iterrows():
        spas_label = str(row["Crop Name"]).strip()
        tax = CROP_TAXONOMY_OVERRIDE.get(spas_label, {})

        canonical = tax.get("canonical_name", spas_label)
        bangla = tax.get("bangla_name", spas_label)
        aliases = tax.get("aliases", [spas_label.lower()])
        barc = tax.get("barc_crop", None)
        category = tax.get("category", "General Crop")
        seasons = tax.get("verified_seasons", [str(row["Season"])])
        has_frg = tax.get("has_frg_fertilizer", False)

        catalog[spas_label] = {
            "spas_label": spas_label,
            "canonical_name": canonical,
            "bangla_name": bangla,
            "aliases": aliases,
            "barc_crop_name": barc,
            "has_barc_suitability": barc is not None,
            "has_frg_fertilizer": has_frg,
            "category": category,
            "spas_default_season": str(row["Season"]),
            "verified_seasons": seasons,
            "lifecycle": {
                "transplant_window": str(row["Transplant"]),
                "growth_window": str(row["Growth"]),
                "harvest_window": str(row["Harvest"])
            },
            "climate_envelope": {
                "optimal_avg_temp_c": float(row["Avg Temp"]),
                "optimal_avg_humidity_pct": float(row["Avg Humidity"]),
                "max_temp_c": float(row["Max Temp"]),
                "min_temp_c": float(row["Min Temp"]),
                "max_rh_pct": float(row["Max Relative Humidity"]),
                "min_rh_pct": float(row["Min Relative Humidity"])
            }
        }

    # Also register BARC Potato (Irish Potato) as an authoritative reference crop
    if "Potato" not in catalog:
        catalog["Potato"] = {
            "spas_label": "Potato",
            "canonical_name": "Potato (Irish Potato)",
            "bangla_name": "গোল আলু",
            "aliases": ["potato", "alu", "gol alu", "irish potato"],
            "barc_crop_name": "Potato",
            "has_barc_suitability": True,
            "has_frg_fertilizer": True,
            "category": "Tuber",
            "spas_default_season": "Rabi",
            "verified_seasons": ["Rabi"],
            "lifecycle": {
                "transplant_window": "November to December",
                "growth_window": "December to February",
                "harvest_window": "February to March"
            },
            "climate_envelope": {
                "optimal_avg_temp_c": 18.0,
                "optimal_avg_humidity_pct": 65.0,
                "max_temp_c": 28.0,
                "min_temp_c": 8.0,
                "max_rh_pct": 80.0,
                "min_rh_pct": 50.0
            }
        }

    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    logger.info(f"Successfully compiled Crop Catalog for {len(catalog)} crops at {CATALOG_PATH}")
    return catalog


class CropCatalog:
    """Provides querying and normalization services across Bangladesh crops."""

    def __init__(self, catalog_path: Path = CATALOG_PATH):
        if not catalog_path.exists():
            self.catalog = build_and_save_crop_catalog()
        else:
            with open(catalog_path, "r", encoding="utf-8") as f:
                self.catalog = json.load(f)

    def normalize(self, query: str) -> Optional[Dict[str, Any]]:
        """Resolves user query (Bangla, alias, SPAS name) with strict exact priority."""
        if not query:
            return None
        q = str(query).strip().lower()

        # Step 1: Exact matches (keys, canonical names, exact aliases)
        for spas_name, entry in self.catalog.items():
            if spas_name.lower() == q:
                return entry
            if entry["canonical_name"].lower() == q:
                return entry
            if entry.get("bangla_name") and entry["bangla_name"].strip() == query.strip():
                return entry
            if q in [a.lower() for a in entry.get("aliases", [])]:
                return entry

        # Step 2: Substring matches only if exact match didn't resolve
        for spas_name, entry in self.catalog.items():
            if q in entry["canonical_name"].lower() or any(q == a.lower() for a in entry.get("aliases", [])):
                return entry

        return None

    def get_by_spas_label(self, spas_label: str) -> Optional[Dict[str, Any]]:
        return self.catalog.get(spas_label)

    def get_all_crops(self) -> List[Dict[str, Any]]:
        return list(self.catalog.values())


# Singleton
_catalog_instance: Optional[CropCatalog] = None


def get_crop_catalog() -> CropCatalog:
    global _catalog_instance
    if _catalog_instance is None:
        _catalog_instance = CropCatalog()
    return _catalog_instance


if __name__ == "__main__":
    cat = build_and_save_crop_catalog()
    catalog_service = CropCatalog()
    sample = catalog_service.normalize("Potato")
    print("Normalized 'Potato':", sample["canonical_name"] if sample else "Not found")
    sample_sweet = catalog_service.normalize("Sweet Potato")
    print("Normalized 'Sweet Potato':", sample_sweet["canonical_name"] if sample_sweet else "Not found")
    print(f"Total crops in catalog: {len(cat)}")
