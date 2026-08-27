import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import IntegrityError
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "kabeer67"),
    "database": os.getenv("DB_NAME", "student_management"),
    "port": int(os.getenv("DB_PORT", "3306"))
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

@app.get("/api/students")
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

@app.post("/api/students")
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

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
