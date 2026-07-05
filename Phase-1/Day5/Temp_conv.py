import numpy as np

# Temperatures in Fahrenheit
fahrenheit = np.array([32, 68, 95, 122, 77])

# Convert to Celsius
celsius = (fahrenheit - 32) * 5 / 9

print("Fahrenheit:", fahrenheit)
print("Celsius:", celsius)