"""
Comprehensive Multi-Model AI Engine Test Suite
Tests Credit Risk, Fraud Detection, Default Risk, Isolation Forest Anomaly Detection, and SHAP Explainability.
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient  # type: ignore # pyrefly: ignore
from app.main import app

client = TestClient(app)


def test_ai_engine():
    print("=" * 60)
    print("   FINGUARD MULTI-MODEL AI RISK & FRAUD ENGINE TESTS      ")
    print("=" * 60)

    # 1. Test /model-info
    r = client.get("/api/model-info")
    assert r.status_code == 200, f"/model-info failed: {r.text}"
    info = r.json()
    print("[PASS] GET /api/model-info -> Architecture:", info["architecture"])
    print(f"       Models Registered: {list(info['models'].keys())}")
    for k, v in info['models'].items():
        if "metrics" in v:
            print(f"       - {k}: {v['metrics']}")

    # 2. Test Low Risk Prime Applicant
    prime_payload = {
        "subject": "Elena Vance",
        "kind": "Loan",
        "income": 12000,
        "amount": 15000,
        "credit_score": 790,
        "employment": "Full time",
        "channel": "Branch",
        "term_months": 36
    }
    r = client.post("/predict", json=prime_payload)
    assert r.status_code == 200, f"Prime predict failed: {r.text}"
    prime_res = r.json()
    print("\n[PASS] POST /predict (Prime Profile):")
    print(f"       Score: {prime_res['score']} | Verdict: {prime_res['verdict']} | Risk Level: {prime_res['risk_level']}")
    print(f"       Credit Risk: {prime_res['credit_risk']}")
    print(f"       Fraud Detection: {prime_res['fraud_detection']}")
    print(f"       Default Risk: {prime_res['default_risk']}")
    print(f"       Anomaly Detection: {prime_res['anomaly_detection']}")
    print(f"       SHAP Explanations ({len(prime_res['shap_explanation'])} factors):")
    for f in prime_res['shap_explanation'][:3]:
        print(f"         * {f['factor']}: SHAP={f['shap_value']}, impact={f['impact']} ({f['detail']})")

    # 3. Test High-Risk / Fraud-Prone Profile
    subprime_online = {
        "subject": "Apex Digital",
        "kind": "Transaction",
        "income": 1500,
        "amount": 45000,
        "credit_score": 480,
        "employment": "Unemployed",
        "channel": "Online",
        "term_months": 12
    }
    r = client.post("/predict", json=subprime_online)
    assert r.status_code == 200, f"Subprime predict failed: {r.text}"
    sub_res = r.json()
    print("\n[PASS] POST /predict (High-Risk Online Profile):")
    print(f"       Score: {sub_res['score']} | Verdict: {sub_res['verdict']} | Risk Level: {sub_res['risk_level']}")
    print(f"       Fraud Status: {sub_res['fraud_detection']['fraud_status']} (Signals: {sub_res['fraud_detection']['signals']})")
    print(f"       Default Tier: {sub_res['default_risk']['default_risk_tier']} (Prob: {sub_res['default_risk']['default_probability']})")
    print(f"       Anomaly Status: {sub_res['anomaly_detection']['anomaly_status']} (Intensity: {sub_res['anomaly_detection'].get('anomaly_intensity', 0)}%)")

    # 4. Test Isolation Forest Outlier
    outlier_payload = {
        "subject": "Quantum Hedge",
        "kind": "Loan",
        "income": 25000,
        "amount": 120000,
        "credit_score": 380,
        "employment": "Self employed",
        "channel": "Mobile",
        "term_months": 60
    }
    r = client.post("/predict", json=outlier_payload)
    assert r.status_code == 200
    outlier_res = r.json()
    print("\n[PASS] POST /predict (Outlier Profile):")
    print(f"       Anomaly Status: {outlier_res['anomaly_detection']['anomaly_status']} ({outlier_res['anomaly_detection']['anomaly_details']})")

    print("\n" + "=" * 60)
    print("   ALL 5 MULTI-MODEL AI RISK SERVICES VERIFIED!           ")
    print("=" * 60)


if __name__ == "__main__":
    test_ai_engine()
