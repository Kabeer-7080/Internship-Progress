import os
import pandas as pd

csv_file = os.path.join(os.path.dirname(__file__), "students.csv")
df = pd.read_csv(csv_file)

print("No of Rows and Columns :", df.shape)

print("\nCOLUMN NAMES")
print(df.columns)

print("\n---------------- DATA TYPES ----------------")
print(df.dtypes)

print("\n---------------- TOP FIVE RECORDS ----------------")
print(df.head())

print("\n---------------- LAST FIVE RECORDS ----------------")
print(df.tail())