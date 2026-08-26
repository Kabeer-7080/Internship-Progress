# Day 47 — Student Management with Machine Learning Integration

A complete Student Management platform featuring MySQL CRUD database operations, React frontend, and a Scikit-Learn Machine Learning prediction engine served via Flask REST APIs.

## Stack

- **Frontend**: React + Vite
- **Backend**: Flask + Scikit-Learn
- **Database**: MySQL
- **ML Engine**: Logistic Regression (`scikit-learn`, `joblib`, `numpy`)
- **API Testing**: Postman Collection

## Project Structure

```text
Day_45_Student_Management/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── ml/
│       ├── model.py
│       └── model.pkl
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── package.json
│   └── ...
│
├── database/
│   └── student_management.sql
│
├── postman/
│   └── Student Management API - Day 45.postman_collection.json
│
├── docs/
│   ├── day-45-api-testing.md
│   └── day-46-ml-integration.md
│
├── screenshots/
│
└── README.md
```

---

## Setup & Running Instructions

### 1. Database Setup (MySQL)

Ensure MySQL server is running, then load the SQL schema:

```sql
database/student_management.sql
```

This sets up the `student_management` database and seeds default student records.

### 2. Start the Flask Backend & ML Engine

Navigate to the `backend` directory:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Upon startup, Flask initializes and loads the ML model once with the log message:

```text
ML model loaded successfully
```

> **Note**: If your MySQL password is set, configure it before running:
> ```bash
> set DB_PASSWORD=YOUR_MYSQL_PASSWORD
> ```

Backend URLs:
- Local Machine: `http://127.0.0.1:5000`
- Network Access: `http://0.0.0.0:5000` or `http://<your-local-ip>:5000`

### 3. Start the React Frontend

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite development server URL in your browser:

```text
http://localhost:5173
```

---

## API Documentation

### 1. GET `/` (API Health Check)
- **Description**: Displays JSON status indicating Flask backend and ML model readiness when accessed from browser or HTTP clients.
- **Response**: `200 OK`
  ```json
  {
    "model_loaded": true,
    "service": "Student Management + ML API",
    "status": "running"
  }
  ```

### 2. GET `/api/students`
- **Description**: Fetch all registered students from MySQL database.
- **Response**: `200 OK` (JSON array of students)

### 3. POST `/api/students`
- **Description**: Add a new student.
- **Request Body**:
  ```json
  {
    "name": "Arun Kumar",
    "email": "arun@example.com",
    "course": "Computer Science"
  }
  ```
- **Response**: `201 Created`

### 4. POST `/api/predict` (New ML Endpoint)
- **Description**: Predict student outcome (`Pass` / `Fail`) using the pre-loaded Scikit-Learn LogisticRegression model.
- **Valid Request**:
  ```json
  {
    "study_hours": 6,
    "attendance": 85
  }
  ```
- **Valid Response**: `200 OK`
  ```json
  {
    "prediction": "Pass"
  }
  ```
- **Error Handling**: Rejects missing fields, non-numeric values, or out-of-bounds metrics with `400 Bad Request`.
  ```json
  {
    "error": "Invalid input: study_hours must be between 0 and 24"
  }
  ```

---

## Testing with Postman

1. Import collection:
   ```text
   postman/Student Management API - Day 45.postman_collection.json
   ```
2. Execute requests 00 for Root API Status, 01 through 10 for Student APIs, and requests 11 through 17 for ML Prediction validation.

---

## Documentation & Reports

- **Day 45 API Testing**: [`docs/day-45-api-testing.md`](file:///c:/Users/Kabeer/OneDrive/Desktop/internship%20progress/Day%2046/docs/day-45-api-testing.md)
- **Day 46 ML Integration**: [`docs/day-46-ml-integration.md`](file:///c:/Users/Kabeer/OneDrive/Desktop/internship%20progress/Day%2046/docs/day-46-ml-integration.md)
