# FinGuard — Smart Loan & Fraud Risk Analyzer

FinGuard is a fintech risk-operations dashboard for loan and transaction assessment, fraud/risk scoring, explainable ML signals, assessment history, and team management.

## Architecture

```text
React + Vite frontend
        |
        | REST + JWT
        v
FastAPI backend
        |
        +--> SQLAlchemy
        |      |
        |      +--> MySQL (production / optional local)
        |      +--> SQLite (zero-configuration local fallback)
        |
        +--> Multi-model ML risk engine
```

## Local development

### 1. Backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000` and Swagger UI at `http://localhost:8000/docs`.

For zero-configuration local development, set `DB_ENGINE=sqlite` in `backend/.env`. If `DB_ENGINE` is omitted and no database variables are supplied, the application also defaults to SQLite. To use local MySQL, set `DB_ENGINE=mysql` and provide the MySQL variables from `backend/.env.example`.

### 2. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Local Vite builds use `http://localhost:8000` automatically.

## Production / Railway

The project is prepared for two Railway services:

- **Frontend service:** set its Root Directory to `frontend`.
- **Backend service:** set its Root Directory to `backend`.

### Backend

Railway can use `backend/railway.json` or the following start command:

```text
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required production variables include:

- `JWT_SECRET` — use a strong random secret.
- `CORS_ORIGINS` — comma-separated frontend origins, for example:
  `https://your-frontend-domain`
- Railway MySQL variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`) or a `DATABASE_URL`.

### Frontend

Set:

```text
VITE_API_BASE_URL=https://your-backend-domain
```

The repository also contains `.env.production` for the current Railway backend URL. Update it if the backend domain changes.

After changing a Vite environment variable, rebuild/redeploy the frontend because Vite injects environment variables at build time.

## Main API routes

### Health & metadata
- `GET /`
- `GET /health`
- `GET /api/health`
- `GET /model-info`
- `GET /api/model-info`

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Risk engine
- `POST /predict`

### Assessments (JWT protected)
- `POST /assessments`
- `GET /assessments`
- `GET /assessments/{id}`
- `PUT /assessments/{id}`
- `DELETE /assessments/{id}`

### Team (JWT protected)
- `GET /team`
- `POST /team`
- `PUT /team/{id}`
- `DELETE /team/{id}`

## Demo credentials

The development seed creates:

- `analyst@finguard.io` / `password`
- `kabeer@finguard.io` / `password`

Change production credentials and `JWT_SECRET` before real-world use.

## Notes

- Do not commit `.env` files or production secrets.
- `backend/.env.example` and `frontend/.env.example` contain safe configuration templates.
- ML model artifacts live under `backend/models/`.
