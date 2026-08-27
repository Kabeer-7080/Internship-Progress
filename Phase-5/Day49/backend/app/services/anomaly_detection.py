"""
Anomaly Detection Service
Unsupervised Isolation Forest model detecting multi-variable financial outliers and strange behavioral combinations.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any

import joblib  # type: ignore
import numpy as np  # type: ignore
from sklearn.ensemble import IsolationForest  # type: ignore


logger = logging.getLogger("finguard.anomaly_detection")

__all__ = ["AnomalyDetectionService", "get_anomaly_model_path"]


def get_anomaly_model_path() -> Path:

    env_path = os.getenv("ANOMALY_MODEL_PATH")
    if env_path:
        return Path(env_path)
    return Path(__file__).resolve().parent.parent.parent / "models" / "anomaly_model.pkl"


class AnomalyDetectionService:
    def __init__(self):
        self.model_path = get_anomaly_model_path()
        self.model = self._load_or_train()

    def _generate_baseline_data(self, n: int = 4000) -> np.ndarray:
        """
        Generate typical banking/loan application distribution baseline for Isolation Forest.
        Features: [income, amount, credit_score, term_months]
        """
        rng = np.random.default_rng(99)
        income = rng.lognormal(8.35, 0.50, n).clip(1000, 25000)
        amount = rng.lognormal(9.1, 0.65, n).clip(500, 100000)
        credit = rng.normal(680, 80, n).clip(350, 850)
        term = rng.choice([12, 24, 36, 48, 60], n)
        return np.column_stack([income, amount, credit, term])

    def _train_and_save(self) -> IsolationForest:
        logger.info("Training Isolation Forest Anomaly Detection Model...")
        x = self._generate_baseline_data(n=5000)
        iso = IsolationForest(
            n_estimators=120,
            contamination=0.08,
            random_state=99,
            n_jobs=-1
        )
        iso.fit(x)

        try:
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(iso, self.model_path)
            logger.info(f"Saved anomaly detection model to {self.model_path}")
        except Exception as e:
            logger.warning(f"Could not persist anomaly model: {e}")

        return iso

    def _load_or_train(self) -> IsolationForest:
        if self.model_path.exists():
            try:
                iso = joblib.load(self.model_path)
                logger.info(f"Loaded existing anomaly model from {self.model_path}")
                return iso
            except Exception as e:
                logger.warning(f"Could not load anomaly model ({e}). Rebuilding...")
                return self._train_and_save()
        return self._train_and_save()

    def inspect(self, income: float, amount: float, credit_score: int, term_months: int) -> Dict[str, Any]:
        """
        Inspect single financial instance against the Isolation Forest baseline.
        """
        vector = np.array([[income, amount, credit_score, term_months]])
        
        # Decision function: positive is inlier (normal), negative is outlier (anomaly)
        raw_score = float(self.model.decision_function(vector)[0])
        prediction = int(self.model.predict(vector)[0])  # +1 for normal, -1 for anomaly

        is_anomaly = (prediction == -1)
        
        # Normalize to 0-100 anomaly intensity (higher means more anomalous)
        # raw_score typically ranges from -0.3 to +0.3
        anomaly_intensity = int(np.clip((0.20 - raw_score) * 200, 0, 100))


        status = "SUSPICIOUS_ACTIVITY" if is_anomaly else "NORMAL"
        badge = "ANOMALY DETECTED" if is_anomaly else "CLEAN PROFILE"

        details = (
            "Statistical anomaly detected: input combination deviates significantly from standard applicant distribution"
            if is_anomaly
            else "Standard financial distribution: values align with nominal behavioral clusters"
        )

        return {
            "is_anomaly": is_anomaly,
            "anomaly_status": status,
            "anomaly_badge": badge,
            "anomaly_score": round(raw_score, 4),
            "anomaly_intensity": anomaly_intensity,
            "anomaly_details": details
        }
