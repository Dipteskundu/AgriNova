# SPAS-Dataset-BD: Data Dictionary

## Dataset Overview
- **Dataset Title**: SPAS-Dataset-BD: Dataset for Smart Precision Agriculture System in Bangladesh
- **Version**: 2.0 (Official Mendeley Data release, 2025)
- **Persistent Identifier (DOI)**: `10.17632/cphdw4z5kw.2` / `10.1016/j.dib.2025.111727`
- **Associated Publication**: *Data in Brief*, Volume 61, 2025 (PMC: PMC12197984)
- **Original Source Format**: Comma-Separated Values (CSV)
- **Total Records**: 4,608 rows
- **Total Features**: 15 columns in CSV (12 features referenced in publication)
- **Coverage**: 64 administrative districts across Bangladesh, 72 unique crop species (+1 Excel `#REF!` corrupted entry restored to *Taramind*).
- **Collection Methodology**: Hybrid integration of secondary agricultural statistics from the **Bangladesh Bureau of Statistics (BBS) 2022 Statistical Yearbook** with primary field surveys from 223 farmers across 10 agroecologically diverse districts.

---

## Column-by-Column Specification

| Column Name | Data Type | Physical Meaning | Unit | Source | Role in AgriNova | Missing Values | Limitations & Processing Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Area** | Integer | Harvested land area under cultivation for this crop in this district | Acre | BBS 2022 Yearbook | Feature (Historical scale / farm context) | 0 | District-level aggregate in BBS yearbook, ranging from minor garden plots to major regional acreages. |
| **AP Ratio** | Float | Area-to-Production / Yield Ratio ($\text{Production} / \text{Area}$) | Metric tons / acre | Computed from BBS data | **Leakage Variable** (Excluded from direct training input; used for yield baseline scoring) | 0 | Direct mathematical derivation of target crop's district productivity. Including this directly in training would leak target identity. |
| **District** | String | Administrative district name in Bangladesh | Nominal (64 districts) | BBS 2022 Yearbook | **Feature** (Geographic context & AEZ mapping) | 0 | Covers all 64 districts. Categorically encoded for machine learning models. |
| **Season** | String | Bangladesh cropping season | Nominal (`Kharif 1`, `Kharif 2`, `Rabi`) | Primary farmer survey | **Feature & Domain Filter** | 1 (Row 4548, Wood Apple in Barguna; imputed to `Kharif 1`) | Captures Bangladesh's tripartite agricultural calendar. |
| **Avg Temp** | Float | Crop-specific optimal average temperature requirement | $^\circ\text{C}$ | Literature / Farmer survey | **Feature** (Agronomic climate envelope) | 0 | Constant per crop across all 64 districts. Represents crop's physiological preference. |
| **Avg Humidity** | Float | Crop-specific optimal average relative humidity | $\%$ | Literature / Farmer survey | **Feature** (Agronomic moisture envelope) | 0 | Constant per crop across all 64 districts. |
| **Crop Name** | String | Cultivated crop identity | Categorical (72 crops) | BBS / Field survey | **TARGET / LABEL** | 1 (`#REF!` error at Row 4401 in Noakhali; verified as `Taramind`) | Primary prediction target for the crop recommendation engine. |
| **Transplant** | String | Recommended transplanting or direct sowing calendar month | Month name / range | Primary farmer survey | **Domain Knowledge Layer** | 0 | Phenological timing; used in agricultural calendar & advisory guidance. |
| **Growth** | String | Active vegetative and reproductive growth period | Month range | Primary farmer survey | **Domain Knowledge Layer** | 0 | Constant per crop; used for crop stage & pest/disease advisory. |
| **Harvest** | String | Harvesting calendar window | Month range | Primary farmer survey | **Domain Knowledge Layer** | 0 | Constant per crop; used for harvest planning and marketing advisory. |
| **Production** | Integer | Total district production volume | Metric tons ($t$) | BBS 2022 Yearbook | **Leakage Variable** (Excluded from direct training input) | 0 | Post-harvest outcome. Strictly excluded from predictive features to eliminate target leakage. |
| **Max Temp** | Float | Maximum tolerable ambient temperature for crop | $^\circ\text{C}$ | Literature / Farmer survey | **Feature** (Heat tolerance threshold) | 0 | Constant per crop. Used for weather stress alert triggers. |
| **Min Temp** | Float | Minimum tolerable ambient temperature for crop | $^\circ\text{C}$ | Literature / Farmer survey | **Feature** (Cold tolerance threshold) | 0 | Constant per crop. Used for cold stress and frost alerts. |
| **Max Relative Humidity** | Float | Upper relative humidity boundary | $\%$ | Literature / Farmer survey | **Feature** (Fungal/disease risk boundary) | 0 | Constant per crop. Used for disease warning rules. |
| **Min Relative Humidity** | Float | Lower relative humidity boundary | $\%$ | Literature / Farmer survey | **Feature** (Aridity/drought stress boundary) | 0 | Constant per crop. Used for moisture stress rules. |

---

## Data Cleaning & Quality Enhancements Applied in AgriNova
1. **Row 4401 Repair**: Restored `#REF!` formula error in Noakhali district to `Taramind`, based on adjacent contiguous records and BBS documentation.
2. **Row 4548 Repair**: Imputed missing `Season` for Wood Apple in Barguna district to `Kharif 1`, perfectly consistent with all remaining 63 districts.
3. **Unicode Apostrophe Normalization**: Standardized `Lady’s Finger` (`\xe2\x80\x99`) to ASCII `Lady's Finger`.
4. **Target Label Encoding**: Verified 72 unique crop classes with exactly 64 district observations each (balance: 64 samples per class, perfectly balanced across districts).
