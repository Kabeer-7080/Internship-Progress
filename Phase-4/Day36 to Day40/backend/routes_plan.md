# FinGuard API Routes & Architecture Plan (Day 39 Kickoff)

**Project**: FinGuard — Smart Loan & Fraud Risk Analyzer  
**Backend Framework**: FastAPI (Python)  
**Database**: MySQL (`finguard`)  
**ML Engine**: Scikit-Learn Random Forest Classifier ([risk_engine.py](file:///c:/Karen%20AI/FinGuard-source/backend/app/services/risk_engine.py))  

---

## 1. Overview API Route Table

| Method | Route | Purpose | Authentication | ML / Risk Engine |
|--------|-------|---------|----------------|------------------|
| `GET` | `/` | System root status check | Public | No |
| `GET` | `/health` | System health check (DB & Model status) | Public | No |
| `POST` | `/auth/register` | Register a new user with hashed password | Public | No |
| `POST` | `/auth/login` | Authenticate user & issue JWT token | Public | No |
| `POST` | `/auth/logout` | Revoke active JWT session token | Protected | No |
| `GET` | `/auth/me` | Fetch authenticated user profile | Protected | No |
| `POST` | `/assessments` | Create loan/fraud risk assessment | Protected | **YES** |
| `GET` | `/assessments` | List all historical risk assessments | Protected | No |
| `GET` | `/assessments/{id}` | Get specific assessment details | Protected | No |
| `PUT` | `/assessments/{id}` | Update assessment & trigger re-scoring | Protected | **YES** |
| `DELETE` | `/assessments/{id}` | Remove assessment record | Protected | No |
| `GET` | `/team` | List team members | Protected | No |
| `POST` | `/team` | Invite / add new team member | Protected | No |
| `PUT` | `/team/{id}` | Update team member role/status | Protected | No |
| `DELETE` | `/team/{id}` | Remove team member | Protected | No |

---

## 2. Detailed Route Specifications

### SYSTEM ENDPOINTS

#### `GET /`
- **Purpose**: Server root availability check.
- **Authentication**: None (Public).
- **Request Body**: None.
- **Response**: `{"status": "running"}` (HTTP 200).
- **ML Interaction**: No.

#### `GET /health`
- **Purpose**: System health check verifying database and ML model readiness.
- **Authentication**: None (Public).
- **Request Body**: None.
- **Response**: `{"status": "ok", "database": "connected", "model": "loaded"}` (HTTP 200).
- **ML Interaction**: No.

---

### AUTHENTICATION ENDPOINTS

#### `POST /auth/register`
- **Purpose**: Register a new analyst or admin user.
- **Authentication**: None (Public).
- **Input JSON**:
  ```json
  {
    "name": "John Customer",
    "email": "john@finguard.com",
    "password": "John@12345",
    "role": "Analyst"
  }
  ```
- **Backend Flow**:
  1. Validates input via `RegisterRequest` schema.
  2. Checks for existing email in MySQL `users` table (raises 409 Conflict if found).
  3. Hashes raw password using Werkzeug `generate_password_hash()`.
  4. Inserts `password_hash` into `users` table.
- **Response**: Safe user object + access token (HTTP 201 Created).
- **ML Interaction**: No.

#### `POST /auth/login`
- **Purpose**: Authenticate user credentials and return JWT Bearer token.
- **Authentication**: None (Public).
- **Input JSON**:
  ```json
  {
    "email": "john@finguard.com",
    "password": "John@12345"
  }
  ```
- **Backend Flow**:
  1. Retrieves user record from MySQL by email.
  2. Verifies password using `check_password_hash(user.password_hash, password)`.
  3. Raises HTTP 401 Unauthorized if invalid.
  4. Generates signed JWT token using `JWT_SECRET`.
- **Response**: `{"access_token": "...", "token_type": "bearer", "user": {...}}` (HTTP 200 OK).
- **ML Interaction**: No.

#### `POST /auth/logout`
- **Purpose**: Terminate current session and invalidate JWT token.
- **Authentication**: Required (`Authorization: Bearer <token>`).
- **Backend Flow**:
  1. Validates token via `current_user` dependency.
  2. Inserts active token string into MySQL `revoked_tokens` table.
- **Response**: `{"message": "Logged out successfully"}` (HTTP 200 OK).
- **ML Interaction**: No.

#### `GET /auth/me`
- **Purpose**: Return profile of currently authenticated user.
- **Authentication**: Required (`Authorization: Bearer <token>`).
- **Response**: `{"id": "...", "name": "John Customer", "email": "john@finguard.com", "role": "Analyst"}` (HTTP 200 OK).
- **ML Interaction**: No.

---

### ASSESSMENT (RISK ENGINE & LOAN) ENDPOINTS

#### `POST /assessments`
- **Purpose**: Create a new loan application or transaction fraud assessment and evaluate risk.
- **Authentication**: Required.
- **Input JSON**:
  ```json
  {
    "subject": "Olivia Bennett",
    "kind": "Loan",
    "amount": 28000.0,
    "income": 7200.0,
    "credit_score": 764,
    "employment": "Full time",
    "term_months": 36,
    "channel": "Branch"
  }
  ```
- **ML Interaction**: **YES**.
- **Execution Pipeline**:
  ```text
  Client Request (income, amount, credit_score, employment, term_months, channel, kind)
      ↓
  RiskEngine.predict(payload)
      ↓
  Scikit-Learn Random Forest Classifier + Feature Mapping
      ↓
  Calculates score (0-100), verdict (Approved/Flagged/Rejected), factors array
      ↓
  MySQL Persistence (finguard.assessments table)
      ↓
  HTTP 201 Response returned to Client
  ```
- **Response**: Full formatted assessment object including ID, score, verdict, reason, and signal factors.

#### `GET /assessments`
- **Purpose**: Retrieve list of all historical assessments ordered by creation timestamp.
- **Authentication**: Required.
- **Response**: Array of assessment objects (HTTP 200 OK).
- **ML Interaction**: No.

#### `GET /assessments/{id}`
- **Purpose**: Fetch details of a single assessment record.
- **Authentication**: Required.
- **Response**: Single assessment object (HTTP 200 OK) or 404 Not Found.
- **ML Interaction**: No.

#### `PUT /assessments/{id}`
- **Purpose**: Update an existing assessment's financial parameters and automatically re-score risk via ML engine.
- **Authentication**: Required.
- **ML Interaction**: **YES** (re-invokes `risk_engine.predict()`).
- **Response**: Updated assessment object with recalculated score and verdict.

#### `DELETE /assessments/{id}`
- **Purpose**: Remove an assessment record from MySQL database.
- **Authentication**: Required.
- **Response**: `{"message": "Assessment deleted successfully", "id": "FG-10482"}` (HTTP 200 OK).
- **ML Interaction**: No.

---

### TEAM MANAGEMENT ENDPOINTS

#### `GET /team`
- **Purpose**: Retrieve list of team members.
- **Authentication**: Required.

#### `POST /team`
- **Purpose**: Add a new team member.
- **Authentication**: Required.

#### `PUT /team/{id}`
- **Purpose**: Update team member role or status.
- **Authentication**: Required.

#### `DELETE /team/{id}`
- **Purpose**: Delete a team member record.
- **Authentication**: Required.

---

## 3. Public vs Protected Routes Summary

- **Public Routes (No Authentication Required)**:
  - `GET /`
  - `GET /health`
  - `POST /auth/register`
  - `POST /auth/login`

- **Protected Routes (Bearer Token Required)**:
  - `POST /auth/logout`
  - `GET /auth/me`
  - `POST /assessments`
  - `GET /assessments`
  - `GET /assessments/{id}`
  - `PUT /assessments/{id}`
  - `DELETE /assessments/{id}`
  - `GET /team`
  - `POST /team`
  - `PUT /team/{id}`
  - `DELETE /team/{id}`
