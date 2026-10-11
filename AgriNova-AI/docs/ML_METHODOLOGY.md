# AgriNova ML Methodology & Training Pipeline

## 1. Problem Formulation
- **Objective**: Multi-Class Crop Suitability Recommendation for smallholder farmers across all 64 Bangladesh administrative districts.
- **Dataset Foundation**: **SPAS-Dataset-BD (Version 2.0)**, comprising 4,608 observations spanning 72 distinct Bangladesh agricultural crops across 64 administrative districts.
- **Target Variable**: `Crop Name` ($K = 72$ classes).
- **Evaluation Priority**: Macro-Averaged F1 Score ($\text{Macro-F1}$), balanced across both staple commodities (Aman, Boro, Aus, Wheat, Potato) and traditional/underrepresented crops (Cheena, Tamarind, Betelnut).

---

## 2. Leakage Mitigation & Feature Engineering
As documented in `docs/FEATURE_SELECTION.md`:
- **Strictly Excluded**: `Production` and `AP Ratio` (Yield) are excluded from model inputs to avoid post-harvest target leakage.
- **Strictly Separated**: Phenological window descriptions (`Transplant`, `Growth`, `Harvest`) are separated into the **Agricultural Domain Knowledge Layer** rather than predictive features to eliminate trivial string memorization.
- **Model Inputs**:
  - `District` (One-hot encoded)
  - `Season` (`Kharif 1`, `Kharif 2`, `Rabi`)
  - `Area` (Farm surface acreage, Standard scaled)
  - `Avg Temp`, `Avg Humidity`, `Max Temp`, `Min Temp`, `Max Relative Humidity`, `Min Relative Humidity` (Physiological climate envelopes, Standard scaled)

---

## 3. Cross-Validation & Candidate Benchmarking

Each model was trained using **5-Fold Stratified Cross-Validation** on the training partition ($80\%$) with a fixed random seed (`random_state=42`) and evaluated on the holdout test set ($20\%$):

| Model Architecture | Test Accuracy | Test Macro-F1 | Test Weighted-F1 | 5-Fold CV Macro-F1 (Mean ± Std) | Training Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBoost (Champion)** | **91.97%** | **0.9188** | **0.9192** | **0.9070 ± 0.0083** | 18.01s |
| **Random Forest** | 86.44% | 0.8651 | 0.8647 | 0.8739 ± 0.0035 | 2.82s |
| **Logistic Regression (Multinomial)** | 80.37% | 0.8032 | 0.8035 | 0.8092 ± 0.0026 | 4.42s |
| **K-Nearest Neighbors (KNN)** | 61.17% | 0.6110 | 0.6121 | 0.6858 ± 0.0072 | 0.23s |

---

## 4. Final Selected Champion: XGBoost
- **Rationale**: Highest holdout generalization ($\text{Test Macro-F1} = 0.9188$, $\text{Test Accuracy} = 91.97\%$) and superior cross-validation consistency ($0.9070 \pm 0.0083$).
- **Hyperparameters**:
  - `n_estimators`: 150
  - `learning_rate`: 0.1
  - `max_depth`: 6
  - `subsample`: 0.8
  - `colsample_bytree`: 0.8
  - `objective`: `multi:softprob`
  - `eval_metric`: `mlogloss`
- **Top-K Decision Support Metrics**:
  - **Top-1 Accuracy**: $91.97\%$
  - **Top-3 Accuracy**: $99.02\%$
  - **Top-5 Accuracy**: $100.00\%$
