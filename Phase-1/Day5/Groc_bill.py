import numpy as np

prices = np.array([20, 30, 25, 40, 60])
quantity = np.array([5, 3, 4, 2, 4])

item_totals = prices * quantity
grand_total = np.sum(item_totals)

print("Item Totals:", item_totals)
print("Grand Total:", grand_total)