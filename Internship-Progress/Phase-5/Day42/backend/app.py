from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

students = [
    {"id": 1, "name": "Arun Kumar", "email": "arun@example.com", "course": "AI & Data Science"},
    {"id": 2, "name": "Priya S", "email": "priya@example.com", "course": "Computer Science"},
    {"id": 3, "name": "AFSIN NOOR", "email": "afsinnoor@gmail.com", "course": "Artificial Intelligence & Data Science"},
    {"id": 4, "name": "Usman", "email": "achus@gmail.com", "course": "AI & ML"}
]

@app.route("/api/students", methods=["GET"])
def get_students():
    return jsonify(students)

@app.route("/api/students", methods=["POST"])
def add_student():
    data = request.get_json()

    if not data.get("name") or not data.get("email") or not data.get("course"):
        return jsonify({"error": "Name, email and course are required"}), 400

    new_student = {
        "id": len(students) + 1,
        "name": data["name"],
        "email": data["email"],
        "course": data["course"]
    }

    students.append(new_student)

    return jsonify({
        "message": "Student created successfully",
        "student": new_student
    }), 201

if __name__ == "__main__":
    app.run(debug=True)