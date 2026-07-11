import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# -------------------------------
# 1. Load Dataset
# -------------------------------
df = pd.read_csv("heart.csv")

print("First 5 Rows")
print(df.head())

print("\nDataset Shape")
print(df.shape)

print("\nDataset Information")
print(df.info())
# -------------------------------
# 2. Features & Target
# -------------------------------

X = df.drop("target", axis=1)
y = df["target"]

print("\nFeatures (X)")
print(X.head())

print("\nTarget (y)")
print(y.head())

print("\nX Shape:", X.shape)
print("Y Shape:", y.shape)
# -------------------------------
# 3. Splitting Into Training and Testing
# -------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("Training Data Shape")
print(X_train.shape)

print("\nTesting Data Shape")
print(X_test.shape)
# -------------------------------
# 4. Training the Model
# -------------------------------

model = LogisticRegression(max_iter=1000)

model.fit(X_train, y_train)

print("Model Trained Successfully")

predictions = model.predict(X_test)

print("\nFirst 10 Predicted Values")
print(predictions[:10])

print("\nFirst 10 Actual Values")
print(y_test.values[:10])
# -------------------------------
# 5. Predicting for New Records
# -------------------------------

new_data = pd.DataFrame({
    "age": [52, 45],
    "sex": [1, 0],
    "cp": [0, 2],
    "trestbps": [130, 120],
    "chol": [250, 220],
    "fbs": [0, 0],
    "restecg": [1, 0],
    "thalach": [150, 170],
    "exang": [0, 0],
    "oldpeak": [1.2, 0.4],
    "slope": [2, 2],
    "ca": [0, 0],
    "thal": [2, 2]
})

prediction = model.predict(new_data)

print("\nPredictions For New Patients")
print(prediction)
# -------------------------------
# 6. Summary
# -------------------------------

print("\n-----------SUMMARY-----------")

print("Dataset Used : Heart Disease Dataset")
print("Number of Records :", df.shape[0])
print("Number of Features :", X.shape[1])
print("Target Column : target")
print("Model Used : Logistic Regression")