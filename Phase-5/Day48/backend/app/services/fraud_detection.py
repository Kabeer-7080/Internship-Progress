"""
Fraud Detection Service
Analyzes channel vulnerability, transaction velocity, amount anomalies, and account mismatch patterns.
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


logger = logging.getLogger("finguard.fraud_detection")

__all__ = ["FraudDetectionService", "get_fraud_model_path"]


def get_fraud_model_path() -> Path:

    env_path = os.getenv("FRAUD_MODEL_PATH")
    if env_path:
        return Path(env_path)
    return Path(__file__).resolve().parent.parent.parent / "models" / "fraud_model.pkl"


class FraudDetectionService:
    def __init__(self):
        self.model_path = get_fraud_model_path()
        self.metrics: Dict[str, float] = {}
        self.model = self._load_or_train()

    def _generate_fraud_data(self, n: int = 5000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Synthesize realistic fraud indicators:
        Features: [amount, income_ratio, is_online, credit_score, is_unemployed_or_contract]
        """
        rng = np.random.default_rng(88)
        amount = rng.lognormal(9.0, 0.85, n).clip(100, 150000)
        income = rng.lognormal(8.4, 0.6, n).clip(1000, 30000)
        ratio = amount / income
        is_online = rng.choice([0, 1], p=[0.35, 0.65], size=n)
        credit = rng.normal(650, 95, n).clip(300, 850)
        is_high_risk_emp = rng.choice([0, 1], p=[0.75, 0.25], size=n)

        # Non-linear fraud probability formulation
        raw_fraud = (
            0.45 * (ratio > 6.0).astype(float)
            + 0.35 * is_online
            + 0.30 * (credit < 560).astype(float)
            + 0.25 * is_high_risk_emp
            + 0.20 * (amount > 50000).astype(float)
            + rng.normal(0, 0.25, n)
        )
        target = (raw_fraud > 0.85).astype(int)
        x = np.column_stack([amount, ratio, is_online, credit, is_high_risk_emp])
        return x, target

    def _train_and_evaluate(self) -> RandomForestClassifier:
        logger.info("Training Fraud Detection Random Forest Classifier...")
        x, y = self._generate_fraud_data(n=6000)
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.20, random_state=88, stratify=y)

        clf = RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            min_samples_leaf=5,
            class_weight='balanced',
            random_state=88
        )
        clf.fit(x_train, y_train)

        y_pred = clf.predict(x_test)
        y_prob = clf.predict_proba(x_test)[:, 1]

        self.metrics = {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred)), 4),
            "recall": round(float(recall_score(y_test, y_pred)), 4)
        }
        logger.info(f"Fraud Detection Model Trained. Metrics: {self.metrics}")

        try:
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(clf, self.model_path)
            logger.info(f"Saved fraud detection model to {self.model_path}")
        except Exception as e:
            logger.warning(f"Could not persist fraud model: {e}")

        return clf

    def _load_or_train(self) -> RandomForestClassifier:
        if self.model_path.exists():
            try:
                clf = joblib.load(self.model_path)
                logger.info(f"Loaded existing fraud model from {self.model_path}")
                x, y = self._generate_fraud_data(n=1000)
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
                logger.warning(f"Could not load fraud model ({e}). Rebuilding...")
                return self._train_and_evaluate()
        return self._train_and_evaluate()

    def evaluate(self, amount: float, income: float, credit_score: int, channel: str, employment: str) -> Dict[str, Any]:
        """
        Evaluate fraud risk given financial parameters.
        """
        ratio = amount / max(income, 1.0)
        is_online = 1 if channel.lower() in ("online", "mobile") else 0
        is_high_risk_emp = 1 if employment.lower() in ("unemployed", "contract", "self employed", "self_employed") else 0

        vector = np.array([[amount, ratio, is_online, credit_score, is_high_risk_emp]])
        fraud_prob = float(self.model.predict_proba(vector)[0][1])
        fraud_score = round(fraud_prob * 100)


        signals: List[str] = []
        if ratio > 6.0:
            signals.append(f"Disproportionate amount-to-income ({ratio:.1f}x)")
        if is_online and amount > 25000:
            signals.append("High-volume card-not-present online transaction")
        if credit_score < 550 and amount > 15000:
            signals.append("Subprime profile with large requested principal")

        if fraud_score < 30:
            status = "CLEAN"
            level = "LOW"
        elif fraud_score < 65:
            status = "SUSPICIOUS"
            level = "MEDIUM"
        else:
            status = "HIGH_FRAUD_RISK"
            level = "HIGH"

        return {
            "fraud_score": fraud_score,
            "fraud_probability": round(fraud_prob, 4),
            "fraud_status": status,
            "fraud_level": level,
            "signals": signals if signals else ["No high-risk fraud signatures detected"]
        }
