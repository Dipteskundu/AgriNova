# Model Evaluation & Diagnostic Report

## 1. Executive Summary
- **Model**: XGBoost Multi-Class Classifier
- **Target**: `Crop Name` (72 Distinct Crops Cultivated Across Bangladesh)
- **Dataset**: SPAS-Dataset-BD (4,608 observations across 64 districts)
- **Top-1 Test Accuracy**: `91.97%`
- **Top-3 Decision Support Accuracy**: `99.02%`
- **Top-5 Decision Support Accuracy**: `100.00%`
- **Macro-Averaged F1 Score**: `0.9188`
- **Weighted F1 Score**: `0.9191`

---

## 2. Top-K Evaluation Analysis
Agricultural crop recommendation differs from strict 1-class classification: smallholder farmers benefit from receiving ranked **alternative crop options** suited to their agroecological zone and market goals.

| Metric | Accuracy | Interpretation |
| :--- | :--- | :--- |
| **Top-1 Accuracy** | **91.97%** | Probability that the model's single highest-confidence crop matches the ground truth. |
| **Top-3 Accuracy** | **99.02%** | Probability that the true compatible crop is within the top 3 recommendations. |
| **Top-5 Accuracy** | **100.00%** | Provides the farmer with 5 viable, ecologically validated crop choices. |

---

## 3. High-Level Feature Importance
The trained XGBoost model leverages agronomic climate boundaries (`Avg Temp`, `Max/Min Temp`, `Avg/Min/Max Relative Humidity`), geographic district historical viability, farm size (`Area`), and `Season` to produce probabilistically calibrated candidate rankings.

---

## 4. Diagnostics & Artifacts
- **Confusion Matrix**: `reports/figures/confusion_matrix.png`
- **Feature Importance**: `reports/figures/feature_importance.png`
- **Per-Class F1 Distribution**: `reports/figures/per_class_f1.png`
- **Per-Class Metrics CSV**: `reports/per_class_metrics.csv`
