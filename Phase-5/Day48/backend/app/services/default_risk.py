"""
Loan Default Risk Estimation Service
Estimates the probability of borrower default over the loan term using calibrated logistic modeling.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any, Tuple

import joblib  # type: ignore
import numpy as np  # type: ignore
from sklearn.linear_model import LogisticRegression  # type: ignore
from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, precision_score, recall_score  # type: ignore


logger = logging.getLogger("finguard.default_risk")

__all__ = ["DefaultRiskService", "get_default_model_path"]


def get_default_model_path() -> Path:
    env_path = os.getenv("DEFAULT_MODEL_PATH")
    if env_path:
        return Path(env_path)
    return Path(__file__).resolve().parent.parent.parent / "models" / "default_model.pkl"


class DefaultRiskService:
    def __init__(self):
        self.model_path = get_default_model_path()
        self.metrics: Dict[str, float] = {}
        self.model: LogisticRegression = self._load_or_train()

    def _generate_default_data(self, n: int = 5000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Synthesize default outcome signals:
        Features: [income, amount, credit_score, term_months, monthly_burden]
        """
        rng = np.random.default_rng(77)
        income = rng.lognormal(8.35, 0.55, n).clip(1000, 25000)
        amount = rng.lognormal(9.2, 0.70, n).clip(1000, 100000)
        credit = rng.normal(675, 85, n).clip(300, 850)
        term = rng.choice([12, 24, 36, 48, 60], n)

        # Monthly approximate installment
        rate = 0.08 / 12.0
        installment = (amount * rate * ((1 + rate) ** term)) / (((1 + rate) ** term) - 1)
        burden = installment / income

        # Actuarial default formulation
        raw_default = (
            2.5 * burden
            - (credit - 600) / 140.0
            + (term / 60.0) * 0.4
            + rng.normal(0, 0.35, n)
        )
        target = (raw_default > 0.90).astype(int)
        x = np.column_stack([income, amount, credit, term, burden])
        return x, target

    def _train_and_evaluate(self) -> LogisticRegression:
        logger.info("Training Loan Default Risk Logistic Model...")
        x, y = self._generate_default_data(n=6000)
        x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=0.20, random_state=77, stratify=y
        )

        clf = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=77)
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
        logger.info(f"Default Risk Model Trained. Metrics: {self.metrics}")

        try:
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(clf, self.model_path)
            logger.info(f"Saved default risk model to {self.model_path}")
        except Exception as e:
            logger.warning(f"Could not persist default model: {e}")

        return clf

    def _load_or_train(self) -> LogisticRegression:
        if self.model_path.exists():
            try:
                clf = joblib.load(self.model_path)
                logger.info(f"Loaded existing default risk model from {self.model_path}")
                x, y = self._generate_default_data(n=1000)
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
                logger.warning(f"Could not load default model ({e}). Rebuilding...")
                return self._train_and_evaluate()
        return self._train_and_evaluate()

    def estimate_default_risk(
        self, amount: float, income: float, credit_score: int, term_months: int
    ) -> Dict[str, Any]:
        """
        Calculates loan default probability and installment debt burden.
        """
        rate = 0.08 / 12.0
        n_term = max(term_months, 1)
        installment = (amount * rate * ((1 + rate) ** n_term)) / (
            max(((1 + rate) ** n_term) - 1, 0.0001)
        )
        burden = installment / max(income, 1.0)

        vector = np.array([[income, amount, credit_score, n_term, burden]])
        prob = float(self.model.predict_proba(vector)[0][1])
        score = round(prob * 100)



        if score < 35:
            tier = "LOW"
            description = "High repayment safety with manageable debt-to-income margin"
        elif score < 65:
            tier = "MEDIUM"
            description = "Moderate repayment sensitivity; collateral / co-signer advised"
        else:
            tier = "HIGH"
            description = "Severe default probability; borrower debt service burden exceeds safe limits"

        return {
            "default_risk_score": score,
            "default_probability": round(prob, 4),
            "default_risk_tier": tier,
            "monthly_installment_est": round(installment, 2),
            "debt_burden_ratio": round(burden, 4),
            "default_risk_summary": description
        }
