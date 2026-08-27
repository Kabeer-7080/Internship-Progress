# Day 48 — Backend Deployment & Production Readiness

## 1. Overview
The goal of Day 48 is to make the FastAPI backend and ML risk engine accessible over the internet through a live cloud URL, removing the dependency on `localhost:8000`.

---

## 2. Production Architecture

```
React Frontend (Vite)
  │ [Reads VITE_API_BASE_URL]
  ▼
Live FastAPI Backend (Render / Railway / Cloud VM)
  ├─ CORS Middleware (Configurable via CORS_ORIGINS)
  ├─ JWT Authentication & Route Protection
  ├─ ML Risk Engine (scikit-learn RandomForest loaded from backend/models/risk_model.pkl)
  └─ Database Layer (MySQL Cloud DB or SQLite continuous fallback)
```

---

## 3. Backend Preparation & File Inventory

1. **`backend/requirements.txt`**:
   - `fastapi>=0.115.0`
   - `uvicorn[standard]>=0.30.0`
   - `python-jose[cryptography]>=3.3.0`
   - `pydantic[email]>=2.8.0`
   - `scikit-learn>=1.5.0`
   - `numpy>=1.26.0`
   - `joblib>=1.4.0`
   - `SQLAlchemy>=2.0.0`
   - `PyMySQL>=1.1.0`
   - `cryptography>=42.0.0`
   - `werkzeug>=3.0.0`
   - `python-dotenv>=1.0.0`
   - `httpx>=0.27.0`

2. **`backend/models/risk_model.pkl`**:
   - Serialized scikit-learn model packaged directly with the repository.
   - Built-in self-healing: if the pickle file is ever missing, `RiskEngine._build_model()` automatically generates, trains, and serializes a new model on startup.

3. **`backend/Procfile` & `render.yaml`**:
   - Standard deployment descriptors for zero-configuration cloud deployment.

---

## 4. Deployment Instructions

### Option A: Deploy on Render (Recommended)

1. Push your FinGuard repository to GitHub / GitLab.
2. Log into [Render.com](https://render.com) and click **"New +" → "Web Service"**.
3. Select your repository.
4. Configure the service:
   - **Name**: `finguard-backend`
   - **Region**: Closest to your users (e.g., Oregon / Frankfurt / Singapore)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables in the Render dashboard:
   - `JWT_SECRET`: Generate a secure random string.
   - `CORS_ORIGINS`: `*` (or your frontend deployment domain).
   - `DB_ENGINE`: `sqlite` (for zero-cost embedded DB) or `mysql` if connecting to external MySQL.
   - *(Optional for MySQL)*: `DATABASE_URL` or `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.
6. Click **"Deploy Web Service"**.
7. Once deployment finishes, copy your live backend URL (e.g. `https://finguard-backend-xxxx.onrender.com`).

---

### Option B: Deploy on Railway

1. Log into [Railway.app](https://railway.app) and create a **"New Project"**.
2. Deploy from your GitHub repository.
3. In service settings, set the **Root Directory** to `backend`.
4. Railway will automatically detect Python and use the `Procfile` / start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Add environment variables under the **Variables** tab (`JWT_SECRET`, `CORS_ORIGINS`).
6. Under **Settings → Networking**, generate a public domain.

---

## 5. Connecting the React Frontend to the Live Backend

1. In the `frontend` folder, create `.env` (or set environment variables on your frontend host like Vercel / Netlify):
   ```env
   VITE_API_BASE_URL=https://your-finguard-backend.onrender.com
   ```
2. Build or run the frontend:
   ```bash
   cd frontend
   npm run build
   ```
3. The frontend `api.ts` automatically uses `import.meta.env.VITE_API_BASE_URL` when making API requests.

---

## 6. Live API Verification Checklist

Test the following endpoints on the deployed URL (`https://<YOUR-LIVE-BACKEND>`):

| Step | Endpoint & Method | Expected Result |
| :--- | :--- | :--- |
| 1. Health Check | `GET /health` | `HTTP 200` with `{"status":"ok","database":"connected","model":"loaded"}` |
| 2. Direct ML Prediction | `POST /predict` | `HTTP 200` with calculated risk score, verdict, and factors |
| 3. User Login | `POST /auth/login` | `HTTP 200` with JWT access token |
| 4. Fetch Assessments | `GET /assessments` (Bearer Token) | `HTTP 200` with list of assessments |
| 5. Create Assessment | `POST /assessments` (Bearer Token) | `HTTP 201` with newly scored assessment stored in database |
| 6. Update Assessment | `PUT /assessments/{id}` (Bearer Token) | `HTTP 200` with updated and rescored assessment |
| 7. Delete Assessment | `DELETE /assessments/{id}` (Bearer Token) | `HTTP 200` with deletion confirmation |

---

## 7. Required Screenshots for Internship Submission

1. **Cloud Deployment Dashboard**: Showing the active, healthy web service status in Render or Railway.
2. **Live `/health` Endpoint**: Browser or Postman showing `GET https://<deployed-url>/health` returning `200 OK`.
3. **Live `/predict` or `/assessments` Endpoint**: Showing the live ML engine scoring an application.
4. **Frontend Connected to Live Backend**: Showing the FinGuard UI operating against the deployed cloud backend URL.
5. **Environment Variables Configuration**: Render/Railway dashboard showing `JWT_SECRET`, `CORS_ORIGINS`, and database config (with sensitive secrets masked).
