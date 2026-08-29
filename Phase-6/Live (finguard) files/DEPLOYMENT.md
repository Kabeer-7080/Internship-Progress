# FinGuard Deployment Guide

## Local

Backend:
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Frontend (second terminal):
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

No local database setup is required by default: when no database environment variables are present, FinGuard uses SQLite. For MySQL, set `DB_ENGINE=mysql` and the MySQL variables shown in `backend/.env.example`.

## Railway: Backend

Create/use a Railway service for the backend.

- Root Directory: `backend`
- Build: Nixpacks (the repository includes `railway.json` and `nixpacks.toml`)
- Start command:
  `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Set these variables:
- `JWT_SECRET` = a strong random value
- `CORS_ORIGINS` = your frontend HTTPS URL
- Railway MySQL variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`) or `DATABASE_URL`

After deployment, test:
- `/`
- `/health`
- `/docs`

## Railway: Frontend

Create a second Railway service.

- Root Directory: `frontend`
- Build: Nixpacks
- Start command:
  `npm run preview -- --host 0.0.0.0 --port $PORT`

Set:
`VITE_API_BASE_URL=https://YOUR-BACKEND-DOMAIN`

Vite environment variables are build-time values, so redeploy after changing them.

## Important

Do not upload or commit `.env` files containing secrets. The example files are safe templates.

The frontend contains a production fallback for the current backend URL, but `VITE_API_BASE_URL` is preferred so the backend domain can be changed without editing source code.
