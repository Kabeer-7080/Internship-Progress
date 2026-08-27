"""
FinGuard Central AI Risk & Fraud Intelligence Engine
Coordinates Credit Risk, Fraud Detection, Default Risk, Isolation Forest Anomaly Detection, and SHAP Explainability.
"""

import logging
from typing import Dict, Any, Tuple, List

import numpy as np  # type: ignore



from .credit_risk import CreditRiskService
from .fraud_detection import FraudDetectionService
from .default_risk import DefaultRiskService
from .anomaly_detection import AnomalyDetectionService
from .explainability import ShapExplainerService

logger = logging.getLogger("finguard.risk_engine")


class RiskEngine:
    """
    Central AI Risk Orchestrator for FinGuard.
    Lazy-loads / caches all specialized ML models into memory on initialization.
    """

    def __init__(self):
        logger.info("Initializing FinGuard Central AI Risk Engine...")
        self.credit_service = CreditRiskService()
        self.fraud_service = FraudDetectionService()
        self.default_service = DefaultRiskService()
        self.anomaly_service = AnomalyDetectionService()
        self.explainer_service = ShapExplainerService(self.credit_service.model)
        logger.info("FinGuard AI Risk Engine fully initialized with all 5 specialized sub-engines.")

    def _extract_features(self, payload: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Parse raw request payload into normalized model input vector."""
        employment = str(payload.get('employment', 'Full time')).lower()
        employment_map = {
            'unemployed': 0,
            'contract': 1,
            'self employed': 1,
            'self_employed': 1,
            'full time': 2,
            'employed': 2,
            'employed full time': 2
        }
        emp_score = employment_map.get(employment, 1)

        kind_str = str(payload.get('kind') or payload.get('type') or 'Loan').lower()
        is_transaction = int(kind_str == 'transaction')
        term_months = int(payload.get('term_months') or 36)
        income = float(payload.get('income') or 5000)
        amount = float(payload.get('amount') or 10000)
        
        credit_val = payload.get('credit_score') or payload.get('credit') or 680
        try:
            credit_score = int(credit_val)
        except (ValueError, TypeError):
            credit_score = 680

        channel = str(payload.get('channel') or ('Online' if is_transaction else 'Branch')).strip()

        vector = np.array([[income, amount, credit_score, emp_score, term_months, is_transaction]])
        clean_inputs = {
            "income": income,
            "amount": amount,
            "credit_score": credit_score,
            "employment": employment,
            "employment_score": emp_score,
            "term_months": term_months,
            "is_transaction": is_transaction,
            "kind": "Transaction" if is_transaction else "Loan",
            "channel": channel,
            "subject": str(payload.get('subject') or payload.get('name') or 'Applicant')
        }
        return vector, clean_inputs

    def assess(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute comprehensive multi-model assessment across all 5 AI components:
        1. Credit Risk Classifier
        2. Fraud Detection Engine
        3. Loan Default Probability Model
        4. Isolation Forest Anomaly Detector
        5. SHAP Mathematical Feature Attributions
        """
        vector, clean = self._extract_features(payload)

        # 1. Credit Risk
        credit_res = self.credit_service.predict(vector)

        # 2. Fraud Detection
        fraud_res = self.fraud_service.evaluate(
            amount=clean["amount"],
            income=clean["income"],
            credit_score=clean["credit_score"],
            channel=clean["channel"],
            employment=clean["employment"]
        )

        # 3. Default Risk
        default_res = self.default_service.estimate_default_risk(
            amount=clean["amount"],
            income=clean["income"],
            credit_score=clean["credit_score"],
            term_months=clean["term_months"]
        )

        # 4. Anomaly Detection (Isolation Forest)
        anomaly_res = self.anomaly_service.inspect(
            income=clean["income"],
            amount=clean["amount"],
            credit_score=clean["credit_score"],
            term_months=clean["term_months"]
        )

        # 5. SHAP Explainability
        shap_factors = self.explainer_service.explain(vector, clean)

        # Composite Unified Risk Score (Synthesizes Credit, Fraud, Default, and Anomaly Signals)
        # Weighted synthesis: 45% credit + 25% fraud + 20% default + 10% anomaly
        raw_composite = (
            0.45 * credit_res["credit_score"]
            + 0.25 * fraud_res["fraud_score"]
            + 0.20 * default_res["default_risk_score"]
            + 0.10 * anomaly_res["anomaly_intensity"]
        )
        composite_score = int(np.clip(round(raw_composite), 0, 100))


        if composite_score < 40 and fraud_res["fraud_status"] != "HIGH_FRAUD_RISK":
            verdict = "Approved"
            risk_level = "LOW"
            reason = "Optimal credit profile, low fraud indicators, and manageable debt burden"
        elif composite_score < 70 or fraud_res["fraud_status"] == "SUSPICIOUS" or anomaly_res["is_anomaly"]:
            verdict = "Flagged"
            risk_level = "MEDIUM"
            reasons = []
            if credit_res["risk_tier"] != "LOW":
                reasons.append("moderate credit volatility")
            if fraud_res["fraud_status"] != "CLEAN":
                reasons.append("elevated transaction channel risk")
            if anomaly_res["is_anomaly"]:
                reasons.append("statistical input outlier detected")
            reason = "Manual underwriting review recommended: " + (", ".join(reasons) if reasons else "moderate risk exposure")
        else:
            verdict = "Rejected"
            risk_level = "HIGH"
            reason = "Critical risk factors detected across credit, default, or fraud evaluation engines"

        return {
            "score": composite_score,
            "verdict": verdict,
            "risk_level": risk_level,
            "reason": reason,
            "credit_risk": credit_res,
            "fraud_detection": fraud_res,
            "default_risk": default_res,
            "anomaly_detection": anomaly_res,
            "shap_explanation": shap_factors,
            "factors": shap_factors,
            "subject": clean["subject"],
            "kind": clean["kind"],
            "amount": clean["amount"],
            "income": clean["income"],
            "credit_score": clean["credit_score"],
            "employment": clean["employment"],
            "channel": clean["channel"],
            "term_months": clean["term_months"]
        }

    def predict(self, payload: Dict[str, Any]) -> Tuple[int, str, List[Dict[str, Any]]]:
        """
        Backwards-compatible prediction API returning (score, verdict_lower, factors).
        """
        res = self.assess(payload)
        return res["score"], res["verdict"].lower(), res["factors"]

    def get_model_info(self) -> Dict[str, Any]:
        """Return metadata, metrics, and architecture details for all active models."""
        return {
            "architecture": "FinGuard Multi-Model AI Risk Intelligence Engine",
            "version": "2.1.0",
            "models": {
                "credit_risk": {
                    "algorithm": "RandomForestClassifier",
                    "n_estimators": 180,
                    "metrics": self.credit_service.metrics
                },
                "fraud_detection": {
                    "algorithm": "RandomForestClassifier + Channel Heuristics",
                    "n_estimators": 150,
                    "metrics": self.fraud_service.metrics
                },
                "default_risk": {
                    "algorithm": "Calibrated Logistic Regression",
                    "metrics": self.default_service.metrics
                },
                "anomaly_detection": {
                    "algorithm": "IsolationForest",
                    "contamination": 0.08,
                    "n_estimators": 120
                },
                "explainability": {
                    "method": "SHAP (SHapley Additive exPlanations) TreeExplainer",
                    "features": self.explainer_service.feature_names
                }
            }
        }
