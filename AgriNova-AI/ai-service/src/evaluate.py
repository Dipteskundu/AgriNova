"""
AgriNova Model Evaluation & Diagnostic Suite
Computes Top-K Accuracy, per-class metrics, confusion matrix, and feature importances.
"""

from pathlib import Path
import json
import logging
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

from data_loader import load_and_clean_spas
from preprocessing import prepare_data, FEATURE_COLS_NUMERICAL, FEATURE_COLS_CATEGORICAL

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
REPORTS_DIR = Path(__file__).resolve().parent.parent.parent / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"
DOCS_DIR = Path(__file__).resolve().parent.parent.parent / "docs"


def evaluate_champion_model():
    logger.info("Loading champion model and data for detailed evaluation...")
    model_path = MODELS_DIR / "crop_recommendation_model.joblib"
    encoder_path = MODELS_DIR / "label_encoder.joblib"

    if not model_path.exists() or not encoder_path.exists():
        raise FileNotFoundError("Champion model artifacts not found. Run train.py first.")

    pipeline = joblib.load(model_path)
    label_encoder = joblib.load(encoder_path)

    df = load_and_clean_spas()
    X_train, X_test, y_train, y_test, _, _ = prepare_data(df, test_size=0.2, random_state=42)

    # Predictions and probabilities
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)

    # 1. Compute Top-K Accuracies
    top1_correct = 0
    top3_correct = 0
    top5_correct = 0
    num_samples = len(y_test)

    for i in range(num_samples):
        true_label = y_test[i]
        top_k_indices = np.argsort(y_prob[i])[::-1]
        if true_label == top_k_indices[0]:
            top1_correct += 1
        if true_label in top_k_indices[:3]:
            top3_correct += 1
        if true_label in top_k_indices[:5]:
            top5_correct += 1

    top1_acc = top1_correct / num_samples
    top3_acc = top3_correct / num_samples
    top5_acc = top5_correct / num_samples

    logger.info(f"Top-1 Accuracy: {top1_acc:.4f} ({top1_correct}/{num_samples})")
    logger.info(f"Top-3 Accuracy: {top3_acc:.4f} ({top3_correct}/{num_samples})")
    logger.info(f"Top-5 Accuracy: {top5_acc:.4f} ({top5_correct}/{num_samples})")

    # 2. Detailed Classification Report
    target_names = label_encoder.classes_
    report_dict = classification_report(y_test, y_pred, target_names=target_names, output_dict=True, zero_division=0)
    report_df = pd.DataFrame(report_dict).transpose()
    report_df.to_csv(REPORTS_DIR / "per_class_metrics.csv")

    # 3. Confusion Matrix Plot
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(18, 16))
    sns.heatmap(cm, cmap="Blues", cbar=True, xticklabels=False, yticklabels=False)
    plt.title(f"XGBoost Multi-Class Confusion Matrix ({len(target_names)} Bangladesh Crop Classes)", fontsize=14, weight="bold")
    plt.xlabel("Predicted Class Index", fontsize=12)
    plt.ylabel("Ground Truth Class Index", fontsize=12)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "confusion_matrix.png")
    plt.close()
    logger.info("Saved confusion_matrix.png")

    # 4. Per-Class F1 Score Distribution
    per_class_f1s = [report_dict[name]["f1-score"] for name in target_names]
    plt.figure(figsize=(10, 5))
    sns.histplot(per_class_f1s, bins=15, kde=True, color="#1b5e20")
    plt.title(f"Distribution of Per-Class F1 Scores Across 72 Crops (Mean F1: {np.mean(per_class_f1s):.3f})", fontsize=12, weight="bold")
    plt.xlabel("Macro F1-Score", fontsize=10)
    plt.ylabel("Number of Crops", fontsize=10)
    plt.axvline(np.mean(per_class_f1s), color="red", linestyle="--", label=f"Mean F1 ({np.mean(per_class_f1s):.3f})")
    plt.legend()
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "per_class_f1.png")
    plt.close()
    logger.info("Saved per_class_f1.png")

    # 5. Feature Importance Extraction
    classifier = pipeline.named_steps["classifier"]
    preprocessor = pipeline.named_steps["preprocessor"]

    try:
        # Get feature names from ColumnTransformer
        cat_encoder = preprocessor.named_transformers_["cat"]
        cat_feature_names = cat_encoder.get_feature_names_out(FEATURE_COLS_CATEGORICAL).tolist()
        feature_names = FEATURE_COLS_NUMERICAL + cat_feature_names

        importances = classifier.feature_importances_
        fi_df = pd.DataFrame({"Feature": feature_names, "Importance": importances})

        # Aggregate one-hot categories back to high-level features
        high_level = {feat: 0.0 for feat in FEATURE_COLS_NUMERICAL + ["District", "Season"]}
        for _, r in fi_df.iterrows():
            feat = r["Feature"]
            imp = r["Importance"]
            if feat.startswith("District_"):
                high_level["District"] += imp
            elif feat.startswith("Season_"):
                high_level["Season"] += imp
            else:
                high_level[feat] = imp

        hl_df = pd.DataFrame(list(high_level.items()), columns=["Feature", "Importance"]).sort_values(by="Importance", ascending=False)
        hl_df["Percentage"] = (hl_df["Importance"] / hl_df["Importance"].sum()) * 100

        plt.figure(figsize=(10, 6))
        ax = sns.barplot(data=hl_df, x="Percentage", y="Feature", palette="crest")
        plt.title("XGBoost Feature Importance Distribution (%)", fontsize=13, weight="bold")
        plt.xlabel("Relative Importance (%)", fontsize=11)
        plt.ylabel("Feature", fontsize=11)
        for p in ax.patches:
            ax.annotate(f"{p.get_width():.1f}%", (p.get_width(), p.get_y() + p.get_height() / 2.),
                        ha="left", va="center", xytext=(4, 0), textcoords="offset points", fontsize=9)
        plt.tight_layout()
        plt.savefig(FIGURES_DIR / "feature_importance.png")
        plt.close()
        logger.info("Saved feature_importance.png")
    except Exception as e:
        logger.warning(f"Feature importance visualization note: {e}")

    # 6. Generate docs/MODEL_EVALUATION.md
    doc_content = f"""# Model Evaluation & Diagnostic Report

## 1. Executive Summary
- **Model**: XGBoost Multi-Class Classifier
- **Target**: `Crop Name` (72 Distinct Crops Cultivated Across Bangladesh)
- **Dataset**: SPAS-Dataset-BD (4,608 observations across 64 districts)
- **Top-1 Test Accuracy**: `{top1_acc * 100:.2f}%`
- **Top-3 Decision Support Accuracy**: `{top3_acc * 100:.2f}%`
- **Top-5 Decision Support Accuracy**: `{top5_acc * 100:.2f}%`
- **Macro-Averaged F1 Score**: `{report_dict['macro avg']['f1-score']:.4f}`
- **Weighted F1 Score**: `{report_dict['weighted avg']['f1-score']:.4f}`

---

## 2. Top-K Evaluation Analysis
Agricultural crop recommendation differs from strict 1-class classification: smallholder farmers benefit from receiving ranked **alternative crop options** suited to their agroecological zone and market goals.

| Metric | Accuracy | Interpretation |
| :--- | :--- | :--- |
| **Top-1 Accuracy** | **{top1_acc * 100:.2f}%** | Probability that the model's single highest-confidence crop matches the ground truth. |
| **Top-3 Accuracy** | **{top3_acc * 100:.2f}%** | Probability that the true compatible crop is within the top 3 recommendations. |
| **Top-5 Accuracy** | **{top5_acc * 100:.2f}%** | Provides the farmer with 5 viable, ecologically validated crop choices. |

---

## 3. High-Level Feature Importance
The trained XGBoost model leverages agronomic climate boundaries (`Avg Temp`, `Max/Min Temp`, `Avg/Min/Max Relative Humidity`), geographic district historical viability, farm size (`Area`), and `Season` to produce probabilistically calibrated candidate rankings.

---

## 4. Diagnostics & Artifacts
- **Confusion Matrix**: `reports/figures/confusion_matrix.png`
- **Feature Importance**: `reports/figures/feature_importance.png`
- **Per-Class F1 Distribution**: `reports/figures/per_class_f1.png`
- **Per-Class Metrics CSV**: `reports/per_class_metrics.csv`
"""
    with open(DOCS_DIR / "MODEL_EVALUATION.md", "w", encoding="utf-8") as f:
        f.write(doc_content)
    logger.info("Saved docs/MODEL_EVALUATION.md")


if __name__ == "__main__":
    evaluate_champion_model()
