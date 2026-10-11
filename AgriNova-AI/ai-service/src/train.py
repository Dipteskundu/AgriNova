"""
AgriNova Multi-Model ML Training & Evaluation Engine
Trains Logistic Regression, Random Forest, XGBoost, and KNN on SPAS-Dataset-BD.
Executes 5-fold Stratified Cross-Validation, compares models, and persists champion.
"""

from pathlib import Path
from typing import Dict, Any, List
import json
import time
import logging
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)
from xgboost import XGBClassifier

from data_loader import load_and_clean_spas
from preprocessing import (
    prepare_data,
    create_preprocessor,
    FEATURE_COLS_CATEGORICAL,
    FEATURE_COLS_NUMERICAL,
    TARGET_COL
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
REPORTS_DIR = Path(__file__).resolve().parent.parent.parent / "reports"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def train_and_compare_models(random_state: int = 42) -> Dict[str, Any]:
    logger.info("Initiating AgriNova ML Model Comparison...")
    df = load_and_clean_spas()
    X_train, X_test, y_train, y_test, label_encoder, preprocessor = prepare_data(
        df, test_size=0.2, random_state=random_state
    )

    candidate_models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
            random_state=random_state
        ),
        "K-Nearest Neighbors": KNeighborsClassifier(
            n_neighbors=5,
            weights="distance",
            metric="minkowski"
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=16,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=random_state,
            n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="multi:softprob",
            eval_metric="mlogloss",
            random_state=random_state,
            n_jobs=-1
        )
    }

    comparison_results = []
    trained_pipelines = {}
    cv_strat = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)

    for name, clf in candidate_models.items():
        logger.info(f"Training & Cross-Validating: {name}...")
        pipeline = Pipeline([
            ("preprocessor", create_preprocessor()),
            ("classifier", clf)
        ])

        start_time = time.time()
        # 5-Fold Stratified Cross Validation on Train Set
        cv_scores = cross_validate(
            pipeline, X_train, y_train,
            cv=cv_strat,
            scoring=["accuracy", "f1_macro"],
            n_jobs=-1,
            error_score="raise"
        )
        fit_duration = time.time() - start_time

        # Fit on full training set
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline

        # Predict on holdout test set
        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec_macro = precision_score(y_test, y_pred, average="macro", zero_division=0)
        rec_macro = recall_score(y_test, y_pred, average="macro", zero_division=0)
        f1_macro = f1_score(y_test, y_pred, average="macro", zero_division=0)
        f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)

        cv_acc_mean = float(np.mean(cv_scores["test_accuracy"]))
        cv_acc_std = float(np.std(cv_scores["test_accuracy"]))
        cv_f1_mean = float(np.mean(cv_scores["test_f1_macro"]))
        cv_f1_std = float(np.std(cv_scores["test_f1_macro"]))

        logger.info(f"[{name}] Test Acc: {acc:.4f} | Test Macro-F1: {f1_macro:.4f} | CV Macro-F1: {cv_f1_mean:.4f} +/- {cv_f1_std:.4f}")

        comparison_results.append({
            "Model": name,
            "Test Accuracy": round(acc, 4),
            "Test Macro F1": round(f1_macro, 4),
            "Test Macro Precision": round(prec_macro, 4),
            "Test Macro Recall": round(rec_macro, 4),
            "Test Weighted F1": round(f1_weighted, 4),
            "CV Acc Mean": round(cv_acc_mean, 4),
            "CV Acc Std": round(cv_acc_std, 4),
            "CV Macro-F1 Mean": round(cv_f1_mean, 4),
            "CV Macro-F1 Std": round(cv_f1_std, 4),
            "Training Time (s)": round(fit_duration, 2)
        })

    # Save comparison dataframe
    comp_df = pd.DataFrame(comparison_results).sort_values(by="Test Macro F1", ascending=False)
    csv_path = REPORTS_DIR / "model_comparison.csv"
    comp_df.to_csv(csv_path, index=False)
    logger.info(f"Saved model comparison table to {csv_path}")

    # Generate Markdown summary table
    md_content = f"# Model Comparison & Benchmark Report\n\n"
    md_content += f"**Evaluation Timestamp**: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
    md_content += f"**Dataset**: SPAS-Dataset-BD (v2.0 cleaned, 4608 records, 72 crop classes, 64 districts)\n\n"
    md_content += comp_df.to_markdown(index=False)
    md_content += "\n\n### Key Selection Criteria\n"
    md_content += "1. **Macro F1-Score**: Primary metric given 72 balanced crop classes across Bangladesh.\n"
    md_content += "2. **Generalization Stability**: Evaluated via 5-Fold Stratified Cross-Validation on the training partition.\n"
    md_content += "3. **Inference Latency**: Crucial for responsive FastAPI microservice endpoints.\n"

    md_path = REPORTS_DIR / "model_comparison.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    logger.info(f"Saved markdown report to {md_path}")

    # Select Champion Model
    best_model_name = comp_df.iloc[0]["Model"]
    best_pipeline = trained_pipelines[best_model_name]
    logger.info(f"Champion Model Selected: {best_model_name} (Test Macro F1: {comp_df.iloc[0]['Test Macro F1']})")

    # Save artifacts
    model_save_path = MODELS_DIR / "crop_recommendation_model.joblib"
    encoder_save_path = MODELS_DIR / "label_encoder.joblib"
    preprocessor_save_path = MODELS_DIR / "preprocessor.joblib"
    metadata_save_path = MODELS_DIR / "model_metadata.json"

    joblib.dump(best_pipeline, model_save_path)
    joblib.dump(label_encoder, encoder_save_path)
    joblib.dump(preprocessor, preprocessor_save_path)

    metadata = {
        "champion_model": best_model_name,
        "version": "1.0.0",
        "dataset": "SPAS-Dataset-BD",
        "dataset_version": "2.0_cleaned",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "features": {
            "categorical": FEATURE_COLS_CATEGORICAL,
            "numerical": FEATURE_COLS_NUMERICAL
        },
        "target": TARGET_COL,
        "classes": label_encoder.classes_.tolist(),
        "num_classes": len(label_encoder.classes_),
        "best_metrics": comp_df.iloc[0].to_dict(),
        "all_model_benchmarks": comparison_results
    }

    with open(metadata_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Saved champion pipeline and metadata to {MODELS_DIR}")

    return {
        "champion": best_model_name,
        "metrics": comp_df.iloc[0].to_dict(),
        "table": comp_df
    }


if __name__ == "__main__":
    res = train_and_compare_models()
    print("\nFinal Model Comparison:")
    print(res["table"])
