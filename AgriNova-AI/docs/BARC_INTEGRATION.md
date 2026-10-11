# BARC Crop Zoning Integration

## 1. Overview & Regulatory Origin
- **Source**: Bangladesh Agricultural Research Council (BARC), Ministry of Agriculture, Government of the People's Republic of Bangladesh.
- **Portals**:
  - BARC Crop Zoning Application: `https://apps.barc.gov.bd/cropzoning/`
  - Methodology & Introduction: `https://apps.barc.gov.bd/cropzoning/homes/intro`
  - Official Downloadable Data: `https://apps.barc.gov.bd/cropzoning/homes/downloads/2`
- **Data Acquisition**: Downloaded and compiled directly from the 15 official BARC spreadsheet files into `ai-service/data/processed/barc_crop_zoning.json`.

---

## 2. Land Suitability Classes & Standard Definitions
BARC Crop Zoning applies the Food and Agriculture Organization (FAO) framework for land evaluation, evaluating agro-edaphic and agro-climatic requirements across Bangladesh:

| Class Code | Suitability Class | Definition & Agronomic Implications |
| :--- | :--- | :--- |
| **S1** | **Very Suitable** | Land without significant limitations to sustained cultivation; optimal expected physical yields under standard management. |
| **S2** | **Suitable** | Land with moderate limitations that slightly reduce yields or increase required management inputs. |
| **S3** | **Moderately Suitable** | Land with notable soil or climatic constraints that appreciably reduce yields or require specialized agronomic interventions. |
| **S4** | **Marginally Suitable** | Severe limitations that restrict economic profitability under ordinary conditions. |
| **N** | **Not Suitable** | Land with environmental, hydrological, or edaphic constraints precluding sustained cultivation. |

---

## 3. Supported Crops
The 16 core crops evaluated under BARC National Crop Zoning include:
1. **Aus Rice** (Summer rice, Kharif 1)
2. **Aman Rice** (Monsoon rice, Kharif 2)
3. **Boro Rice** (Winter irrigated rice, Rabi)
4. **Wheat** (Rabi cereal)
5. **Maize** (Kharif and Rabi grain)
6. **Potato** (Irish potato, Rabi tuber)
7. **Lentil** (Masur, Rabi pulse)
8. **Mungbean** (Mug, Kharif/Rabi pulse)
9. **Gram** (Chickpea, Rabi pulse)
10. **Mustard** (Rabi oilseed)
11. **Groundnut** (Peanut, Rabi/Kharif oilseed)
12. **Chili** (Rabi/Kharif spice)
13. **Onion** (Rabi spice)
14. **Garlic** (Rabi spice)
15. **Sugarcane** (Annual cash crop)
16. **Jute** (Kharif 1 fiber crop)

---

## 4. Architectural Rules
1. **No Artificial Probabilities**: BARC classifications are qualitative agro-edaphic and agro-climatic categories. AgriNova presents them as authoritative qualitative ratings (`Very Suitable`, `Suitable`, `Moderately Suitable`, `Marginally Suitable`, `Not Suitable`), never converting them into fake percentages.
2. **Hierarchical Lookup**: When an upazila is provided by the farmer, the specific upazila land parcel distribution is retrieved; otherwise, the district aggregate suitability is returned.
3. **Graceful Transparency**: For crops not among the 16 core BARC-zoned species (e.g. Tamarind, Betelnut, Cheena), the system transparently indicates that BARC zoning data is unclassified and falls back on SPAS-Dataset-BD district historical records.
