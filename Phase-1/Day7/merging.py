# merging.py

import pandas as pd

# -----------------------------
# Students Data
# -----------------------------
students = pd.DataFrame({
    "Roll No": [101, 102, 103, 104, 105, 106],
    "Name": ["Alice", "Bob", "Charlie", "David", "Eva", "Frank"],
    "Class": ["A", "A", "B", "B", "C", "C"]
})

# -----------------------------
# Marks Data
# -----------------------------
marks = pd.DataFrame({
    "Roll No": [101, 102, 103, 104, 105, 106],
    "Subject": ["Maths", "Science", "Maths", "English", "Science", "Maths"],
    "Marks": [92, 85, 76, 88, 69, 95]
})

# -----------------------------
# Attendance Data
# -----------------------------
attendance = pd.DataFrame({
    "Roll No": [101, 102, 103, 104, 105, 106],
    "Attendance (%)": [95, 88, 91, 86, 80, 98]
})

print("\n---------------- STUDENTS ----------------\n")
print(students)

print("\n---------------- MARKS ----------------\n")
print(marks)

# -----------------------------
# Inner Merge
# -----------------------------
print("\n---------------- INNER MERGE ----------------\n")

inner = pd.merge(students, marks, on="Roll No", how="inner")
print(inner)

# -----------------------------
# Left Merge
# -----------------------------
print("\n---------------- LEFT MERGE ----------------\n")

left = pd.merge(students, marks, on="Roll No", how="left")
print(left)

# -----------------------------
# Outer Merge
# -----------------------------
print("\n---------------- OUTER MERGE ----------------\n")

outer = pd.merge(students, marks, on="Roll No", how="outer")
print(outer)

# -----------------------------
# Merge Three DataFrames
# -----------------------------
print("\n----------- COMPLETE STUDENT REPORT -----------\n")

report = (
    students
    .merge(marks, on="Roll No")
    .merge(attendance, on="Roll No")
)

print(report)

# -----------------------------
# Multi-Key Merge Example
# -----------------------------
print("\n----------- MULTI-KEY MERGE -----------\n")

exam1 = pd.DataFrame({
    "Roll No": [101, 102, 103],
    "Subject": ["Maths", "Science", "Maths"],
    "Marks": [92, 85, 76]
})

exam2 = pd.DataFrame({
    "Roll No": [101, 102, 103],
    "Subject": ["Maths", "Science", "Maths"],
    "Grade": ["A+", "A", "B+"]
})

multi = pd.merge(exam1, exam2, on=["Roll No", "Subject"])

print(multi)

print("\nMerging Completed Successfully!")