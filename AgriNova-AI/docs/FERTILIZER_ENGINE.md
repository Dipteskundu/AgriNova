# BARC Fertilizer Recommendation Engine (FRG-2024)

## 1. Regulatory Framework & Principles
The AgriNova Fertilizer Engine directly implements the scientific methodology of the **BARC Fertilizer Recommendation Guide 2024 (FRG-2024)** published on October 30, 2024, by the Bangladesh Agricultural Research Council (BARC).

Key Principles:
1. **Soil-Test-Based Precision**: Avoid blanket fertilizer applications. Rates are calculated to replenish nutrient removal while accounting for soil indigenous nutrient supply.
2. **Deterministic Mathematical Formulations**: Nutrient doses are computed using verified elemental proportions, never predicted as random numbers by ML models.
3. **Transparent Agronomic Scaling**: Supports the standard land units used by Bangladeshi farmers: **Decimal** (Shatak), **Acre**, and **Hectare**.

---

## 2. Land Area Conversion Standards

$$\begin{aligned}
1 \text{ Hectare (ha)} &= 2.47105 \text{ Acres} = 247.105 \text{ Decimals} = 10,000 \text{ m}^2 \\
1 \text{ Acre} &= 100 \text{ Decimals} = 0.404686 \text{ Hectares} = 4,046.86 \text{ m}^2 \\
1 \text{ Decimal (Shatak / Shotok)} &= 0.01 \text{ Acre} = 0.00404686 \text{ Hectares} \approx 40.47 \text{ m}^2
\end{aligned}$$

---

## 3. Active Elemental Fractions of Commercial Fertilizers

| Commercial Fertilizer Product | Chemical Formula / Form | Active Elemental Fraction | Mathematical Product Factor |
| :--- | :--- | :--- | :--- |
| **Urea** | $\text{CO(NH}_2)_2$ | $46\% \text{ Nitrogen (N)}$ | $\text{Urea (kg)} = \frac{\text{Required N}}{0.46}$ |
| **Triple Super Phosphate (TSP)** | $\text{Ca(H}_2\text{PO}_4)_2\cdot\text{H}_2\text{O}$ | $20\% \text{ Phosphorus (P)}$ ($46\% \text{ P}_2\text{O}_5$) | $\text{TSP (kg)} = \frac{\text{Required P}}{0.20}$ |
| **Muriate of Potash (MoP)** | $\text{KCl}$ | $50\% \text{ Potassium (K)}$ ($60\% \text{ K}_2\text{O}$) | $\text{MoP (kg)} = \frac{\text{Required K}}{0.50}$ |
| **Gypsum** | $\text{CaSO}_4\cdot2\text{H}_2\text{O}$ | $18\% \text{ Sulfur (S)}$ | $\text{Gypsum (kg)} = \frac{\text{Required S}}{0.18}$ |
| **Zinc Sulfate Monohydrate** | $\text{ZnSO}_4\cdot\text{H}_2\text{O}$ | $36\% \text{ Zinc (Zn)}$ | $\text{Zinc Sulfate (kg)} = \frac{\text{Required Zn}}{0.36}$ |
| **Boric Acid / Solubor** | $\text{H}_3\text{BO}_3$ | $17\% \text{ Boron (B)}$ | $\text{Boric Acid (kg)} = \frac{\text{Required B}}{0.17}$ |

---

## 4. Soil Test Fertility Classes (BARC FRG-2024 Table 1)

Soil parameters are mapped to BARC fertility ratings:
- **pH**: Strongly Acidic ($<4.5$), Moderately Acidic ($4.5 - 5.5$), Slightly Acidic ($5.6 - 6.5$), Neutral ($6.6 - 7.3$), Slightly Alkaline ($7.4 - 8.4$), Strongly Alkaline ($>8.4$).
- **Available Phosphorus (ppm)**: Very Low ($\le 6$), Low ($6.1 - 12$), Medium ($12.1 - 18$), Optimum ($18.1 - 24$), High ($>24$).
- **Exchangeable Potassium (meq/100g)**: Very Low ($\le 0.09$), Low ($0.091 - 0.18$), Medium ($0.181 - 0.27$), Optimum ($0.271 - 0.36$), High ($>0.36$).
- **Available Sulfur (ppm)**: Very Low ($\le 7.5$), Low ($7.6 - 15$), Medium ($15.1 - 22.5$), Optimum ($22.6 - 30$), High ($>30$).
- **Available Zinc (ppm)**: Very Low ($\le 0.45$), Low ($0.46 - 0.90$), Medium ($0.91 - 1.35$), Optimum ($1.36 - 1.80$), High ($>1.80$).
- **Available Boron (ppm)**: Very Low ($\le 0.15$), Low ($0.16 - 0.30$), Medium ($0.31 - 0.45$), Optimum ($0.46 - 0.60$), High ($>0.60$).

---

## 5. Split Application Schedule
Fertilizer efficiency in monsoon-prone tropical environments requires strict timing:
- **Basal**: Phosphate (TSP), Sulfur (Gypsum), and Zinc/Boron are immobile in soil and must be incorporated into moist soil during final plowing.
- **Top-Dressing**: Highly soluble Nitrogen (Urea) and Potassium (MoP) are split across vegetative and panicle/flowering stages to minimize volatilization and leaching losses.
