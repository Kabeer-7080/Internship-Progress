import os
import pandas as pd

csv_file = os.path.join(os.path.dirname(__file__), "students.csv")
df = pd.read_csv(csv_file)

print("Students with CGPA > 8.5")
print(df[df["CGPA"] > 8.5])

print("\nStudents from CSE and 3rd Year")
print(df[(df["Department"] == "CSE") & (df["Year"] == "3rd Year")])

print("\nStudents with Marks > 85 and Attendance > 90")
print(df[(df["Marks"] > 85) & (df["Attendance"] > 90)])