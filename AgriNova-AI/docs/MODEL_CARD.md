# AgriNova Model Card: Bangladesh Crop Recommendation

## 1. Model Details
- **Model Name**: AgriNova XGBoost Crop Classifier
- **Model Version**: `1.0.0`
- **Model Type**: Extreme Gradient Boosted Multi-Class Decision Tree (`multi:softprob`)
- **Developer**: AgriNova AI & Backend Engineering Team (Lead: Mashiur Rahaman)
- **License**: MIT / Non-commercial university research
- **Release Date**: September 2026

---

## 2. Intended Use
- **Primary Intended Use**: Agro-climatic and geographical decision support for smallholder farmers and agricultural extension officers across all 64 administrative districts of Bangladesh. Recommends viable candidate crops suited to the specific district, cropping season (`Kharif 1`, `Kharif 2`, `Rabi`), field scale, and environmental parameters.
- **Primary Users**: Smallholder farmers, DAE agricultural extension agents, farm planners in Bangladesh.
- **Out-of-Scope / Unsupported Uses**:
  - The model does **NOT** predict or guarantee monetary crop yield or commercial profits.
  - The model should **NOT** be used as the sole determinant for agricultural loans, insurance claim repudiation, or disaster relief decisions.
  - Not intended for non-Bangladesh agroecological zones without localized retraining.

---

## 3. Training Data & Provenance
- **Primary Dataset**: **SPAS-Dataset-BD** (Version 2.0, published in *Data in Brief*, 2025, DOI: `10.1016/j.dib.2025.111727`, PMC: `PMC12197984`).
- **Dataset Composition**: 4,608 observations across 72 unique crop species and 64 Bangladesh districts.
- **Provenance**: Hybrid compilation derived from the **Bangladesh Bureau of Statistics (BBS) 2022 Statistical Yearbook** cross-validated against field surveys from 223 farmers across 10 agroecologically diverse districts.
- **Pre-processing**:
  - Cleaned `#REF!` formula error in Noakhali to restore `Taramind`.
  - Imputed missing `Season` for Wood Apple in Barguna to `Kharif 1`.
  - Replaced `#DIV/0!` in `AP Ratio` (where Area=0 and Production=0) with 0.0.
  - Standardized character encodings for all nominal fields.

---

## 4. Evaluation & Performance Metrics
- **Holdout Test Set (20% Stratified Split)**:
  - **Top-1 Accuracy**: `91.97%`
  - **Top-3 Decision Support Accuracy**: `99.02%`
  - **Top-5 Decision Support Accuracy**: `100.00%`
  - **Macro-Averaged F1 Score**: `0.9188`
  - **Weighted F1 Score**: `0.9192`
- **5-Fold Stratified Cross-Validation**:
  - **CV Macro-F1 Mean**: `0.9070`
  - **CV Macro-F1 Std Dev**: `± 0.0083`

---

## 5. Domain Constraints & Ethical Safeguards
1. **Decision Support Labeling**: Probabilistic scores are strictly labeled as "Model Confidence Scores", never as "probability of harvest success".
2. **Post-Outcome Leakage Prevention**: Features such as `Production` and `AP Ratio` (Yield) are strictly removed from training inputs.
3. **Official BARC Layering**: Model recommendations are cross-validated against official **BARC National Crop Zoning** data (FAO land suitability S1, S2, S3, S4, N) and **BARC FRG-2024** fertilizer standards.

---

## 6. Limitations & Known Risks
- **Extreme Weather Anomalies**: Flash floods (e.g. Haor basin pre-monsoon floods), severe cyclones, or localized tidal surges may disrupt agronomic viability regardless of historical district suitability. Real-time Open-Meteo weather integration helps mitigate, but cannot eliminate, extreme climate risk.
- **Micro-Soil Variation**: District-level defaults are general baselines. Farmers with atypical soil salinity or acid sulfate soils should confirm recommendations via localized soil testing with the Soil Resource Development Institute (SRDI).
