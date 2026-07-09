from sklearn.datasets import load_iris

# Load Iris Dataset
iris = load_iris()

# Print Flower Names
print("Printing Flower Names")

for flower in iris.target_names:
    print(flower)