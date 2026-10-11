# AgriNova — Smart Agriculture & Farm-to-Market Platform

**AgriNova** is a Bangladesh-focused precision agriculture and farm-to-market platform connecting smallholders with agricultural intelligence, official research council advisories, and marketplace opportunities.

---

## High-Level System Architecture

```
React / Vite Frontend (Farmer Portal, Admin Portal, Marketplace)
       ↓
Node.js / Express Main Backend (Authentication, Field Management, Mongoose)
       ↓
Python FastAPI AI Microservice (Port 8000)
┌────────────────────────────────────────────────────────────┐
│              Agricultural Intelligence Engine              │
│                                                            │
│   SPAS-Dataset-BD Crop ML Model (XGBoost 91.97% Top-1)     │
│                     ↓                                      │
│   Bangladesh Crop Catalog & Season Engine                  │
│                     ↓                                      │
│   BARC Official Crop Zoning (64 Districts, 467 Upazilas)   │
│                     ↓                                      │
│   BARC Fertilizer Recommendation Guide 2024 (FRG-2024)     │
│                     ↓                                      │
│   Open-Meteo Weather Service & Agricultural Alerts         │
└────────────────────────────────────────────────────────────┘
       ↓
MongoDB Atlas (Audit Trail & Recommendation History)
```

---

## Directory Structure

```
AgriNova AI/
├── ai-service/                # Python FastAPI AI Microservice
│   ├── api/                   # FastAPI routes, schemas, main.py
│   ├── data/                  # raw/ and processed/ datasets (SPAS, BARC)
│   ├── models/                # Saved champion models & metadata
│   ├── src/                   # ML training, evaluation, domain engines
│   ├── tests/                 # Pytest test suite (9 passing tests)
│   └── requirements.txt       # Python dependencies
│
├── backend/                   # Node.js / Express Main Backend
│   ├── src/                   # Express app, controllers, models, routes
│   ├── tests/                 # Node.js test suite (5 passing tests)
│   └── package.json           # Node.js dependencies
│
├── docs/                      # Complete Technical Documentation
│   ├── SPAS_DATA_DICTIONARY.md
│   ├── FEATURE_SELECTION.md
│   ├── ML_METHODOLOGY.md
│   ├── MODEL_EVALUATION.md
│   ├── BARC_INTEGRATION.md
│   ├── FERTILIZER_ENGINE.md
│   ├── WEATHER_ENGINE.md
│   ├── AI_API.md
│   └── MODEL_CARD.md
│
├── reports/                   # Model benchmarks and figures
│   ├── figures/               # Confusion matrix, feature importance, distributions
│   ├── model_comparison.csv
│   └── model_comparison.md
│
└── README.md
```

---

## Getting Started

### 1. Launch Python AI Service
```bash
cd ai-service
pip install -r requirements.txt
python src/train.py
python -m uvicorn api.main:app --reload --port 8000
```

### 2. Launch Node.js Backend
```bash
cd backend
npm install
npm start
```

### 3. Run Automated Tests
- Python AI Service: `python -m pytest ai-service/tests -v`
- Node.js Backend: `cd backend && npm test`
