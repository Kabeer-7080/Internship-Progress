import numpy as np

# Dictionary storing steps of each person
fitness = {
    "Ayaan": 6500,
    "Usman": 9200,
    "Rahul": 7800,
    "Sara": 10500,
    "Priya": 8600
}

# Save data to file
with open("steps_log.txt", "w") as file:
    for name, steps in fitness.items():
        file.write(f"{name},{steps}\n")

# Read data from file
names = []
steps = []

with open("steps_log.txt", "r") as file:
    for line in file:
        name, step = line.strip().split(",")
        names.append(name)
        steps.append(int(step))

# Convert to NumPy array
steps = np.array(steps)

print("Daily Steps:", steps)
print("Average Steps:", np.mean(steps))
print("Highest Steps:", np.max(steps))
print("Lowest Steps:", np.min(steps))

# Boolean Masking
print("\nPeople with more than 8000 steps:")
for name, step in zip(names, steps):
    if step > 8000:
        print(name, "-", step)

# Normalization
normalized = (steps - np.min(steps)) / (np.max(steps) - np.min(steps))

print("\nNormalized Steps:")
print(np.round(normalized, 2))

# Sorting
sorted_steps = np.sort(steps)

print("\nSorted Steps:")
print(sorted_steps)