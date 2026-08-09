"""Small, real scikit-learn risk classifier with transparent signal explanations."""
from pathlib import Path
import joblib  # type: ignore # pyrefly: ignore
import numpy as np  # type: ignore # pyrefly: ignore
from sklearn.ensemble import RandomForestClassifier  # type: ignore # pyrefly: ignore

MODEL_PATH = Path(__file__).parents[2] / 'models' / 'risk_model.pkl'
FEATURES = ['income', 'amount', 'credit_score', 'employment_score', 'term_months', 'is_transaction']

def _build_model():
    rng = np.random.default_rng(42)
    n = 4500
    income = rng.lognormal(8.35, .55, n).clip(800, 25000)
    amount = rng.lognormal(9.2, .7, n).clip(150, 120000)
    credit = rng.normal(670, 90, n).clip(300, 850)
    employment = rng.integers(0, 3, n)
    term = rng.choice([12, 24, 36, 48, 60], n)
    is_txn = rng.integers(0, 2, n)
    # Synthetic but economically sensible target: higher debt ratio / weak credit means higher risk.
    raw = 1.2 * amount / income - (credit - 500) / 180 - employment * .35 + is_txn * .35 + term / 150 + rng.normal(0, .45, n)
    target = (raw > 1.25).astype(int)
    x = np.column_stack([income, amount, credit, employment, term, is_txn])
    model = RandomForestClassifier(n_estimators=180, min_samples_leaf=8, class_weight='balanced', random_state=42)
    model.fit(x, target)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model

class RiskEngine:
    def __init__(self):
        self.model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else _build_model()

    def predict(self, payload: dict):
        employment = str(payload.get('employment', 'full time')).lower()
        employment_map = {
            'unemployed': 0, 'contract': 1, 'self employed': 1, 'self_employed': 1,
            'full time': 2, 'employed': 2, 'employed full time': 2
        }
        emp = employment_map.get(employment, 1)
        
        kind_str = str(payload.get('kind') or payload.get('type') or 'Loan').lower()
        is_transaction = int(kind_str == 'transaction')
        term_months = int(payload.get('term_months', 36))
        income = float(payload.get('income', 5000))
        amount = float(payload.get('amount', 10000))
        credit_val = payload.get('credit_score') or payload.get('credit') or 680
        try:
            credit_score = int(credit_val)
        except (ValueError, TypeError):
            credit_score = 680
        channel = str(payload.get('channel', 'Branch')).lower()

        vector = np.array([[income, amount, credit_score, emp, term_months, is_transaction]])
        risk = float(self.model.predict_proba(vector)[0][1])
        score = round(risk * 100)
        label = 'approved' if score < 40 else 'flagged' if score < 70 else 'rejected'
        ratio = amount / max(income, 1.0)

        factors = [
            {'factor': 'Credit profile', 'impact': 'positive' if credit_score >= 680 else 'negative', 'detail': f"Credit score is {credit_score}"},
            {'factor': 'Amount-to-income', 'impact': 'negative' if ratio > 5 else 'positive', 'detail': f"Requested amount is {ratio:.1f}× the stated income"},
            {'factor': 'Employment stability', 'impact': 'positive' if emp == 2 else 'negative', 'detail': employment.title()},
        ]
        if is_transaction:
            factors.append({'factor': 'Payment channel', 'impact': 'negative' if channel == 'online' else 'neutral', 'detail': channel.title()})

        return score, label, factors
