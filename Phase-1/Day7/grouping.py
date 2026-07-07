# grouping.py

import pandas as pd

# -----------------------------
# Sample Dataset
# -----------------------------
data = {
    "Name": ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Henry"],
    "Subject": ["Maths", "Maths", "Science", "Science", "English", "English", "Maths", "Science"],
    "Marks": [92, 75, 88, 65, 90, 78, 81, 70]
}

df = pd.DataFrame(data)

print("\n---------------- STUDENT DATA ----------------\n")
print(df)

# -----------------------------
# Group By Subject
# -----------------------------
print("\n---------------- GROUPED DATA ----------------\n")

group = df.groupby("Subject")["Marks"]

summary = group.agg(["count", "sum", "mean", "max", "min"])

print(summary)

# -----------------------------
# Subject-wise Average
# -----------------------------
print("\nSubject-wise Average Marks\n")
print(group.mean())

# -----------------------------
# Subject-wise Maximum
# -----------------------------
print("\nHighest Marks in Each Subject\n")
print(group.max())

# -----------------------------
# Subject-wise Minimum
# -----------------------------
print("\nLowest Marks in Each Subject\n")
print(group.min())

# -----------------------------
# Top Student in Each Subject
# -----------------------------
print("\nTop Student in Each Subject\n")

top_students = df.loc[df.groupby("Subject")["Marks"].idxmax()]
print(top_students)

# -----------------------------
# Sorted Summary
# -----------------------------
print("\nSummary Sorted by Average Marks\n")

print(summary.sort_values(by="mean", ascending=False))

print("\nGrouping Completed Successfully!")