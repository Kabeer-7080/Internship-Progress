# Day 47 — ML Prediction UI & Full Assessment Workflow

## 1. Overview
The goal of Day 47 is to make the machine learning risk engine a **real user-facing feature** directly inside the FinGuard web interface. Users no longer need to interact via Postman, curl, or browser developer tools to evaluate loan applications or fraud checks.

```
USER
  ↓ (Inputs Data in React UI)
FIN GUARD REACT UI
  ↓ (POST /assessments or /predict with JWT)
FASTAPI BACKEND
  ↓ (Passes Vector to RiskEngine)
ML RISK ENGINE (RandomForestClassifier)
  ↓ (Loads risk_model.pkl)
RISK PREDICTION
  ↓ (Score, Verdict, Factor Breakdown)
FASTAPI JSON RESPONSE
  ↓ (HTTP 200 / 201)
REACT UI (Visible Risk Dashboard & Decision Modal)
```

---

## 2. End-to-End Prediction Flow

### Step 1: User Inputs Application Data
The user opens FinGuard, navigates to the **Assessments** or **Overview** tab, and clicks **"New Assessment"**.
The modal presents a specialized tabbed interface:
- **Loan Application**: For standard credit & loan underwriting.
- **Fraud Check**: For real-time transaction velocity & merchant risk checks.

#### Input Fields:
1. **Applicant / Merchant Name** (`subject`): Text identifier of the applicant or entity.
2. **Monthly Income / Available Balance** (`income`): Stated regular monthly earnings or account liquidity ($).
3. **Loan / Transaction Amount** (`amount`): Total principal requested or transaction value ($).
4. **Credit Score** (`credit` / `credit_score`): FICO score range [300 – 850].
5. **Employment Status** (`employment`): `Full time`, `Self employed`, `Contract`, or `Unemployed`.
6. **Channel** (`channel`): `Branch`, `Online`, `Mobile`, or `In person`.

---

### Step 2: Form Submission & Loading State
When the user clicks **"Run risk assessment"**:
- The form enters a processing state: `loading = true`.
- All inputs and buttons are disabled to prevent duplicate submissions.
- The submit button dynamically displays an active animated spinner with the label:
  `"Analyzing Risk with ML Engine..."`.

---

### Step 3: API Request to FastAPI
React sends an authenticated HTTP request to the backend:

**Endpoint:** `POST /assessments` (or `POST /predict` for direct inference)  
**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```
**Request Payload:**
```json
{
  "subject": "Jordan Vance",
  "kind": "Loan",
  "amount": 25000,
  "income": 8500,
  "credit_score": 740,
  "employment": "Full time",
  "term_months": 36,
  "channel": "Branch"
}
```

---

### Step 4: ML Risk Engine Execution
FastAPI executes `risk_engine.predict(payload)`:
1. Translates categorical variables (`employment`, `kind`, `channel`) into numerical features.
2. Constructs the 6-dimensional feature vector:
   `[income, amount, credit_score, employment_score, term_months, is_transaction]`
3. Runs probability estimation via scikit-learn `RandomForestClassifier` loaded from `backend/models/risk_model.pkl`.
4. Derives:
   - **Risk Score** (0 – 100)
   - **Verdict**: `Approved` (score < 40), `Flagged` (40 ≤ score < 70), `Rejected` (score ≥ 70)
   - **Reason**: Decision summary synthesized from model signals.
   - **Risk Factors**: Granular explanations highlighting positive and negative drivers (credit profile, amount-to-income ratio, employment stability, payment channel).

---

### Step 5: FastAPI JSON Response
```json
{
  "id": "FG-10483",
  "type": "loan",
  "kind": "Loan",
  "name": "Jordan Vance",
  "subject": "Jordan Vance",
  "amount": 25000.0,
  "income": 8500.0,
  "credit_score": 740,
  "credit": 740,
  "employment": "Full time",
  "term_months": 36,
  "channel": "Branch",
  "score": 18,
  "verdict": "Approved",
  "reason": "Strong income, credit, and employment signals",
  "factors": [
    {
      "factor": "Credit profile",
      "impact": "positive",
      "detail": "Credit score is 740"
    },
    {
      "factor": "Amount-to-income",
      "impact": "positive",
      "detail": "Requested amount is 2.9× the stated income"
    },
    {
      "factor": "Employment stability",
      "impact": "positive",
      "detail": "Full Time"
    }
  ],
  "created": "Just now",
  "created_at": "2026-08-26T07:05:00.000000"
}
```

---

### Step 6: Visual Risk Result in React UI
The Assessment modal automatically closes, and the **Decision & Risk Breakdown Modal** opens:
1. **Model Verdict Banner**: Distinct color-coded badge (`Approved` [Green], `Flagged` [Amber], `Rejected` [Red]).
2. **Risk Score Meter**: Visual indicator showing exact score out of 100.
3. **Decision Explanation**: Human-readable narrative detailing why the model reached its decision.
4. **Risk Factor Signals**: Table showing each contributing signal with `POSITIVE`, `NEGATIVE`, or `NEUTRAL` impact pills.
5. **Application Data Grid**: Reference ID, applicant name, requested amount, verified income, employment type, and channel.
6. **Action Options**: "Export PDF", "Edit & Rescore", and "Delete assessment".

---

## 3. Error Handling & Edge Cases

| Scenario | UI / API Behavior |
| :--- | :--- |
| **Missing required fields** | HTML5 validation prevents submission; backend returns 422 Unprocessable Entity. |
| **Invalid credit score (<300 or >850)** | Input constrained in UI and validated by Pydantic schema. |
| **Backend offline / Network failure** | Form displays error banner (`"Failed to run ML risk assessment: Failed to fetch"`) and remains interactive for retry. |
| **Expired / Invalid JWT token** | Backend returns 401 Unauthorized; frontend displays authentication error and prompts re-login. |
| **Server Error (500)** | User sees a friendly error notification (`"Assessment failed. Please check backend connection."`) without exposing raw stack traces. |

---

## 4. Required Screenshots for Internship Submission

1. **Assessment Input Modal**: Showing the form filled with applicant parameters (Subject, Income, Amount, Credit Score, Employment, Channel).
2. **Active Loading State**: Showing the `"Analyzing Risk with ML Engine..."` spinner and disabled buttons during prediction.
3. **Prediction Result & Decision Modal**: Showing the resulting `Approved` / `Flagged` / `Rejected` verdict, risk score, reason, and risk factor signals.
4. **Rescoring Flow**: Showing the "Edit & Rescore" modal updating an assessment with higher risk values (e.g. Credit 520, Loan $90,000) and receiving an updated `Rejected` verdict.
5. **Assessments Dashboard**: Showing the updated list of assessments with the newly predicted record at the top.
