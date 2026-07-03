# Function to calculate total deposits
def total_deposits(*amounts):
    return sum(amounts)

# Calling the function
print(total_deposits(150, 250, 100))
print(total_deposits(150, 250, 100, 50))