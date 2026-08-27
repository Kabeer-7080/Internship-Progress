# Global variable
balance = 500

def show_balance():
    balance = 0
    print("Inside Function:", balance)
show_balance()
print("Outside Function:", balance)

# Correct way
def deposit(balance, amount):
    return balance + amount
balance = deposit(balance, 100)
print("Updated Balance:", balance)