"""
AgriNova Crop Prediction Inference Engine
Provides Top-K probabilistic candidate crop recommendations from trained champion pipeline.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import json
import logging
import joblib
import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODELS_DIR / "crop_recommendation_model.joblib"
LABEL_ENCODER_PATH = MODELS_DIR / "label_encoder.joblib"
METADATA_PATH = MODELS_DIR / "model_metadata.json"


class CropPredictor:
    """Encapsulates the trained ML pipeline for production inference."""

    def __init__(self, model_path: Path = MODEL_PATH, encoder_path: Path = LABEL_ENCODER_PATH, meta_path: Path = METADATA_PATH):
        if not model_path.exists() or not encoder_path.exists():
            raise FileNotFoundError(f"Model artifacts not found in {model_path.parent}. Run train.py first.")

        self.pipeline = joblib.load(model_path)
        self.label_encoder = joblib.load(encoder_path)
        self.classes = self.label_encoder.classes_

        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {"model_name": "XGBoost", "version": "1.0.0"}

        logger.info(f"Loaded CropPredictor: {self.metadata.get('champion_model', 'XGBoost')} with {len(self.classes)} crop classes")

    def predict_top_k(
        self,
        district: str,
        season: str,
        area: float = 1.0,
        avg_temp: float = 26.0,
        avg_humidity: float = 70.0,
        max_temp: float = 35.0,
        min_temp: float = 18.0,
        max_rh: float = 85.0,
        min_rh: float = 55.0,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Executes inference on user and environmental input, returning top-k crop candidates with confidence scores.
        """
        input_data = pd.DataFrame([{
            "District": district,
            "Season": season,
            "Area": float(area),
            "Avg Temp": float(avg_temp),
            "Avg Humidity": float(avg_humidity),
            "Max Temp": float(max_temp),
            "Min Temp": float(min_temp),
            "Max Relative Humidity": float(max_rh),
            "Min Relative Humidity": float(min_rh)
        }])

        probabilities = self.pipeline.predict_proba(input_data)[0]
        print("[Raw model diagnostic]", {
            "input": input_data.to_dict(orient="records")[0],
            "top_predictions": sorted(
                zip(self.pipeline.classes_, probabilities),
                key=lambda item: item[1],
                reverse=True
            )[:5],
        })
        top_indices = np.argsort(probabilities)[::-1][:top_k]

        results = []
        for rank, idx in enumerate(top_indices, start=1):
            score = float(probabilities[idx])
            results.append({
                "rank": rank,
                "crop": str(self.classes[idx]),
                "confidence_score": round(score, 4),
                "score_type": "Model confidence score (decision support, not yield guarantee)"
            })

        return results

    def get_model_info(self) -> Dict[str, Any]:
        """Returns runtime model version and provenance metadata."""
        return {
            "model_name": self.metadata.get("champion_model", "XGBoost"),
            "model_version": self.metadata.get("version", "1.0.0"),
            "dataset": self.metadata.get("dataset", "SPAS-Dataset-BD"),
            "dataset_version": self.metadata.get("dataset_version", "2.0_cleaned"),
            "trained_at": self.metadata.get("trained_at"),
            "num_classes": len(self.classes),
            "classes_sample": self.classes[:10].tolist()
        }


# Singleton instance for fast API serving
_predictor_instance: Optional[CropPredictor] = None


def get_crop_predictor() -> CropPredictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = CropPredictor()
    return _predictor_instance


if __name__ == "__main__":
    predictor = get_crop_predictor()
    recs = predictor.predict_top_k(
        district="Rajshahi",
        season="Rabi",
        area=2.5,
        avg_temp=22.0,
        avg_humidity=65.0,
        top_k=5
    )
    print("Model Info:", predictor.get_model_info())
    print("\nTop-5 Predictions for Rajshahi in Rabi:")
    for r in recs:
        print(f"  {r['rank']}. {r['crop']}: {r['confidence_score']}")
