import os
from datetime import datetime, timedelta, timezone
from typing import List
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, status  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer  # type: ignore
from jose import JWTError, jwt  # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash  # type: ignore
from sqlalchemy.orm import Session  # type: ignore


from .database import (
    engine, Base, get_db, create_database_if_not_exists, check_db_connectivity
)
from .db_models import (
    UserModel, AssessmentModel, TeamMemberModel, RevokedTokenModel
)
from .schemas import (
    AssessmentRequest, AssessmentUpdateRequest, AssessmentResponse,
    LoginRequest, RegisterRequest, TokenResponse, UserResponse,
    TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse, PredictResponse
)
from .services.risk_engine import RiskEngine


# Ensure database and tables exist on server startup
create_database_if_not_exists()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinGuard API", version="2.0.0")

# Configure CORS origins from environment or default to all
cors_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = (
    [o.strip() for o in cors_env.split(",") if o.strip()]
    if cors_env != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
@app.get("/api/health")
def health_check():
    """Health check endpoint providing live database connectivity diagnostics."""
    db_health = check_db_connectivity()
    env = os.getenv(
        "ENVIRONMENT",
        "production" if db_health.get("is_production_mysql") else "development"
    )
    return {
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_health,
        "environment": env
    }


bearer_scheme = HTTPBearer()

SECRET = os.getenv(
    "JWT_SECRET", "super-secret-finguard-key-change-in-production"
)
ALGORITHM = "HS256"
risk_engine = RiskEngine()


# --- Database Auto-Seeding on Startup ---
@app.on_event("startup")
def startup_db_seed():
    db = next(get_db())
    try:
        if not db.query(UserModel).first():
            demo_user = UserModel(
                id="usr-analyst-1",
                name="Demo Analyst",
                email="analyst@finguard.io",
                password_hash=generate_password_hash("password"),
                role="Analyst"
            )
            admin_user = UserModel(
                id="usr-admin-1",
                name="Kabeer Bhatt",
                email="kabeer@finguard.io",
                password_hash=generate_password_hash("password"),
                role="Admin"
            )
            db.add_all([demo_user, admin_user])

        if not db.query(AssessmentModel).first():
            seeded_assessments = [
                AssessmentModel(
                    id="FG-10482", subject="Olivia Bennett", kind="Loan",
                    amount=28000, income=7200, credit_score=764,
                    employment="Full time", term_months=36, channel="Branch",
                    score=18, verdict="Approved",
                    reason="Strong income-to-debt ratio", user_id="usr-admin-1"
                ),
                AssessmentModel(
                    id="FG-10481", subject="Northline Traders",
                    kind="Transaction", amount=9850, income=5100,
                    credit_score=630, employment="Self employed",
                    term_months=12, channel="Online", score=72,
                    verdict="Flagged", reason="Unusual payment velocity",
                    user_id="usr-admin-1"
                ),
                AssessmentModel(
                    id="FG-10480", subject="Marcus Chen", kind="Loan",
                    amount=14500, income=5800, credit_score=701,
                    employment="Full time", term_months=36, channel="Branch",
                    score=34, verdict="Approved",
                    reason="Verified employment history", user_id="usr-admin-1"
                ),
                AssessmentModel(
                    id="FG-10479", subject="Unknown Merchant",
                    kind="Transaction", amount=4200, income=2100,
                    credit_score=520, employment="Contract", term_months=6,
                    channel="Online", score=91, verdict="Rejected",
                    reason="High-risk device and location",
                    user_id="usr-admin-1"
                ),
                AssessmentModel(
                    id="FG-10478", subject="Sofia Ramirez", kind="Loan",
                    amount=45000, income=6800, credit_score=656,
                    employment="Full time", term_months=60, channel="Branch",
                    score=48, verdict="Flagged", reason="Short credit history",
                    user_id="usr-admin-1"
                )
            ]
            db.add_all(seeded_assessments)

        if not db.query(TeamMemberModel).first():
            seeded_team = [
                TeamMemberModel(
                    id="tm-1", name="Kabeer Bhatt",
                    email="kabeer@finguard.io", role="Admin", status="Active"
                ),
                TeamMemberModel(
                    id="tm-2", name="Maya Singh",
                    email="maya@finguard.io", role="Analyst", status="Active"
                ),
                TeamMemberModel(
                    id="tm-3",
                    name="Daniel Reed",
                    email="daniel@finguard.io",
                    role="Analyst",
                    status="Invited"
                )
            ]
            db.add_all(seeded_team)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Startup DB seed notice: {e}")
    finally:
        db.close()


# --- Helper Functions ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify raw password against stored Werkzeug password hash."""
    if not hashed_password:
        return False
    try:
        return check_password_hash(hashed_password, plain_password)
    except Exception:
        return False


def token_for(user: UserModel):
    payload = {
        "sub": user.email,
        "id": user.id,
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def current_user(
    auth: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token"
        )

    token_str = auth.credentials
    revoked = (
        db.query(RevokedTokenModel)
        .filter(RevokedTokenModel.token == token_str)
        .first()
    )
    if revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been logged out / revoked"
        )

    try:
        data = jwt.decode(token_str, SECRET, algorithms=[ALGORITHM])
        user = (
            db.query(UserModel)
            .filter(UserModel.email == data["sub"])
            .first()
        )
    except JWTError:
        user = None
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return user


def format_assessment(a: AssessmentModel) -> dict:
    created_str = (
        a.created_at.strftime("%b %d, %Y") if a.created_at else "Just now"
    )
    score = a.score
    risk_level = "LOW" if score < 40 else "MEDIUM" if score < 70 else "HIGH"

    # Compute live multi-model metrics if needed or return structured breakdown
    ratio = a.amount / max(a.income, 1.0)
    is_online = 1 if (a.channel or "").lower() in ("online", "mobile") else 0
    fraud_prob = min(
        max(0.12 + (0.35 if ratio > 5 else 0.0) + (0.25 if is_online else 0.0), 0.05),
        0.95
    )
    fraud_status = (
        "CLEAN" if fraud_prob < 0.35
        else "SUSPICIOUS" if fraud_prob < 0.65
        else "HIGH_FRAUD_RISK"
    )

    rate = 0.08 / 12.0
    term = a.term_months or 36
    installment = (a.amount * rate * ((1 + rate) ** term)) / (
        max(((1 + rate) ** term) - 1, 0.0001)
    )
    debt_burden = installment / max(a.income, 1.0)
    default_prob = min(
        max(0.10 + 1.8 * debt_burden - (a.credit_score - 600) / 250.0, 0.04),
        0.96
    )
    default_tier = (
        "LOW" if default_prob < 0.35
        else "MEDIUM" if default_prob < 0.65
        else "HIGH"
    )

    is_anomaly = (ratio > 7.0 or (a.credit_score < 500 and a.amount > 30000))


    return {
        "id": a.id,
        "type": a.kind.lower(),
        "kind": a.kind,
        "name": a.subject,
        "subject": a.subject,
        "amount": a.amount,
        "income": a.income,
        "credit_score": a.credit_score,
        "credit": a.credit_score,
        "employment": a.employment or "Full time",
        "term_months": a.term_months or 36,
        "channel": a.channel or "Branch",
        "score": a.score,
        "verdict": a.verdict,
        "risk_level": risk_level,
        "reason": a.reason or "",
        "factors": a.factors,
        "shap_explanation": a.factors,
        "credit_risk": {
            "credit_score": a.score,
            "credit_probability": round(a.score / 100.0, 4),
            "risk_tier": risk_level,
            "verdict": a.verdict
        },
        "fraud_detection": {
            "fraud_score": round(fraud_prob * 100),
            "fraud_probability": round(fraud_prob, 4),
            "fraud_status": fraud_status,
            "fraud_level": (
                "LOW" if fraud_status == "CLEAN"
                else "MEDIUM" if fraud_status == "SUSPICIOUS"
                else "HIGH"
            ),
            "signals": [
                f"Channel: {a.channel or 'Branch'}",
                f"Amount/Income: {ratio:.1f}x"
            ]
        },
        "default_risk": {
            "default_risk_score": round(default_prob * 100),
            "default_probability": round(default_prob, 4),
            "default_risk_tier": default_tier,
            "monthly_installment_est": round(installment, 2),
            "debt_burden_ratio": round(debt_burden, 4)
        },

        "anomaly_detection": {
            "is_anomaly": is_anomaly,
            "anomaly_status": (
                "SUSPICIOUS_ACTIVITY" if is_anomaly else "NORMAL"
            ),
            "anomaly_badge": (
                "ANOMALY DETECTED" if is_anomaly else "CLEAN PROFILE"
            ),
            "anomaly_score": round(-0.15 if is_anomaly else 0.12, 4)
        },
        "created": created_str,
        "created_at": a.created_at
    }


# --- System Status & Metadata ---
@app.get("/")
def root():
    return {
        "status": "running",
        "service": "FinGuard AI Platform API",
        "version": "2.1.0",
        "engine": "Multi-Model Risk & Fraud Intelligence"
    }


@app.get("/model-info")
@app.get("/api/model-info")
def model_info():
    """Returns active machine learning models, architecture, and evaluation metrics."""
    return risk_engine.get_model_info()


# --- Standalone Multi-Model AI Risk Prediction Endpoint ---
@app.post("/predict", response_model=PredictResponse)
def predict_risk(body: AssessmentRequest):
    """
    Direct multi-model AI financial risk assessment executing:
    Credit Risk + Fraud Detection + Default Risk + Isolation Forest + SHAP Explainability.
    """
    subject = body.get_subject()
    kind = body.get_kind()
    credit_score = body.get_credit_score()

    payload = {
        "subject": subject,
        "name": subject,
        "kind": kind,
        "type": kind.lower(),
        "income": body.income,
        "amount": body.amount,
        "credit_score": credit_score,
        "employment": body.employment,
        "term_months": body.term_months,
        "channel": body.channel
    }

    assessment_result = risk_engine.assess(payload)
    return assessment_result


# --- Auth Routes ---
@app.post("/auth/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = (
        db.query(UserModel)
        .filter(UserModel.email == body.email)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409, detail="Email already registered"
        )

    user = UserModel(
        id=str(uuid4()),
        name=body.name,
        email=body.email,
        password_hash=generate_password_hash(body.password),
        role=body.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "access_token": token_for(user),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(UserModel)
        .filter(UserModel.email == body.email)
        .first()
    )
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=401, detail="Incorrect email or password"
        )

    return {
        "access_token": token_for(user),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@app.get("/auth/me", response_model=UserResponse)
def me(user: UserModel = Depends(current_user)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


@app.post("/auth/logout")
def logout(
    auth: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    token_str = auth.credentials
    existing = (
        db.query(RevokedTokenModel)
        .filter(RevokedTokenModel.token == token_str)
        .first()
    )
    if not existing:
        revoked_entry = RevokedTokenModel(
            id=str(uuid4()),
            token=token_str
        )
        db.add(revoked_entry)
        db.commit()
    return {"message": "Logged out successfully"}


# --- Protected Assessment CRUD Routes ---

# 1. CREATE Assessment
@app.post("/assessments", response_model=AssessmentResponse, status_code=201)
def create_assessment(
    body: AssessmentRequest,
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    subject = body.get_subject()
    kind = body.get_kind()
    credit_score = body.get_credit_score()

    payload = {
        "subject": subject,
        "name": subject,
        "kind": kind,
        "type": kind.lower(),
        "income": body.income,
        "amount": body.amount,
        "credit_score": credit_score,
        "employment": body.employment,
        "term_months": body.term_months,
        "channel": body.channel
    }
    assessment = risk_engine.assess(payload)

    count = db.query(AssessmentModel).count()
    ref_id = f"FG-{10483 + count}"

    item = AssessmentModel(
        id=ref_id,
        subject=subject,
        kind=kind,
        amount=body.amount,
        income=body.income,
        credit_score=credit_score,
        employment=body.employment,
        term_months=body.term_months,
        channel=body.channel,
        score=assessment["score"],
        verdict=assessment["verdict"],
        reason=assessment["reason"],
        factors=assessment["factors"],
        user_id=user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return format_assessment(item)


# 2. READ All Assessments
@app.get("/assessments", response_model=List[AssessmentResponse])
def list_assessments(
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    items = (
        db.query(AssessmentModel)
        .order_by(AssessmentModel.created_at.desc())
        .all()
    )
    return [format_assessment(a) for a in items]


# 3. READ Single Assessment
@app.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(
    assessment_id: str,
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    item = (
        db.query(AssessmentModel)
        .filter(AssessmentModel.id == assessment_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return format_assessment(item)


# 4. UPDATE Assessment (and Re-Score)
@app.put("/assessments/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: str,
    body: AssessmentUpdateRequest,
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    item = (
        db.query(AssessmentModel)
        .filter(AssessmentModel.id == assessment_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found")

    new_subject = body.get_subject()
    if new_subject is not None:
        item.subject = new_subject
    if body.income is not None:
        item.income = body.income
    if body.amount is not None:
        item.amount = body.amount

    new_credit = body.get_credit_score()
    if new_credit is not None:
        item.credit_score = new_credit


    if body.employment is not None:
        item.employment = body.employment
    if body.term_months is not None:
        item.term_months = body.term_months
    if body.channel is not None:
        item.channel = body.channel

    payload = {
        "subject": item.subject,
        "income": item.income,
        "amount": item.amount,
        "credit_score": item.credit_score,
        "employment": item.employment,
        "term_months": item.term_months,
        "channel": item.channel,
        "kind": item.kind
    }
    assessment = risk_engine.assess(payload)
    item.score = assessment["score"]
    item.verdict = assessment["verdict"]
    item.reason = assessment["reason"]
    item.factors = assessment["factors"]

    db.commit()
    db.refresh(item)
    return format_assessment(item)


# 5. DELETE Assessment
@app.delete("/assessments/{assessment_id}", status_code=200)
def delete_assessment(
    assessment_id: str,
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    item = (
        db.query(AssessmentModel)
        .filter(AssessmentModel.id == assessment_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found")

    db.delete(item)
    db.commit()
    return {"message": "Assessment deleted successfully", "id": assessment_id}


# --- Protected Team CRUD Routes ---

# 1. READ Team Members
@app.get("/team", response_model=List[TeamMemberResponse])
def get_team(
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    return db.query(TeamMemberModel).all()


# 2. CREATE Team Member
@app.post("/team", response_model=TeamMemberResponse, status_code=201)
def add_team_member(
    body: TeamMemberCreate,
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    existing = (
        db.query(TeamMemberModel)
        .filter(TeamMemberModel.email == body.email)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Team member with this email already exists"
        )

    member = TeamMemberModel(
        id=f"tm-{str(uuid4())[:8]}",
        name=body.name,
        email=body.email,
        role=body.role,
        status=body.status
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


# 3. UPDATE Team Member
@app.put("/team/{member_id}", response_model=TeamMemberResponse)
def update_team_member(
    member_id: str,
    body: TeamMemberUpdate,
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    member = (
        db.query(TeamMemberModel)
        .filter(TeamMemberModel.id == member_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    if body.name is not None:
        member.name = body.name
    if body.email is not None:
        member.email = body.email
    if body.role is not None:
        member.role = body.role
    if body.status is not None:
        member.status = body.status

    db.commit()
    db.refresh(member)
    return member


# 4. DELETE Team Member
@app.delete("/team/{member_id}", status_code=200)
def delete_team_member(
    member_id: str,
    user: UserModel = Depends(current_user),
    db: Session = Depends(get_db)
):
    member = (
        db.query(TeamMemberModel)
        .filter(TeamMemberModel.id == member_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    db.delete(member)
    db.commit()
    return {"message": "Team member removed successfully", "id": member_id}
