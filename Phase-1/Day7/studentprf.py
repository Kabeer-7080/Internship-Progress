# studentprf.py

import pandas as pd

# -----------------------------------
# Create Student Details
# -----------------------------------
students = pd.DataFrame({
    "Roll No": [101, 102, 103, 104, 105, 106],
    "Name": ["Alice", "Bob", "Charlie", "David", "Eva", "Frank"]
})

# -----------------------------------
# Create Marks Details
# -----------------------------------
results = pd.DataFrame({
    "Roll No": [101, 102, 103, 104, 105, 106],
    "Maths": [92, 78, 65, 88, 55, 96],
    "Science": [89, 81, 70, 85, 60, 94],
    "English": [95, 75, 68, 90, 58, 91]
})

# -----------------------------------
# Create Attendance Details
# -----------------------------------
attendance = pd.DataFrame({
    "Roll No": [101, 102, 103, 104, 105, 106],
    "Attendance (%)": [96, 90, 82, 87, 74, 99]
})

# -----------------------------------
# Merge DataFrames
# -----------------------------------
df = students.merge(results, on="Roll No").merge(attendance, on="Roll No")

# -----------------------------------
# Calculate Total & Average
# -----------------------------------
subjects = ["Maths", "Science", "English"]

df["Total"] = df[subjects].sum(axis=1)
df["Average"] = df[subjects].mean(axis=1).round(2)

# -----------------------------------
# Assign Grade
# -----------------------------------
def grade(avg):
    if avg >= 90:
        return "A+"
    elif avg >= 80:
        return "A"
    elif avg >= 70:
        return "B"
    elif avg >= 60:
        return "C"
    else:
        return "F"

df["Grade"] = df["Average"].apply(grade)

# -----------------------------------
# Display Complete Report
# -----------------------------------
print("\n========== STUDENT PERFORMANCE REPORT ==========\n")
print(df)

# -----------------------------------
# Top Performer
# -----------------------------------
top = df.loc[df["Average"].idxmax()]

print("\n========== TOP PERFORMER ==========\n")
print(top)

# -----------------------------------
# At-Risk Students
# -----------------------------------
print("\n========== AT-RISK STUDENTS ==========\n")

risk = df[(df["Average"] < 60) | (df["Attendance (%)"] < 75)]

if risk.empty:
    print("No at-risk students.")
else:
    print(risk)

# -----------------------------------
# Subject-wise Statistics
# -----------------------------------
print("\n========== SUBJECT-WISE AVERAGE ==========\n")
print(df[subjects].mean().round(2))

print("\n========== HIGHEST MARKS ==========\n")
print(df[subjects].max())

print("\n========== LOWEST MARKS ==========\n")
print(df[subjects].min())

# -----------------------------------
# Save Final Report
# -----------------------------------
df.to_csv("Student_Performance_Report.csv", index=False)

print("\nReport exported successfully as 'Student_Performance_Report.csv'")