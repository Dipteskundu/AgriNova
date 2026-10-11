# AgriNova Weather Service & Agricultural Alert Engine

## 1. Provider & Data Architecture
- **Provider**: Open-Meteo (`https://open-meteo.com/`)
- **Credential Policy**: Utilizes the free, open-access tier for non-commercial educational/decision-support use (no API key required).
- **Geographic Coverage**: Built-in authoritative centroid coordinates for all 64 Bangladesh administrative districts, with direct fallback to user-supplied GPS latitude/longitude.
- **Caching Mechanism**: Local file-backed cache (`ai-service/data/processed/weather_cache.json`) indexed by rounded coordinate keys with a 1-hour Time-To-Live (TTL). Network timeouts gracefully fall back to cached forecasts or regional climatology.

---

## 2. Weather Parameters Retrieved
- **Current Observation**:
  - 2-meter air temperature ($^\circ\text{C}$)
  - 2-meter relative humidity ($\%$)
  - Instantaneous precipitation ($\text{mm}$)
  - 10-meter wind speed ($\text{km/h}$)
  - WMO weather condition code
- **7-Day Daily Forecast**:
  - Daily maximum and minimum temperatures ($^\circ\text{C}$)
  - 24-hour precipitation sum ($\text{mm}$)
  - Daily precipitation probability ($\%$)
  - Maximum wind gusts ($\text{km/h}$)

---

## 3. Agricultural Alert Taxonomy

The alert engine synthesizes raw meteorological forecasts with crop physiological limits and phenological growth stages:

| Alert Category | Meteorological Trigger | Crop Context | Recommended Farmer Action | Scientific Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Heavy Rain / Waterlogging** | $\ge 35 \text{ mm/day}$ or $\ge 70 \text{ mm/7d}$ | Sensitive crops: Potato, Wheat, Pulses, Mustard, Onion | Halt planned irrigation; open and unblock field boundary drainage ditches. | Saturated soils induce root hypoxia, halt nutrient uptake, and promote *Pythium*/*Phytophthora* rots. |
| **Heat Stress** | Forecast $T_{\max} \ge 35.5^\circ\text{C}$ or exceeds crop $T_{\max}$ | Flowering / Grain Filling stage (Rice, Wheat, Maize) | Irrigate during evening/dawn to provide evaporative cooling; avoid midday spraying. | Extreme heat desiccates pollen grains, causing spikelet sterility in cereals and blossom drop in vegetables. |
| **High Wind / Squall** | Gusts $\ge 32 \text{ km/h}$ | Tall/lodging-prone: Maize, Banana, Papaya, Sugarcane | Stake plants with bamboo props; earth up soil; postpone foliar chemical spraying. | Wind shear forces combined with moist root zones exceed stem resistance, inducing lodging. |
| **Cool Humid / Fungal Risk** | $T_{\min} \le 14^\circ\text{C}$ and $\text{RH} \ge 80\%$ | Potato, Tomato, Wheat during vegetative/bulking | Scout field daily for water-soaked lesions; ensure good air circulation. | Prolonged leaf moisture under cool conditions fulfills the epidemiological threshold for Late Blight (*P. infestans*). |
| **Dry Spell / Moisture Deficit** | $< 2 \text{ mm rain in 7 days}$ in Rabi/Kharif 1 | Active vegetative or reproductive stage | Apply supplemental stage-specific irrigation. | Evapotranspirative demand exceeds soil moisture storage, closing stomata and arresting biomass accumulation. |
