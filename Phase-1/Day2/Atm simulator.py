# ATM Simulator

balance = 5000
transaction = 0

while True:

    print("\n----- ATM Menu -----")
    print("1. Check Balance")
    print("2. Deposit")
    print("3. Withdraw")
    print("4. Exit")

    choice = input("Enter your choice: ")

    # Check balance
    if choice == "1":
        print("Your Balance is:", balance)

    # Deposit money
    elif choice == "2":
        amount = int(input("Enter amount to deposit: "))

        if amount > 0:
            balance = balance + amount
            transaction = transaction + 1
            print("Money Deposited Successfully")
        else:
            print("Invalid Amount")

    # Withdraw money
    elif choice == "3":
        amount = int(input("Enter amount to withdraw: "))

        if amount > 0:
            if amount <= balance:
                balance = balance - amount
                transaction = transaction + 1
                print("Money Withdrawn Successfully")
            else:
                print("Not enough balance")
        else:
            print("Invalid Amount")

    # Exit the program
    elif choice == "4":
        print("Thank you for using ATM")
        print("Total Transactions:", transaction)
        break

    else:
        print("Invalid Choice")