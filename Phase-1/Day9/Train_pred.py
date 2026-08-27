import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# Load Iris Dataset
iris = load_iris()

X = iris.data
y = iris.target

# Split Dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# Train Model
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# Sample Prediction
sample = [[5.1, 3.5, 1.4, 0.2]]

# Probability of each class
probability = model.predict_proba(sample)
print(probability)

# Predicted class
prediction = model.predict(sample)
print(prediction)

# Actual vs Predicted
pred = model.predict(X_test)

result = pd.DataFrame({
    "Actual": y_test,
    "Predicted": pred
})

print("\nActual  Predicted")
print(result)