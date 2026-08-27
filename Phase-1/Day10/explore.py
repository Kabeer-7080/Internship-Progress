from sklearn.datasets import load_iris
import pandas as pd

# Load Iris dataset
iris = load_iris()

# Create DataFrame
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df["species"] = [iris.target_names[i] for i in iris.target]

print("=" * 60)
print("IRIS DATASET")
print("=" * 60)

# First 5 rows
print("\nFirst 5 Records:\n")
print(df.head())

# Dataset information
print("\nDataset Shape:")
print(df.shape)

print("\nColumn Names:")
print(df.columns.tolist())

# Species count
print("\nNumber of Flowers in Each Species:\n")
print(df["species"].value_counts())

# Average values
print("\nAverage of Features for Each Species:\n")
print(df.groupby("species").mean())

# Species with highest average sepal length
highest = df.groupby("species")["sepal length (cm)"].mean().idxmax()

print("\nSpecies with Highest Average Sepal Length:")
print(highest)

# Create Sepal Area feature
df["Sepal Area"] = df["sepal length (cm)"] * df["sepal width (cm)"]

print("\nDataset with Sepal Area (First 5 Rows):\n")
print(df.head())

# Filter Virginica flowers
filtered = df[
    (df["species"] == "virginica") &
    (df["petal length (cm)"] > 5)
]

print("\nVirginica Flowers with Petal Length Greater than 5 cm:\n")
print(filtered)

# Save CSV
filtered.to_csv("filtered_iris.csv", index=False)

print("\nfiltered_iris.csv saved successfully!")