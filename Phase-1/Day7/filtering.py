# filtering.py

import pandas as pd

# -----------------------------
# Create Sample Student Dataset
# -----------------------------
students = pd.DataFrame({
    "Roll No": [101, 102, 103, 104, 105, 106, 107, 108],
    "Name": ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Henry"],
    "Class": ["A", "A", "B", "B", "A", "C", "C", "B"],
    "Subject": ["Maths", "Science", "Maths", "English", "Science", "Maths", "English", "Science"],
    "Marks": [92, 78, 65, 88, 56, 73, 95, 81],
    "Percentage": [92, 78, 65, 88, 56, 73, 95, 81]
})

students.to_csv("students.csv", index=False)

# -----------------------------
# Load CSV
# -----------------------------
df = pd.read_csv("students.csv")

print("\n---------------- STUDENT DATA ----------------\n")
print(df)

# -----------------------------
# Percentage Series
# -----------------------------
print("\nPercentage Series:\n")
print(df["Percentage"])

# -----------------------------
# Students with Percentage > 80
# -----------------------------
print("\nStudents with Percentage > 80\n")
print(df[df["Percentage"] > 80])

# -----------------------------
# Class A Students
# -----------------------------
print("\nClass A Students\n")
print(df[df["Class"] == "A"])

# -----------------------------
# Maths Students Scoring >= 70
# -----------------------------
print("\nMaths Students Scoring >= 70\n")
print(df[(df["Subject"] == "Maths") & (df["Marks"] >= 70)])

# -----------------------------
# Using query()
# -----------------------------
print("\nUsing query(): Marks >= 75\n")
print(df.query("Marks >= 75"))

print("\nFiltering Completed Successfully!")