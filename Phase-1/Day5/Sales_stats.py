import numpy as np

# Weekly sales data
sales = np.array([1200, 1500, 1100, 1800, 1700, 1600, 1400])

print("Weekly Sales:", sales)
print("Average Sales:", round(np.mean(sales), 2))
print("Highest Sales:", np.max(sales))
print("Lowest Sales:", np.min(sales))