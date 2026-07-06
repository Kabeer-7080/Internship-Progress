import os
import pandas as pd

file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "students.csv")
df = pd.read_csv(file)

# Scholarship Criteria
eligible = df[
    (df["CGPA"] >= 8.5) &
    (df["Attendance"] >= 90) &
    (df["Backlogs"] == 0)
]

print("-" * 40)
print("Eligible Students")
print("-" * 40)
print(eligible[["Name", "Department", "CGPA"]])

print("\nTotal Eligible Students:", len(eligible))

print("\nEligible Students:")
print(eligible[["Name", "Department", "CGPA"]])

print("\nDepartment Count:")
print(eligible["Department"].value_counts())

print("\nAverage CGPA of Eligible Students:")
print(round(eligible["CGPA"].mean(), 2))

print("\nAverage Marks of Whole Class:")
print(round(df["Marks"].mean(), 2))

eligible.to_csv("scholarship_shortlist.csv", index=False)

print("\nScholarship shortlist saved successfully!")