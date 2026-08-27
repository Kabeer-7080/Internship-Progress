# Day 46 — Machine Learning Model Integration Report

## 1. Objective

The goal of Day 46 is to integrate a Machine Learning prediction model into the existing Day 45 Flask backend (`app.py`), creating a seamless connection between the React frontend, Flask API, MySQL database, and the Scikit-Learn prediction engine.

---

## 2. Machine Learning Model & Architecture

### ML Model Used
- **Algorithm**: `scikit-learn LogisticRegression`
- **Classification Task**: Predict student academic outcome (`Pass` / `Fail`) based on numerical performance metrics.

### Model Files
- **Training & Prediction Logic**: [`backend/ml/model.py`](file:///c:/Users/Kabeer/OneDrive/Desktop/internship%20progress/Day%2046/backend/ml/model.py)
- **Serialized Model Binary**: [`backend/ml/model.pkl`](file:///c:/Users/Kabeer/OneDrive/Desktop/internship%20progress/Day%2046/backend/ml/model.pkl)

### Required Libraries
Updated [`backend/requirements.txt`](file:///c:/Users/Kabeer/OneDrive/Desktop/internship%20progress/Day%2046/backend/requirements.txt):
- `scikit-learn`
- `joblib`
- `numpy`
- `Flask==3.0.3`
- `flask-cors==4.0.1`
- `mysql-connector-python==9.0.0`

---

## 3. Data Format & Preprocessing

### Input Format
```json
{
    "study_hours": 6,
    "attendance": 85
}
```

### Output Format
```json
{
    "prediction": "Pass"
}
```

### Preprocessing & Prediction Logic
1. **Feature Extraction**: Converts input JSON fields `study_hours` and `attendance` into a 2D NumPy array `np.array([[study_hours, attendance]])`.
2. **Model Execution**: Invokes `model.predict(features)` on the pre-loaded Scikit-Learn `LogisticRegression` instance.
3. **Label Mapping**: Maps numerical predictions (`1` -> `"Pass"`, `0` -> `"Fail"`).

---

## 4. Flask Backend Integration & Endpoints

- **Startup Loading**: The trained ML model is loaded **once** when the Flask app starts via `load_model()` inside `backend/app.py`. A console message `"ML model loaded successfully"` confirms initialization.
- **Server Network Accessibility**: Configured `app.run(host="0.0.0.0", port=5000)` so the backend is accessible via `http://127.0.0.1:5000` or local network IP addresses (`http://10.x.x.x:5000`).

### Root Status Endpoint: `GET /`
- **URL**: `http://127.0.0.1:5000/`
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
    "model_loaded": true,
    "service": "Student Management + ML API",
    "status": "running"
}
```

### Prediction Endpoint: `POST /api/predict`
- **Method**: `POST`
- **URL**: `http://127.0.0.1:5000/api/predict`
- **Content-Type**: `application/json`

---

## 5. Input Validation & Error Handling

The API validates client input before invoking prediction logic, returning `400 Bad Request` without exposing stack traces:

1. **Missing Body / Non-JSON Body**: Returns `400 Bad Request` with `{"error": "Invalid input: Request body must be a JSON object"}`.
2. **Missing `study_hours` / `attendance`**: Returns `400 Bad Request` with structured error messages.
3. **Empty JSON `{}`**: Returns `400 Bad Request` with `{"error": "Invalid input: Missing required fields (study_hours, attendance)"}`.
4. **Invalid Data Types (Strings / Booleans)**: Returns `400 Bad Request` with `{"error": "Invalid input: study_hours must be a number"}`.
5. **Out-of-range Values**: Rejects `study_hours` outside `[0, 24]` and `attendance` outside `[0, 100]` with `400 Bad Request`.

---

## 6. Full React → Flask → ML Workflow

```text
React Frontend (User fills Study Hours & Attendance)
       ↓
POST /api/predict (JSON payload)
       ↓
Flask Backend Validation (Input check & type verification)
       ↓
ML Prediction Engine (backend/ml/model.py)
       ↓
Loaded Scikit-Learn Model (backend/ml/model.pkl)
       ↓
JSON Response: {"prediction": "Pass"}
       ↓
React UI (Renders Pass / Fail badge or Backend error card)
```

---

## 7. Test Results

| Test | Method | Result | Status |
| --- | --- | --- | --- |
| Root API Health Check | GET | Passed | 200 |
| Valid Prediction | POST | Passed | 200 |
| Missing Input | POST | Passed | 400 |
| Invalid Input | POST | Passed | 400 |
| Empty JSON | POST | Passed | 400 |
| No Body | POST | Passed | 400 |
| Existing GET Students | GET | Passed | 200 |
| Existing POST Student | POST | Passed | 201 |

---

## 8. Conclusion

Day 46 successfully introduced Machine Learning capability into the Student Management platform. The Flask backend loads the trained model once during startup, serving fast and reliable predictions via `POST /api/predict`. Opening the root backend URL `http://127.0.0.1:5000/` in a browser displays standard Flask JSON status confirmation, while the React UI running separately on Vite provides intuitive student and ML management capabilities.
