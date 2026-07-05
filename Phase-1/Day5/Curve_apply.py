import numpy as np

# Original exam scores
scores = np.array([65, 70, 85, 90, 55])

# Add 5 bonus marks
curved_scores = scores + 5

print("Original Scores:", scores)
print("Curved Scores:", curved_scores)
print("Original Mean:", np.mean(scores))
print("Curved Mean:", np.mean(curved_scores))