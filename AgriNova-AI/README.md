# AgriNova AI — Agricultural Intelligence

AgriNova AI provides crop recommendations, fertilizer guidance, weather information, and agricultural decision support for the AgriNova Smart Agriculture Platform.

## Architecture

The integrated platform uses the following architecture:

```text
Next.js Frontend
       |
       v
AgriNova-Server
Main Node.js / Express Backend
       |
       v
AgriNova-AI/ai-service
Python FastAPI AI Microservice (port 8000)
       |
       +-- Crop prediction model
       +-- Bangladesh crop catalog and season engine
       +-- BARC crop zoning and fertilizer guidance
       +-- Open-Meteo weather service
       |
       v
Agricultural recommendations
```

The main application backend calls the Python service through its configured `AI_SERVICE_URL`, which defaults to `http://127.0.0.1:8000`.

### Components

- **`ai-service/`** — Python FastAPI service, prediction model, agricultural data, recommendation engines, and tests.
- **`backend/`** — Separate Node.js/Express AI API with its own routes, authentication middleware, and recommendation-history models. It is an additional service, not the main platform backend.
- **`docs/`** — AI API reference, model methodology, BARC integration, fertilizer guidance, weather engine, and model documentation.
- **`reports/`** — Model evaluation results, metrics, and generated figures.

## Prerequisites

- Python 3.10 or a compatible version supported by `ai-service/requirements.txt`.
- Node.js 18 or later for the Node.js services.
- MongoDB configuration for services that persist application data.
- Network access for live weather requests to Open-Meteo.

## Run the Python AI Service

From the repository root:

```powershell
cd AgriNova-AI/ai-service
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

The service should then be available at:

- Health check: `http://127.0.0.1:8000/health`
- Model information: `http://127.0.0.1:8000/model/info`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

Keep the service running while the main backend needs AI recommendations.

## Configure the Main Backend

Configure `AgriNova-Server` using its own environment variables and set:

```dotenv
AI_SERVICE_URL=http://127.0.0.1:8000
```

Use the main backend's README for its installation, database setup, authentication configuration, and deployment instructions.

## Optional AI Node.js Backend

The separate `backend/` service can be run independently when its endpoints and recommendation-history functionality are needed.

From the repository root:

```powershell
cd AgriNova-AI/backend
npm ci
```

Create a local `.env` based on `.env.example` and configure a strong JWT secret, MongoDB URI, and AI service URL before starting it:

```powershell
npm start
```

Do not use the example JWT secret in a deployed environment. Do not commit real `.env` files or credentials.

## Run Tests

Python AI service tests:

```powershell
cd AgriNova-AI/ai-service
python -m pytest tests -v
```

Separate AI Node.js backend tests:

```powershell
cd AgriNova-AI/backend
npm test
```

Main platform backend checks should be run from `AgriNova-Server`, following that project's README.

## Notes

- The checked-in model files allow the AI service to load an existing trained model; retraining is not required just to start the API.
- Training and evaluation scripts may take additional time and can regenerate model artifacts.
- Weather responses depend on external service availability and the service's cache/fallback behavior.
- Model accuracy figures in the documentation are reported evaluation results, not a guarantee of field performance or crop yield.
