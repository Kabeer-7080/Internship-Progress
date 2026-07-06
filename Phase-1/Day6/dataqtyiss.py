import os
import pandas as pd

# Get the CSV path
file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dirty_students.csv")

# Read CSV
df = pd.read_csv(file)

# Missing values
print("Missing Values:")
print(df.isnull().sum())

# Duplicate rows
print("\nDuplicate Rows:", df.duplicated().sum())

# Clean data
df.fillna({
    "Department": "Unknown",
    "Age": df["Age"].mean(),
    "Marks": df["Marks"].mean(),
    "Attendance": df["Attendance"].mean(),
    "City": "Unknown"
}, inplace=True)

df.drop_duplicates(inplace=True)

print("\nData Cleaned Successfully!\n")
print(df)

# Save cleaned file
output = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cleaned_students.csv")
df.to_csv(output, index=False)

print("\nCleaned file saved successfully!")