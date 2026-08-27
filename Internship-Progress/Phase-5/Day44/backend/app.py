import os
import mysql.connector
from mysql.connector import Error, IntegrityError
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "student_management")
    )

@app.get("/api/students")
def get_students():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, course FROM students ORDER BY id")
        students = cursor.fetchall()
        return jsonify({"success": True, "students": students}), 200
    except Error:
        return jsonify({"success": False, "message": "Unable to retrieve students"}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/students")
def create_student():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    course = str(data.get("course", "")).strip()

    if not name or not email or not course:
        return jsonify({
            "success": False,
            "message": "Name, email, and course are required"
        }), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO students (name, email, course) VALUES (%s, %s, %s)",
            (name, email, course)
        )
        student_id = cursor.lastrowid
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Student added successfully",
            "student": {
                "id": student_id,
                "name": name,
                "email": email,
                "course": course
            }
        }), 201

    except IntegrityError:
        if connection:
            connection.rollback()
        return jsonify({
            "success": False,
            "message": "Email already exists"
        }), 409
    except Error:
        if connection:
            connection.rollback()
        return jsonify({
            "success": False,
            "message": "Unable to save student"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

def init_db():
    try:
        host = os.getenv("DB_HOST", "localhost")
        user = os.getenv("DB_USER", "root")
        password = os.getenv("DB_PASSWORD", "")
        db_name = os.getenv("DB_NAME", "student_management")

        conn = mysql.connector.connect(host=host, user=user, password=password)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.execute(f"USE {db_name}")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                course VARCHAR(100) NOT NULL
            )
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print(f"Database '{db_name}' initialized successfully.")
    except Exception as err:
        print(f"Database initialization error: {err}")

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)

