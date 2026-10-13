# AgriNova AI Microservice

High-performance Python FastAPI service providing agricultural intelligence for the AgriNova Bangladesh Smart Agriculture Platform.

## Features
- **Machine Learning**: Multi-class crop recommendation trained on **SPAS-Dataset-BD** (v2.0, 72 crops, 64 Bangladesh districts).
- **BARC Crop Zoning**: Authoritative land suitability lookup across 64 districts and 467 upazilas for 16 core crops.
- **Fertilizer Engine (FRG-2024)**: Deterministic nutrient calculations and commercial fertilizer product doses scaled to field area (acre/decimal/ha).
- **Weather Service & Alert Engine**: Real-time agro-climatic forecasts and alerts via Open-Meteo with 1-hour caching.

---

## Quickstart & Reproducibility

### 1. Setup Environment
```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment (optional)
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Train Models
```bash
# Trains Logistic Regression, KNN, Random Forest, and XGBoost with 5-Fold Stratified CV
python src/train.py
```

### 3. Evaluate Champion Model
```bash
# Computes Top-K accuracies, confusion matrix, and feature importances
python src/evaluate.py
```

### 4. Run Automated Test Suite
```bash
pytest tests -v
```

### 5. Launch FastAPI Microservice
```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive OpenAPI documentation will be available at: `http://127.0.0.1:8000/docs`.
