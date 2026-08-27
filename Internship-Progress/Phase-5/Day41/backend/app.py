from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

students = [
    {
        "id": 1,
        "name": "Ethan Miller",
        "email": "ethan.miller@example.com",
        "course": "AI & Data Science"
    },
    {
        "id": 2,
        "name": "Olivia Johnson",
        "email": "olivia.johnson@example.com",
        "course": "Computer Science"
    },
    {
        "id": 3,
        "name": "Jackson Davis",
        "email": "jackson.davis@example.com",
        "course": "Information Technology"
    },
    {
        "id": 4,
        "name": "Emily Wilson",
        "email": "emily.wilson@example.com",
        "course": "Artificial Intelligence"
    },
    {
        "id": 5,
        "name": "Noah Anderson",
        "email": "noah.anderson@example.com",
        "course": "Data Science"
    }
]


@app.route("/api/students", methods=["GET"])
def get_students():
    return jsonify(students)

if __name__ == "__main__":
    app.run(debug=True)


    