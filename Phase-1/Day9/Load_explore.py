import pandas as pd
from sklearn.datasets import load_iris

# Load Iris Dataset
iris = load_iris()

# Create DataFrame
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df["species"] = [iris.target_names[i] for i in iris.target]

# Display Dataset
print(df)

# Display Selected Columns
print("\nSelected Columns\n")
print(df[["sepal length (cm)", "petal length (cm)"]])

# Check Missing Values
print("\nMissing Values\n")
print(df.isnull().sum())

# Summary Statistics
print("\nSummary Statistics\n")
print(df.describe())

# Data Types
print("\nData Types\n")
print(df.dtypes)

# Dataset Information
print("\nInformation\n")
df.info()

# Save Dataset as CSV
df.to_csv("iris_dataset.csv", index=False)

print("\nDataset saved successfully!")