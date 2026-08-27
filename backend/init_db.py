import sys
import os
import pymysql  # type: ignore # pyrefly: ignore
from werkzeug.security import generate_password_hash  # type: ignore # pyrefly: ignore

# Ensure app package is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import (  # noqa: E402 # type: ignore # pyrefly: ignore
    engine, Base, SessionLocal, MYSQL_HOST, MYSQL_PORT,
    MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, active_db_type
)
from app.db_models import (  # noqa: E402 # type: ignore # pyrefly: ignore
    UserModel, AssessmentModel, TeamMemberModel
)

INITIAL_USERS = [
    {
        "id": "usr-admin-1",
        "name": "Kabeer Bhatt",
        "email": "kabeer@finguard.io",
        "password": "password",
        "role": "Admin"
    },
    {
        "id": "usr-analyst-1",
        "name": "Demo Analyst",
        "email": "analyst@finguard.io",
        "password": "password",
        "role": "Analyst"
    }
]

INITIAL_ASSESSMENTS = [
    {
        "id": "FG-10482",
        "subject": "Olivia Bennett",
        "kind": "Loan",
        "amount": 28000,
        "income": 7200,
        "credit_score": 764,
        "employment": "Full time",
        "term_months": 36,
        "channel": "Branch",
        "score": 18,
        "verdict": "Approved",
        "reason": "Strong income-to-debt ratio"
    },
    {
        "id": "FG-10481",
        "subject": "Northline Traders",
        "kind": "Transaction",
        "amount": 9850,
        "income": 5100,
        "credit_score": 630,
        "employment": "Self employed",
        "term_months": 12,
        "channel": "Online",
        "score": 72,
        "verdict": "Flagged",
        "reason": "Unusual payment velocity"
    },
    {
        "id": "FG-10480",
        "subject": "Marcus Chen",
        "kind": "Loan",
        "amount": 14500,
        "income": 5800,
        "credit_score": 701,
        "employment": "Full time",
        "term_months": 36,
        "channel": "Branch",
        "score": 34,
        "verdict": "Approved",
        "reason": "Verified employment history"
    },
    {
        "id": "FG-10479",
        "subject": "Unknown Merchant",
        "kind": "Transaction",
        "amount": 4200,
        "income": 2100,
        "credit_score": 520,
        "employment": "Contract",
        "term_months": 6,
        "channel": "Online",
        "score": 91,
        "verdict": "Rejected",
        "reason": "High-risk device and location"
    },
    {
        "id": "FG-10478",
        "subject": "Sofia Ramirez",
        "kind": "Loan",
        "amount": 45000,
        "income": 6800,
        "credit_score": 656,
        "employment": "Full time",
        "term_months": 60,
        "channel": "Branch",
        "score": 48,
        "verdict": "Flagged",
        "reason": "Short credit history"
    }
]

INITIAL_TEAM = [
    {
        "id": "tm-1",
        "name": "Kabeer Bhatt",
        "email": "kabeer@finguard.io",
        "role": "Admin",
        "status": "Active"
    },
    {
        "id": "tm-2",
        "name": "Maya Singh",
        "email": "maya@finguard.io",
        "role": "Analyst",
        "status": "Active"
    },
    {
        "id": "tm-3",
        "name": "Daniel Reed",
        "email": "daniel@finguard.io",
        "role": "Analyst",
        "status": "Invited"
    }
]


def ensure_database():
    if active_db_type not in ("mysql", "cloud_mysql"):
        print(f"Using {active_db_type} database; no MySQL database creation required.")
        return

    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        with conn.cursor() as cursor:
            stmt = (
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            cursor.execute(stmt)
        conn.commit()
        conn.close()
        print(
            f"Ensured MySQL database '{MYSQL_DATABASE}' exists "
            f"on {MYSQL_HOST}:{MYSQL_PORT}"
        )
    except Exception as e:
        print(f"Database creation notice: {e}")


def init_db():
    print(
        f"Initializing MySQL database '{MYSQL_DATABASE}' "
        f"on {MYSQL_HOST}:{MYSQL_PORT}..."
    )
    ensure_database()
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed users
        for u in INITIAL_USERS:
            existing = (
                db.query(UserModel)
                .filter(UserModel.email == u["email"])
                .first()
            )
            if not existing:
                user = UserModel(
                    id=u["id"],
                    name=u["name"],
                    email=u["email"],
                    password_hash=generate_password_hash(u["password"]),
                    role=u["role"]
                )
                db.add(user)

        # Seed assessments
        for a in INITIAL_ASSESSMENTS:
            existing = (
                db.query(AssessmentModel)
                .filter(AssessmentModel.id == a["id"])
                .first()
            )
            if not existing:
                assessment = AssessmentModel(
                    id=a["id"],
                    subject=a["subject"],
                    kind=a["kind"],
                    amount=a["amount"],
                    income=a["income"],
                    credit_score=a["credit_score"],
                    employment=a["employment"],
                    term_months=a["term_months"],
                    channel=a["channel"],
                    score=a["score"],
                    verdict=a["verdict"],
                    reason=a["reason"],
                    user_id="usr-admin-1"
                )
                db.add(assessment)

        # Seed team members
        for t in INITIAL_TEAM:
            existing = (
                db.query(TeamMemberModel)
                .filter(TeamMemberModel.email == t["email"])
                .first()
            )
            if not existing:
                member = TeamMemberModel(
                    id=t["id"],
                    name=t["name"],
                    email=t["email"],
                    role=t["role"],
                    status=t["status"]
                )
                db.add(member)

        db.commit()
        print(
            f"Database '{MYSQL_DATABASE}' initialized and seeded successfully!"
        )
    except Exception as e:
        db.rollback()
        print(f"Error during MySQL database seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
