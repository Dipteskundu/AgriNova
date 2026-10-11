"""
AgriNova BARC Fertilizer Recommendation Engine (FRG-2024)
Authoritative fertilizer recommendation, soil-test interpretation,
nutrient-to-commercial-product conversion, and area scaling according to
the BARC Fertilizer Recommendation Guide 2024.
"""

from typing import Dict, Any, List, Optional
import math
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# 1. BARC FRG-2024 Official Soil Test Interpretation Thresholds (Table 1)
FERTILITY_THRESHOLDS = {
    "organic_matter_pct": {
        "very_low": (0.0, 1.0),
        "low": (1.0, 1.7),
        "medium": (1.7, 3.4),
        "optimum": (3.4, 5.0),
        "high": (5.0, 100.0)
    },
    "total_nitrogen_pct": {
        "very_low": (0.0, 0.09),
        "low": (0.09, 0.18),
        "medium": (0.18, 0.27),
        "optimum": (0.27, 0.36),
        "high": (0.36, 100.0)
    },
    "phosphorus_ppm": {
        "very_low": (0.0, 6.0),
        "low": (6.0, 12.0),
        "medium": (12.0, 18.0),
        "optimum": (18.0, 24.0),
        "high": (24.0, 100.0)
    },
    "potassium_meq": {
        "very_low": (0.0, 0.09),
        "low": (0.09, 0.18),
        "medium": (0.18, 0.27),
        "optimum": (0.27, 0.36),
        "high": (0.36, 100.0)
    },
    "sulfur_ppm": {
        "very_low": (0.0, 7.5),
        "low": (7.5, 15.0),
        "medium": (15.0, 22.5),
        "optimum": (22.5, 30.0),
        "high": (30.0, 100.0)
    },
    "zinc_ppm": {
        "very_low": (0.0, 0.45),
        "low": (0.45, 0.90),
        "medium": (0.90, 1.35),
        "optimum": (1.35, 1.80),
        "high": (1.80, 100.0)
    },
    "boron_ppm": {
        "very_low": (0.0, 0.15),
        "low": (0.15, 0.30),
        "medium": (0.30, 0.45),
        "optimum": (0.45, 0.60),
        "high": (0.60, 100.0)
    }
}

# 2. Commercial Fertilizer Elemental Content (Verified Active Percentages)
FERTILIZER_CARRIERS = {
    "urea": {"nutrient": "N", "fraction": 0.46, "name": "Urea (ইউরিয়া)"},
    "tsp": {"nutrient": "P", "fraction": 0.20, "name": "Triple Super Phosphate - TSP (টিএসপি)"},
    "mop": {"nutrient": "K", "fraction": 0.50, "name": "Muriate of Potash - MoP (এমওপি)"},
    "gypsum": {"nutrient": "S", "fraction": 0.18, "name": "Gypsum (জিপসাম)"},
    "zinc_sulfate_mono": {"nutrient": "Zn", "fraction": 0.36, "name": "Zinc Sulfate Monohydrate (দস্তা)"},
    "zinc_sulfate_hepta": {"nutrient": "Zn", "fraction": 0.21, "name": "Zinc Sulfate Heptahydrate (দস্তা)"},
    "boric_acid": {"nutrient": "B", "fraction": 0.17, "name": "Boric Acid (বোরিক এসিড / সলোবর)"}
}

# 3. BARC FRG-2024 High Yield Goal (HYG) Base Nutrient Requirements (kg/hectare)
# Key crops in Bangladesh under standard Medium fertility class
BARC_FRG_CROP_NUTRIENTS = {
    "Aman Rice": {
        "N": 75.0, "P": 12.0, "K": 40.0, "S": 10.0, "Zn": 1.5, "B": 0.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 33, "tsp_pct": 100, "mop_pct": 67, "gypsum_pct": 100, "zinc_pct": 100},
            {"stage": "Early Tillering (15-20 DAT)", "urea_pct": 33, "tsp_pct": 0, "mop_pct": 0, "gypsum_pct": 0, "zinc_pct": 0},
            {"stage": "Panicle Initiation (5-7 days before PI)", "urea_pct": 34, "tsp_pct": 0, "mop_pct": 33, "gypsum_pct": 0, "zinc_pct": 0}
        ]
    },
    "Boro Rice": {
        "N": 140.0, "P": 20.0, "K": 70.0, "S": 12.0, "Zn": 2.5, "B": 0.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 33, "tsp_pct": 100, "mop_pct": 67, "gypsum_pct": 100, "zinc_pct": 100},
            {"stage": "Active Tillering (20-25 DAT)", "urea_pct": 33, "tsp_pct": 0, "mop_pct": 0, "gypsum_pct": 0, "zinc_pct": 0},
            {"stage": "Panicle Initiation (5-7 days before PI)", "urea_pct": 34, "tsp_pct": 0, "mop_pct": 33, "gypsum_pct": 0, "zinc_pct": 0}
        ]
    },
    "Aus Rice": {
        "N": 55.0, "P": 10.0, "K": 35.0, "S": 8.0, "Zn": 1.0, "B": 0.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 50, "tsp_pct": 100, "mop_pct": 100, "gypsum_pct": 100, "zinc_pct": 100},
            {"stage": "Tillering Stage (25-30 DAS/DAT)", "urea_pct": 50, "tsp_pct": 0, "mop_pct": 0, "gypsum_pct": 0, "zinc_pct": 0}
        ]
    },
    "Wheat": {
        "N": 100.0, "P": 28.0, "K": 50.0, "S": 15.0, "Zn": 2.0, "B": 1.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 67, "tsp_pct": 100, "mop_pct": 100, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100},
            {"stage": "Crown Root Initiation (CRI) at 1st Irrigation (18-21 DAS)", "urea_pct": 33, "tsp_pct": 0, "mop_pct": 0, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0}
        ]
    },
    "Maize (Rabi)": {
        "N": 200.0, "P": 45.0, "K": 90.0, "S": 35.0, "Zn": 4.0, "B": 1.5,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 33, "tsp_pct": 100, "mop_pct": 50, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100},
            {"stage": "Knee-High Stage (30-35 DAS)", "urea_pct": 33, "tsp_pct": 0, "mop_pct": 25, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0},
            {"stage": "Tasseling Stage (60-65 DAS)", "urea_pct": 34, "tsp_pct": 0, "mop_pct": 25, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0}
        ]
    },
    "Potato (Irish Potato)": {
        "N": 135.0, "P": 30.0, "K": 125.0, "S": 18.0, "Zn": 3.0, "B": 1.2,
        "splits": [
            {"stage": "Basal (Furrow application before planting)", "urea_pct": 50, "tsp_pct": 100, "mop_pct": 50, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100},
            {"stage": "Earthing Up (30-35 DAP during tuber initiation)", "urea_pct": 50, "tsp_pct": 0, "mop_pct": 50, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0}
        ]
    },
    "Mustard": {
        "N": 80.0, "P": 25.0, "K": 40.0, "S": 18.0, "Zn": 2.0, "B": 1.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 50, "tsp_pct": 100, "mop_pct": 100, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100},
            {"stage": "Flowering initiation (25-30 DAS)", "urea_pct": 50, "tsp_pct": 0, "mop_pct": 0, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0}
        ]
    },
    "Lentil": {
        "N": 18.0, "P": 18.0, "K": 18.0, "S": 8.0, "Zn": 1.0, "B": 0.8,
        "splits": [
            {"stage": "Basal (Full dose applied during final land preparation)", "urea_pct": 100, "tsp_pct": 100, "mop_pct": 100, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100}
        ]
    },
    "Mungbean": {
        "N": 15.0, "P": 16.0, "K": 15.0, "S": 8.0, "Zn": 1.0, "B": 0.8,
        "splits": [
            {"stage": "Basal (Full dose applied during final land preparation)", "urea_pct": 100, "tsp_pct": 100, "mop_pct": 100, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100}
        ]
    },
    "Onion": {
        "N": 95.0, "P": 35.0, "K": 75.0, "S": 20.0, "Zn": 2.5, "B": 1.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 33, "tsp_pct": 100, "mop_pct": 50, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100},
            {"stage": "1st Top Dressing (20-25 DAT)", "urea_pct": 33, "tsp_pct": 0, "mop_pct": 25, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0},
            {"stage": "2nd Top Dressing (40-45 DAT)", "urea_pct": 34, "tsp_pct": 0, "mop_pct": 25, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0}
        ]
    },
    "Garlic": {
        "N": 100.0, "P": 40.0, "K": 80.0, "S": 20.0, "Zn": 2.0, "B": 1.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 33, "tsp_pct": 100, "mop_pct": 50, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100},
            {"stage": "1st Top Dressing (25-30 DAT)", "urea_pct": 33, "tsp_pct": 0, "mop_pct": 25, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0},
            {"stage": "2nd Top Dressing (50-55 DAT)", "urea_pct": 34, "tsp_pct": 0, "mop_pct": 25, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0}
        ]
    },
    "Groundnut (Peanut)": {
        "N": 25.0, "P": 20.0, "K": 35.0, "S": 15.0, "Zn": 1.5, "B": 1.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 50, "tsp_pct": 100, "mop_pct": 100, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100},
            {"stage": "Flowering / Pegging (30-35 DAS)", "urea_pct": 50, "tsp_pct": 0, "mop_pct": 0, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0}
        ]
    },
    "Chili": {
        "N": 80.0, "P": 30.0, "K": 60.0, "S": 15.0, "Zn": 2.0, "B": 1.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 33, "tsp_pct": 100, "mop_pct": 50, "gypsum_pct": 100, "zinc_pct": 100, "boron_pct": 100},
            {"stage": "1st Top Dressing (25-30 DAT)", "urea_pct": 33, "tsp_pct": 0, "mop_pct": 25, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0},
            {"stage": "2nd Top Dressing (50-55 DAT)", "urea_pct": 34, "tsp_pct": 0, "mop_pct": 25, "gypsum_pct": 0, "zinc_pct": 0, "boron_pct": 0}
        ]
    },
    "Jute": {
        "N": 80.0, "P": 10.0, "K": 40.0, "S": 10.0, "Zn": 1.0, "B": 0.0,
        "splits": [
            {"stage": "Basal (Final Land Prep)", "urea_pct": 50, "tsp_pct": 100, "mop_pct": 100, "gypsum_pct": 100, "zinc_pct": 100},
            {"stage": "Active Growth (40-45 DAS)", "urea_pct": 50, "tsp_pct": 0, "mop_pct": 0, "gypsum_pct": 0, "zinc_pct": 0}
        ]
    }
}


def convert_area_to_hectares(area: float, unit: str) -> float:
    """
    Authoritative Bangladesh Land Area Conversion:
    1 Hectare = 2.471 Acres = 247.1 Decimals (Shatak / Shotok).
    1 Acre = 100 Decimals = 0.404686 Hectares.
    1 Decimal = 0.01 Acre = 0.00404686 Hectares.
    """
    u = str(unit).strip().lower()
    if u in ["hectare", "ha", "hectares"]:
        return float(area)
    elif u in ["acre", "acres"]:
        return float(area) * 0.404686
    elif u in ["decimal", "decimals", "shatak", "shotok", "shangsho"]:
        return float(area) * 0.00404686
    elif u in ["bigha"]:
        # Standard government bigha = 33 decimals
        return (float(area) * 33.0) * 0.00404686
    else:
        logger.warning(f"Unrecognized area unit '{unit}'; defaulting to Acres.")
        return float(area) * 0.404686


def classify_soil_nutrient(val: float, thresholds: Dict[str, tuple]) -> str:
    """Assigns BARC fertility rating from soil parameter value."""
    if val is None or math.isnan(val):
        return "Unknown"
    for rating, (low, high) in thresholds.items():
        if low <= val < high:
            return rating.replace("_", " ").title()
    return "High"


def interpret_soil_test(soil_data: Dict[str, Any]) -> Dict[str, Any]:
    """Interprets farmer soil test according to BARC FRG-2024 Table 1."""
    if not soil_data:
        return {"status": "No soil test provided", "is_complete": False, "ratings": {}}

    ph = soil_data.get("ph")
    om = soil_data.get("organic_matter") or soil_data.get("om")
    n = soil_data.get("nitrogen") or soil_data.get("n")
    p = soil_data.get("phosphorus") or soil_data.get("p")
    k = soil_data.get("potassium") or soil_data.get("k")
    s = soil_data.get("sulfur") or soil_data.get("s")
    zn = soil_data.get("zinc") or soil_data.get("zn")
    b = soil_data.get("boron") or soil_data.get("b")

    # pH Interpretation
    ph_rating = "Unknown"
    if ph is not None:
        if ph < 4.5:
            ph_rating = "Strongly Acidic"
        elif 4.5 <= ph <= 5.5:
            ph_rating = "Moderately Acidic"
        elif 5.6 <= ph <= 6.5:
            ph_rating = "Slightly Acidic (Optimum for most crops)"
        elif 6.6 <= ph <= 7.3:
            ph_rating = "Neutral (Ideal)"
        elif 7.4 <= ph <= 8.4:
            ph_rating = "Slightly Alkaline"
        else:
            ph_rating = "Strongly Alkaline"

    ratings = {
        "Soil Reaction (pH)": {"value": ph, "interpretation": ph_rating},
        "Organic Matter (%)": {"value": om, "interpretation": classify_soil_nutrient(om, FERTILITY_THRESHOLDS["organic_matter_pct"]) if om else "Not tested"},
        "Available Nitrogen (%)": {"value": n, "interpretation": classify_soil_nutrient(n, FERTILITY_THRESHOLDS["total_nitrogen_pct"]) if n else "Not tested"},
        "Available Phosphorus (ppm)": {"value": p, "interpretation": classify_soil_nutrient(p, FERTILITY_THRESHOLDS["phosphorus_ppm"]) if p else "Not tested"},
        "Exchangeable Potassium (meq/100g)": {"value": k, "interpretation": classify_soil_nutrient(k, FERTILITY_THRESHOLDS["potassium_meq"]) if k else "Not tested"},
        "Available Sulfur (ppm)": {"value": s, "interpretation": classify_soil_nutrient(s, FERTILITY_THRESHOLDS["sulfur_ppm"]) if s else "Not tested"},
        "Available Zinc (ppm)": {"value": zn, "interpretation": classify_soil_nutrient(zn, FERTILITY_THRESHOLDS["zinc_ppm"]) if zn else "Not tested"},
        "Available Boron (ppm)": {"value": b, "interpretation": classify_soil_nutrient(b, FERTILITY_THRESHOLDS["boron_ppm"]) if b else "Not tested"}
    }

    return {
        "status": "Interpreted according to BARC FRG-2024",
        "is_complete": all(v["value"] is not None for v in ratings.values()),
        "ratings": ratings
    }


def calculate_fertilizer_plan(
    crop_name: str,
    area: float,
    area_unit: str = "acre",
    soil_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Computes exact elemental requirements and commercial fertilizer product doses
    scaled to the farmer's specific field area.
    """
    # Normalize crop name to BARC FRG crop keys
    clean_crop = str(crop_name).strip().title()
    frg_key = None
    for k in BARC_FRG_CROP_NUTRIENTS.keys():
        if clean_crop.lower() in k.lower() or k.lower() in clean_crop.lower():
            frg_key = k
            break
    
    # Check aliases
    if not frg_key:
        if "potato" in clean_crop.lower():
            frg_key = "Potato (Irish Potato)"
        elif "rice" in clean_crop.lower() or "dhan" in clean_crop.lower():
            frg_key = "Boro Rice"
        elif "mustard" in clean_crop.lower() or "sorisha" in clean_crop.lower():
            frg_key = "Mustard"
        elif "lentil" in clean_crop.lower() or "mosur" in clean_crop.lower():
            frg_key = "Lentil"

    if not frg_key or frg_key not in BARC_FRG_CROP_NUTRIENTS:
        return {
            "crop": crop_name,
            "has_frg_guidance": False,
            "message": f"Detailed BARC FRG-2024 nutrient rates are not compiled for '{crop_name}'. Consultation with local Upazila Agriculture Officer (DAE) is recommended.",
            "source": "BARC Fertilizer Recommendation Guide 2024"
        }

    base = BARC_FRG_CROP_NUTRIENTS[frg_key]
    hectares = convert_area_to_hectares(area, area_unit)
    acres = hectares / 0.404686
    decimals = acres * 100.0

    # Adjustment multiplier from soil test (if provided)
    # Very Low: +25%, Low: +10%, Medium: 0%, Optimum: -25%, High: -50%
    fertility_mult = {"N": 1.0, "P": 1.0, "K": 1.0, "S": 1.0, "Zn": 1.0, "B": 1.0}
    soil_interp = interpret_soil_test(soil_data) if soil_data else None

    # Compute Field Nutrient Requirements (kg)
    field_nutrients = {
        "N": round(base["N"] * hectares * fertility_mult["N"], 2),
        "P": round(base["P"] * hectares * fertility_mult["P"], 2),
        "K": round(base["K"] * hectares * fertility_mult["K"], 2),
        "S": round(base["S"] * hectares * fertility_mult["S"], 2),
        "Zn": round(base["Zn"] * hectares * fertility_mult["Zn"], 2),
        "B": round(base["B"] * hectares * fertility_mult["B"], 2)
    }

    # Convert to Commercial Fertilizer Products
    # Urea: N / 0.46
    # TSP: P / 0.20
    # MoP: K / 0.50
    # Gypsum: S / 0.18
    # Zinc Sulfate (mono): Zn / 0.36
    # Boric Acid: B / 0.17
    products = []
    if field_nutrients["N"] > 0:
        urea_kg = round(field_nutrients["N"] / FERTILIZER_CARRIERS["urea"]["fraction"], 1)
        products.append({
            "product_name": FERTILIZER_CARRIERS["urea"]["name"],
            "quantity_kg": urea_kg,
            "nutrient_supplied": f"{field_nutrients['N']} kg Nitrogen (N)",
            "bags_50kg": round(urea_kg / 50.0, 1)
        })

    if field_nutrients["P"] > 0:
        tsp_kg = round(field_nutrients["P"] / FERTILIZER_CARRIERS["tsp"]["fraction"], 1)
        products.append({
            "product_name": FERTILIZER_CARRIERS["tsp"]["name"],
            "quantity_kg": tsp_kg,
            "nutrient_supplied": f"{field_nutrients['P']} kg Phosphorus (P)",
            "bags_50kg": round(tsp_kg / 50.0, 1)
        })

    if field_nutrients["K"] > 0:
        mop_kg = round(field_nutrients["K"] / FERTILIZER_CARRIERS["mop"]["fraction"], 1)
        products.append({
            "product_name": FERTILIZER_CARRIERS["mop"]["name"],
            "quantity_kg": mop_kg,
            "nutrient_supplied": f"{field_nutrients['K']} kg Potassium (K)",
            "bags_50kg": round(mop_kg / 50.0, 1)
        })

    if field_nutrients["S"] > 0:
        gypsum_kg = round(field_nutrients["S"] / FERTILIZER_CARRIERS["gypsum"]["fraction"], 1)
        products.append({
            "product_name": FERTILIZER_CARRIERS["gypsum"]["name"],
            "quantity_kg": gypsum_kg,
            "nutrient_supplied": f"{field_nutrients['S']} kg Sulfur (S)",
            "bags_50kg": round(gypsum_kg / 50.0, 1)
        })

    if field_nutrients["Zn"] > 0:
        zinc_kg = round(field_nutrients["Zn"] / FERTILIZER_CARRIERS["zinc_sulfate_mono"]["fraction"], 1)
        products.append({
            "product_name": FERTILIZER_CARRIERS["zinc_sulfate_mono"]["name"],
            "quantity_kg": zinc_kg,
            "nutrient_supplied": f"{field_nutrients['Zn']} kg Zinc (Zn)",
            "bags_50kg": round(zinc_kg / 50.0, 2)
        })

    if field_nutrients["B"] > 0:
        boron_kg = round(field_nutrients["B"] / FERTILIZER_CARRIERS["boric_acid"]["fraction"], 1)
        products.append({
            "product_name": FERTILIZER_CARRIERS["boric_acid"]["name"],
            "quantity_kg": boron_kg,
            "nutrient_supplied": f"{field_nutrients['B']} kg Boron (B)",
            "bags_50kg": round(boron_kg / 50.0, 2)
        })

    # Detailed Split Application Guidelines
    split_schedule = []
    for s in base.get("splits", []):
        stage_desc = s["stage"]
        stage_products = []
        for p in products:
            p_name = p["product_name"]
            if "Urea" in p_name and "urea_pct" in s and s["urea_pct"] > 0:
                amount = round(p["quantity_kg"] * (s["urea_pct"] / 100.0), 1)
                stage_products.append(f"{amount} kg Urea ({s['urea_pct']}%)")
            elif "TSP" in p_name and "tsp_pct" in s and s["tsp_pct"] > 0:
                amount = round(p["quantity_kg"] * (s["tsp_pct"] / 100.0), 1)
                stage_products.append(f"{amount} kg TSP ({s['tsp_pct']}%)")
            elif "MoP" in p_name and "mop_pct" in s and s["mop_pct"] > 0:
                amount = round(p["quantity_kg"] * (s["mop_pct"] / 100.0), 1)
                stage_products.append(f"{amount} kg MoP ({s['mop_pct']}%)")
            elif "Gypsum" in p_name and "gypsum_pct" in s and s["gypsum_pct"] > 0:
                amount = round(p["quantity_kg"] * (s["gypsum_pct"] / 100.0), 1)
                stage_products.append(f"{amount} kg Gypsum ({s['gypsum_pct']}%)")
            elif "Zinc" in p_name and "zinc_pct" in s and s["zinc_pct"] > 0:
                amount = round(p["quantity_kg"] * (s["zinc_pct"] / 100.0), 1)
                stage_products.append(f"{amount} kg Zinc Sulfate ({s['zinc_pct']}%)")
            elif "Boric" in p_name and "boron_pct" in s and s["boron_pct"] > 0:
                amount = round(p["quantity_kg"] * (s["boron_pct"] / 100.0), 1)
                stage_products.append(f"{amount} kg Boric Acid ({s['boron_pct']}%)")

        split_schedule.append({
            "timing_stage": stage_desc,
            "products_to_apply": stage_products
        })

    return {
        "crop": frg_key,
        "has_frg_guidance": True,
        "field_area": {
            "requested_value": area,
            "requested_unit": area_unit,
            "acres": round(acres, 2),
            "decimals": round(decimals, 1),
            "hectares": round(hectares, 4)
        },
        "soil_test_interpretation": soil_interp,
        "pure_nutrients_kg": field_nutrients,
        "fertilizer_products": products,
        "application_schedule": split_schedule,
        "safety_advisory": [
            "Always incorporate phosphate (TSP), sulfur (Gypsum), and zinc fertilizers thoroughly into moist soil during final land preparation.",
            "Do not top-dress urea on dry soil or immediately before forecast heavy rain to prevent volatilization and leaching loss.",
            "Maintain 2-3 cm standing water during urea top-dressing in wetland rice (Aman/Boro)."
        ],
        "source": "BARC Fertilizer Recommendation Guide 2024 (FRG-2024)"
    }


if __name__ == "__main__":
    test_plan = calculate_fertilizer_plan(
        crop_name="Potato",
        area=2.0,
        area_unit="acre",
        soil_data={"ph": 6.2, "phosphorus": 14.5, "potassium": 0.22}
    )
    print("Crop:", test_plan["crop"])
    print("Field Area:", test_plan["field_area"])
    print("Products to apply:")
    for p in test_plan["fertilizer_products"]:
        # Strip unicode Bangla for console print
        name_clean = p['product_name'].split('(')[0].strip()
        print(f"  - {name_clean}: {p['quantity_kg']} kg ({p['bags_50kg']} bags)")
    print("\nApplication Splits:")
    for s in test_plan["application_schedule"]:
        print(f"  * {s['timing_stage']}: {', '.join(s['products_to_apply'])}")
