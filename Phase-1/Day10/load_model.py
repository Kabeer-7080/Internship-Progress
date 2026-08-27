import pickle
from sklearn.datasets import load_diabetes

# Load the saved model
with open("diabetes_model.pkl", "rb") as file:
    model = pickle.load(file)

# Load the Diabetes dataset
diabetes = load_diabetes()

# Take the first sample
sample = [diabetes.data[0]]

# Make prediction
prediction = model.predict(sample)

print("Predicted Disease Progression:", prediction[0])