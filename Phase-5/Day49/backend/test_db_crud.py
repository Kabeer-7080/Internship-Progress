"""
MySQL Database Read / Write Verification Script
Tests database read and write capability using environment variables without hardcoding credentials or exposing passwords.
"""

import sys
import os
import time
from uuid import uuid4

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import (  # noqa: E402 # type: ignore
    engine, SessionLocal, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_SSL_MODE, active_db_type
)
from app.db_models import (  # noqa: E402 # type: ignore
    AssessmentModel, UserModel
)


def run_db_verification():
    print("=" * 65)
    print("  FINGUARD MYSQL READ / WRITE VALIDATION")
    print("=" * 65)

    print(f"[*] DB Host:          {DB_HOST}")
    print(f"[*] DB Port:          {DB_PORT}")
    print(f"[*] DB Name:          {DB_NAME}")
    print(f"[*] DB User:          {DB_USER}")
    print(f"[*] DB SSL Mode:      {DB_SSL_MODE or 'Standard'}")
    print(f"[*] Active Mode:      {active_db_type}")
    print("-" * 65)

    session = SessionLocal()
    test_id = f"FG-TEST-{str(uuid4())[:6]}"

    try:
        # 1. Test Write Capability
        print(f"[*] [1/3] Testing Write: Inserting record {test_id}...")
        test_record = AssessmentModel(
            id=test_id,
            subject="MySQL Test Subject",
            kind="Loan",
            amount=50000.0,
            income=9500.0,
            credit_score=750,
            employment="Full time",
            term_months=36,
            channel="Online",
            score=22,
            verdict="Approved",
            reason="Automated database connectivity test",
            factors=[{"factor": "Test", "impact": "positive", "shap_value": -0.12, "weight_percent": 100}],
            user_id="usr-admin-1"
        )
        session.add(test_record)
        session.commit()
        print(f"    [PASS] Record {test_id} successfully written to database.")

        # 2. Test Read Capability
        print(f"[*] [2/3] Testing Read: Fetching record {test_id} from database...")
        fetched = session.query(AssessmentModel).filter(AssessmentModel.id == test_id).first()
        if fetched and fetched.id == test_id:
            print(f"    [PASS] Record read successfully: {fetched.subject} (Score: {fetched.score}, Verdict: {fetched.verdict})")
        else:
            raise Exception("Record was written but could not be read back from database.")

        # 3. Test Read Existing Schema
        print("[*] [3/3] Testing General Read: Counting records in database...")
        total_assessments = session.query(AssessmentModel).count()
        total_users = session.query(UserModel).count()
        print(f"    [PASS] Total Assessments: {total_assessments}, Total Users: {total_users}")

        # Cleanup test record
        session.delete(fetched)
        session.commit()
        print(f"[*] [CLEANUP] Successfully removed test record {test_id}.")

        print("=" * 65)
        print("  ALL MYSQL READ & WRITE CHECKS PASSED (100% HEALTHY) ")
        print("=" * 65)
        return True

    except Exception as e:
        session.rollback()
        print(f"    [FAIL] Database verification error: {e}")
        return False
    finally:
        session.close()


if __name__ == "__main__":
    success = run_db_verification()
    sys.exit(0 if success else 1)
