import os
import pandas as pd

csv_file = os.path.join(os.path.dirname(__file__), "students.csv")
df = pd.read_csv(csv_file)

print("Maximum Marks :", df["Marks"].max())
print("Average CGPA :", round(df["CGPA"].mean(), 2))
print("Average Attendance :", round(df["Attendance"].mean(), 2))
print("Student with Highest Marks")
print(df.loc[df["Marks"].idxmax()])