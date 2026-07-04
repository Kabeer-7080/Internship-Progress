# gradevault.py

from grade_utils import *

students = [
    {"name": "Kabeer", "subject": "Python", "score": 85},
    {"name": "Rahul", "subject": "Python", "score": 60},
    {"name": "Husna", "subject": "Java", "score": 45},
    {"name": "John", "subject": "Java", "score": 78}
]

# Add status for existing students
for student in students:
    student["status"] = get_status(student["score"])

print("========= GRADE VAULT =========")

# Display unique subjects
unique_subjects(students)

# Add a new student
add_student(students, "David", "Python", 90)

# Display all students
list_students(students)

# Display class average
class_average(students)

# Display top scorer
top_scorer(students)

# Search for a student
search_student(students, "Husna")