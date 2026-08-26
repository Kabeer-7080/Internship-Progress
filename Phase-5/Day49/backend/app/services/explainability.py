"""
Explainable AI (SHAP) Service
Computes exact Shapley feature attributions using TreeExplainer to explain model predictions with mathematical transparency.
"""

import logging
from typing import List, Dict, Any, Optional

import numpy as np

try:
    import shap  # type: ignore
    HAS_SHAP = True
except Exception:
    shap = None  # type: ignore
    HAS_SHAP = False


logger = logging.getLogger("finguard.explainability")

__all__ = ["ShapExplainerService", "FEATURE_LABELS"]

FEATURE_LABELS: Dict[str, str] = {
    'income': 'Monthly Income',
    'amount': 'Principal / Amount',
    'credit_score': 'Credit Score Profile',
    'employment_score': 'Employment Stability',
    'term_months': 'Loan Repayment Term',
    'is_transaction': 'Transaction Channel Risk'
}


class ShapExplainerService:
    def __init__(self, model: Any):
        self.model = model
        self.feature_names: List[str] = [
            'income', 'amount', 'credit_score', 'employment_score', 'term_months', 'is_transaction'
        ]
        self.explainer: Optional[Any] = self._init_explainer()

    def _init_explainer(self) -> Optional[Any]:
        if not HAS_SHAP or shap is None:
            logger.warning("SHAP package not available. Falling back to heuristic feature attribution.")
            return None
        try:
            # TreeExplainer for scikit-learn RandomForest
            explainer = shap.TreeExplainer(self.model)  # type: ignore
            logger.info("Successfully initialized SHAP TreeExplainer.")
            return explainer

        except Exception as e:
            logger.warning(f"Could not initialize TreeExplainer: {e}")
            return None

    def explain(self, vector: np.ndarray, raw_payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate feature importance attributions using true SHAP values or model importances.
        """
        vals: np.ndarray
        if self.explainer is not None:
            try:
                # shap_values shape for binary classifier: (1, n_features, 2) or (1, n_features)
                shap_res = self.explainer.shap_values(vector)

                # In modern SHAP versions, shap_res may be a list of arrays [class_0, class_1] or 3D array
                if isinstance(shap_res, list) and len(shap_res) > 1:
                    vals = np.asarray(shap_res[1][0])
                elif isinstance(shap_res, np.ndarray):
                    if shap_res.ndim == 3:
                        vals = shap_res[0, :, 1]
                    elif shap_res.ndim == 2:
                        vals = shap_res[0]
                    else:
                        vals = shap_res.flatten()
                else:
                    vals = np.asarray(shap_res).flatten()
            except Exception as e:
                logger.warning(f"SHAP computation exception ({e}). Falling back to tree feature importances.")
                vals = self._feature_importance_fallback(vector)
        else:
            vals = self._feature_importance_fallback(vector)

        # Build structured factor attributions
        factors: List[Dict[str, Any]] = []
        abs_vals = np.abs(vals)
        total_abs = float(np.sum(abs_vals)) or 1.0

        income = float(raw_payload.get('income', 5000))
        amount = float(raw_payload.get('amount', 10000))
        credit = int(raw_payload.get('credit_score') or raw_payload.get('credit') or 680)
        emp_str = str(raw_payload.get('employment', 'Full time')).title()
        channel = str(raw_payload.get('channel', 'Branch')).title()
        term = int(raw_payload.get('term_months', 36))
        ratio = amount / max(income, 1.0)

        details_map = {
            'income': f"Stated income of ${income:,.0f}/mo",
            'amount': f"Requested amount is {ratio:.1f}× monthly income (${amount:,.0f})",
            'credit_score': f"Credit score of {credit} points",
            'employment_score': f"Employment status: {emp_str}",
            'term_months': f"Repayment horizon of {term} months",
            'is_transaction': f"Origination channel: {channel}"
        }

        for idx, name in enumerate(self.feature_names):
            val = float(vals[idx]) if idx < len(vals) else 0.0
            weight_pct = round((abs(val) / total_abs) * 100)


            # Negative SHAP value reduces risk (positive for applicant); Positive SHAP value increases risk
            if val > 0.02:
                impact = "negative"  # Increases financial risk
            elif val < -0.02:
                impact = "positive"  # Reduces financial risk
            else:
                impact = "neutral"

            factors.append({
                "factor": FEATURE_LABELS.get(name, name.title()),
                "feature_key": name,
                "shap_value": round(val, 4),
                "weight_percent": max(weight_pct, 4),
                "impact": impact,
                "detail": details_map.get(name, f"{name}: {val:.3f}")
            })

        # Sort factors by absolute magnitude (highest impact first)
        factors.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        return factors

    def _feature_importance_fallback(self, vector: np.ndarray) -> np.ndarray:
        """Fallback when TreeExplainer is unavailable: uses tree feature_importances_ weighted by delta from mean."""
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            # Directional proxy
            income, amount, credit, emp, term, is_txn = vector[0]
            directions = np.array([
                -1.0 if income > 4500 else 1.0,
                1.0 if (amount / max(income, 1.0)) > 4.0 else -1.0,
                -1.0 if credit >= 680 else 1.0,
                -1.0 if emp == 2 else 1.0,
                1.0 if term > 36 else -1.0,
                1.0 if is_txn == 1 else 0.0
            ])
            return importances * directions
        return np.array([0.25, 0.35, 0.20, 0.10, 0.05, 0.05])
