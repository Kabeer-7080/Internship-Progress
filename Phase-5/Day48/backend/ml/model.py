import os
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

_model = None

def train_and_save_model():
    """Trains a simple LogisticRegression model and saves it to model.pkl."""
    np.random.seed(42)
    # Synthetic dataset of student study hours (0 to 12) and attendance (30 to 100)
    study_hours = np.random.uniform(0, 12, 300)
    attendance = np.random.uniform(30, 100, 300)
    
    # Simple passing rule: score based on hours and attendance
    # e.g., study_hours * 0.6 + attendance * 0.05 - 5 > 0 -> Pass
    score = 0.6 * study_hours + 0.05 * attendance - 5.0
    labels = (score >= 0).astype(int)  # 1 = Pass, 0 = Fail

    X = np.column_stack((study_hours, attendance))
    y = labels

    model = LogisticRegression()
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)
    print(f"ML model trained and saved to {MODEL_PATH}")
    return model

def load_model():
    """Loads the trained ML model from disk. Trains a new model if model.pkl does not exist."""
    global _model
    if not os.path.exists(MODEL_PATH):
        _model = train_and_save_model()
    else:
        _model = joblib.load(MODEL_PATH)
    return _model

def predict_student(study_hours, attendance):
    """
    Accepts validated numeric study_hours and attendance,
    and returns a prediction dictionary or string: 'Pass' or 'Fail'.
    """
    global _model
    if _model is None:
        load_model()
    
    features = np.array([[float(study_hours), float(attendance)]])
    prediction_class = _model.predict(features)[0]
    return "Pass" if int(prediction_class) == 1 else "Fail"

if __name__ == "__main__":
    train_and_save_model()
    print("Testing prediction sample (hours=6, attendance=85):", predict_student(6, 85))
    print("Testing prediction sample (hours=2, attendance=40):", predict_student(2, 40))
