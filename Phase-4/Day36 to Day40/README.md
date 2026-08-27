# FinGuard — Smart Loan & Fraud Risk Analyzer

FinGuard is a fintech risk-operations dashboard providing loan and transaction assessments, risk verdicts, explainable ML model signals, assessment history, team member management, and role-aware FastAPI REST endpoints.

## Stack & Architecture

- **Backend**: Python 3.12, FastAPI, SQLAlchemy ORM, Werkzeug Password Hashing, PyMySQL
- **Database**: MySQL (`finguard` database) with persistent SQLite (`finguard.db`) fallback when MySQL is unavailable
- **Authentication**: JWT Bearer Tokens (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`) with token revocation blacklisting
- **Frontend**: React 19, TypeScript, Vite, Recharts, Lucide Icons

## Running Locally

### Backend

```powershell
cd backend
py -3.12 -m uvicorn app.main:app --reload --port 8000
```

The FastAPI backend will automatically verify and initialize the database tables on startup. The API documentation is available at `http://127.0.0.1:8000/docs`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Key API Routes

### Authentication (`/auth`)
- `POST /auth/register` — User registration & password hashing
- `POST /auth/login` — Authentication & JWT access token generation
- `GET /auth/me` — Protected user profile
- `POST /auth/logout` — Revoke access token

### Risk Assessments (`/assessments` - Protected)
- `POST /assessments` — Submit loan/transaction for ML risk scoring
- `GET /assessments` — List all assessments (ordered by newest)
- `GET /assessments/{id}` — Get detailed assessment & risk factors
- `PUT /assessments/{id}` — Update payload & re-trigger ML model scoring
- `DELETE /assessments/{id}` — Remove assessment

### Team Operations (`/team` - Protected)
- `GET /team` — List all team members
- `POST /team` — Add new team member
- `PUT /team/{id}` — Update team member status/role
- `DELETE /team/{id}` — Remove team member
