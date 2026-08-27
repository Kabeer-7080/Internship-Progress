import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import IntegrityError
from dotenv import load_dotenv

from ml.model import load_model, predict_student

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load ML model once when Flask starts
try:
    load_model()
    print("ML model loaded successfully")
except Exception as exc:
    print(f"Failed to load ML model: {exc}")
    raise exc

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "kabeer67"),
    "database": os.getenv("DB_NAME", "student_management"),
    "port": int(os.getenv("DB_PORT", "3306"))
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "model_loaded": True,
        "service": "Student Management + ML API",
        "status": "running"
    }), 200

@app.route("/api/students", methods=["GET"])
def get_students():
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, course FROM students ORDER BY id")
        return jsonify(cursor.fetchall()), 200
    except Exception as exc:
        return jsonify({"error": "Unable to retrieve students", "details": str(exc)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route("/api/students", methods=["POST"])
def create_student():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400

    required = ["name", "email", "course"]
    missing = [field for field in required if field not in data]
    if missing:
        return jsonify({"error": "Missing required field(s)", "fields": missing}), 400

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    course = str(data.get("course", "")).strip()

    empty = [field for field, value in
             [("name", name), ("email", email), ("course", course)] if not value]
    if empty:
        return jsonify({"error": "Required fields cannot be empty", "fields": empty}), 400

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO students (name, email, course) VALUES (%s, %s, %s)",
            (name, email, course)
        )
        conn.commit()
        student_id = cursor.lastrowid
        return jsonify({
            "message": "Student created successfully",
            "student": {"id": student_id, "name": name, "email": email, "course": course}
        }), 201
    except IntegrityError:
        if conn: conn.rollback()
        return jsonify({"error": "A student with this email already exists"}), 400
    except Exception as exc:
        if conn: conn.rollback()
        return jsonify({"error": "Unable to create student", "details": str(exc)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid input: Request body must be a JSON object"}), 400

    if "study_hours" not in data and "attendance" not in data:
        return jsonify({"error": "Invalid input: Missing required fields (study_hours, attendance)"}), 400

    if "study_hours" not in data:
        return jsonify({"error": "Invalid input: Missing study_hours"}), 400

    if "attendance" not in data:
        return jsonify({"error": "Invalid input: Missing attendance"}), 400

    study_hours = data.get("study_hours")
    attendance = data.get("attendance")

    if isinstance(study_hours, bool) or not isinstance(study_hours, (int, float)):
        return jsonify({"error": "Invalid input: study_hours must be a number"}), 400

    if isinstance(attendance, bool) or not isinstance(attendance, (int, float)):
        return jsonify({"error": "Invalid input: attendance must be a number"}), 400

    if study_hours < 0 or study_hours > 24:
        return jsonify({"error": "Invalid input: study_hours must be between 0 and 24"}), 400

    if attendance < 0 or attendance > 100:
        return jsonify({"error": "Invalid input: attendance must be between 0 and 100"}), 400

    try:
        prediction = predict_student(study_hours, attendance)
        return jsonify({"prediction": prediction}), 200
    except Exception as exc:
        return jsonify({"error": "Prediction failed", "details": str(exc)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
