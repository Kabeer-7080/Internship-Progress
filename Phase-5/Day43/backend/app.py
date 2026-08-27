from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

students = [
    {
        "id": 1,
        "name": "Arun Kumar",
        "email": "arun@gmail.com",
        "course": "Computer Science"
    },
    {
        "id": 2,
        "name": "Priya S",
        "email": "priya@gmail.com",
        "course": "Data Science"
    },
    {
        "id": 3,
        "name": "Rahul M",
        "email": "rahul@gmail.com",
        "course": "Information Technology"
    }
]


# GET - Fetch students
@app.route("/students", methods=["GET"])
def get_students():
    return jsonify(students)


# POST - Add a student
@app.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    new_student = {
        "id": len(students) + 1,
        "name": data.get("name"),
        "email": data.get("email"),
        "course": data.get("course")
    }

    students.append(new_student)

    return jsonify({
        "message": "Student created successfully",
        "student": new_student
    }), 201


if __name__ == "__main__":
    app.run(debug=True, port=5000)