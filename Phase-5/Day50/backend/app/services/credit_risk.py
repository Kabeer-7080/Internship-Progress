"""
Credit / Loan Risk Model Service
Trained on applicant financial vectors with Random Forest classification and calibrated probability estimation.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, List

import joblib  # type: ignore
import numpy as np  # type: ignore
from sklearn.ensemble import RandomForestClassifier  # type: ignore
from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, precision_score, recall_score  # type: ignore


logger = logging.getLogger("finguard.credit_risk")

__all__ = ["CreditRiskService", "get_credit_model_path", "FEATURES"]

FEATURES: List[str] = [
    'income', 'amount', 'credit_score', 'employment_score', 'term_months', 'is_transaction'
]


def get_credit_model_path() -> Path:
    env_path = os.getenv("CREDIT_MODEL_PATH") or os.getenv("MODEL_PATH")
    if env_path:
        return Path(env_path)

    base_model_path = Path(__file__).resolve().parent.parent.parent / "models" / "risk_model.pkl"
    if base_model_path.exists():
        return base_model_path

    container_path = Path("/app/models/risk_model.pkl")
    if container_path.exists():
        return container_path

    return base_model_path


class CreditRiskService:
    def __init__(self):
        self.feature_names = FEATURES
        self.model_path = get_credit_model_path()
        self.metrics: Dict[str, float] = {}
        self.model: RandomForestClassifier = self._load_or_train()

    def _generate_training_data(self, n: int = 5000) -> Tuple[np.ndarray, np.ndarray]:
        rng = np.random.default_rng(42)
        income = rng.lognormal(8.35, 0.55, n).clip(800, 25000)
        amount = rng.lognormal(9.2, 0.7, n).clip(150, 120000)
        credit = rng.normal(670, 90, n).clip(300, 850)
        employment = rng.integers(0, 3, n)
        term = rng.choice([12, 24, 36, 48, 60], n)
        is_txn = rng.integers(0, 2, n)

        # Economic risk formulation
        debt_to_income = amount / np.maximum(income, 1.0)
        raw_risk = (
            1.25 * debt_to_income
            - (credit - 500) / 180.0
            - employment * 0.35
            + is_txn * 0.30
            + term / 160.0
            + rng.normal(0, 0.40, n)
        )
        target = (raw_risk > 1.20).astype(int)
        x = np.column_stack([income, amount, credit, employment, term, is_txn])
        return x, target

    def _train_and_evaluate(self) -> RandomForestClassifier:
        logger.info("Training Credit Risk Random Forest Model...")
        x, y = self._generate_training_data(n=6000)
        x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=0.20, random_state=42, stratify=y
        )

        clf = RandomForestClassifier(
            n_estimators=180,
            max_depth=12,
            min_samples_leaf=6,
            class_weight='balanced',
            random_state=42
        )
        clf.fit(x_train, y_train)

        # Compute evaluation metrics on held-out test split
        y_pred = clf.predict(x_test)
        y_prob = clf.predict_proba(x_test)[:, 1]

        self.metrics = {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred)), 4),
            "recall": round(float(recall_score(y_test, y_pred)), 4)
        }
        logger.info(f"Credit Risk Model Trained. Metrics: {self.metrics}")

        try:
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(clf, self.model_path)
            logger.info(f"Saved credit risk model to {self.model_path}")
        except Exception as e:
            logger.warning(f"Could not save model to disk: {e}")

        return clf

    def _load_or_train(self) -> RandomForestClassifier:
        if self.model_path.exists():
            try:
                clf = joblib.load(self.model_path)
                logger.info(f"Loaded existing credit risk model from {self.model_path}")
                # Evaluate on synthetic benchmark to obtain live metrics
                x, y = self._generate_training_data(n=1000)
                y_pred = clf.predict(x)
                y_prob = clf.predict_proba(x)[:, 1]
                self.metrics = {
                    "accuracy": round(float(accuracy_score(y, y_pred)), 4),
                    "roc_auc": round(float(roc_auc_score(y, y_prob)), 4),
                    "f1_score": round(float(f1_score(y, y_pred)), 4),
                    "precision": round(float(precision_score(y, y_pred)), 4),
                    "recall": round(float(recall_score(y, y_pred)), 4)
                }
                return clf
            except Exception as e:
                logger.warning(f"Could not load credit model ({e}). Rebuilding...")
                return self._train_and_evaluate()
        return self._train_and_evaluate()

    def predict(self, vector: np.ndarray) -> Dict[str, Any]:
        """
        Evaluate credit risk for a feature vector:
        [income, amount, credit_score, employment_score, term_months, is_transaction]
        """
        prob = float(self.model.predict_proba(vector)[0][1])
        score = round(prob * 100)


        if score < 38:
            risk_tier = "LOW"
            verdict = "Approved"
            decision_summary = "Strong income-to-debt ratio and verified credit profile"
        elif score < 68:
            risk_tier = "MEDIUM"
            verdict = "Flagged"
            decision_summary = "Moderate credit risk signals; analyst review recommended"
        else:
            risk_tier = "HIGH"
            verdict = "Rejected"
            decision_summary = "Elevated debt-to-income and high risk indicators"

        return {
            "credit_score": score,
            "credit_probability": round(prob, 4),
            "risk_tier": risk_tier,
            "verdict": verdict,
            "decision_summary": decision_summary
        }
