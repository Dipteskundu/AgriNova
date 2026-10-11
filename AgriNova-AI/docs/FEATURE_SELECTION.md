# Feature Selection & Data Leakage Analysis

## 1. Context & Motivation

AgriNova recommends crops to Bangladeshi smallholders prior to field preparation and planting. A critical requirement for any operational ML recommendation system is the **elimination of target leakage and post-outcome variables**. 

The **SPAS-Dataset-BD** contains 15 raw columns derived from the BBS 2022 Yearbook and farmer surveys. Blindly feeding all columns into an ML algorithm results in severe data leakage and artificial 100% accuracy that collapses when deployed to a real farmer.

---

## 2. Rigorous Feature Classification

Every feature in `SPAS-Dataset-BD` is categorized into one of five functional groups:

| Category | Column | Rationale & Handling |
| :--- | :--- | :--- |
| **D. Target / Label** | `Crop Name` | The primary prediction target (72 distinct crop species across Bangladesh). |
| **B. Potential Target Leakage** | `Production` | **EXCLUDED FROM TRAINING INPUTS**. In the BBS yearbook, total production directly reflects crop-specific tonnage. A farmer seeking a pre-planting recommendation cannot provide post-harvest production. |
| **B. Potential Target Leakage** | `AP Ratio` | **EXCLUDED FROM TRAINING INPUTS**. $\text{AP Ratio} = \frac{\text{Production}}{\text{Area}}$ is the yield. Knowing yield before planting is impossible; feeding yield into a model leaks the target identity. However, historical district yield is preserved as a post-prediction agronomic benchmark. |
| **E. Post-Outcome / Lifecycle Variables** | `Transplant`, `Growth`, `Harvest` | **EXCLUDED FROM TRAINING INPUTS**. Phenological calendar dates (e.g. "Transplant in June, Harvest in Nov to Dec") are specific descriptors of the crop's lifecycle. Feeding them as input features produces trivial memorization rather than agronomic decision support. These variables are placed into the **Agricultural Domain Knowledge Layer** for advisory generation. |
| **C. Metadata / Contextual** | `Season` | **VALID FEATURE & DOMAIN FILTER**. Identifies the agricultural season (`Kharif 1`, `Kharif 2`, `Rabi`). Used both as a primary predictive input and as a domain-level post-prediction filter. |
| **A. Valid Prediction Features** | `District` | **VALID FEATURE**. Geographical location provides the agroecological zone (AEZ) context, soil types, and regional historical viability. |
| **A. Valid Prediction Features** | `Area` | **VALID FEATURE**. Farm size / cultivation scale (Acre / Decimal) influences crop suitability (e.g. homestead garden vs. commercial grain production). |
| **A. Valid Prediction Features** | `Avg Temp`, `Max Temp`, `Min Temp`, `Avg Humidity`, `Max Relative Humidity`, `Min Relative Humidity` | **VALID FEATURES (Agronomic Envelopes)**. In SPAS-Dataset-BD, these define the crop's physiological climate tolerance envelope. At inference time, live weather observations from **Open-Meteo** (and seasonal climatology) are matched against these environmental envelopes to score suitability. |

---

## 3. The Two-Stage Agricultural Recommendation Paradigm

To avoid the artificial memorization of the dataset's constants while maximizing real-world predictive utility, AgriNova employs a **Two-Stage Hybrid Architecture**:

```
Stage 1: Multi-Model Machine Learning Prior
   Input: [District, Season, Field Area, Scaled Environmental Context]
   Output: Top-K Probabilistic Crop Candidates based on historical Bangladesh district cultivation patterns

Stage 2: Deterministic Domain & Constraint Engine
   Input: Candidate Crops + Farmer Input (Soil NPK, pH, Irrigation) + Real-time Open-Meteo Weather
   Steps:
     a. Crop Normalization & Canonical Mapping
     b. Season Compatibility Filter (reject off-season crops)
     c. BARC Crop Zoning Verification (S1: Very Suitable, S2: Suitable, S3: Moderately Suitable, N: Not Suitable)
     d. Real-Time Agro-Climatic Stress Check (Heat stress, chilling, waterlogging)
     e. Final Ranked Decision Support Output + BARC FRG-2024 Fertilizer Plan
```

This guarantees that:
1. The ML model is mathematically sound, free of target leakage, and properly cross-validated.
2. The domain constraints from **BARC** and **Open-Meteo** ensure the recommendations are agronomically safe, credible, and grounded in official Bangladesh government science.
