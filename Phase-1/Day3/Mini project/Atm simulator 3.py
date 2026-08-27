from datetime import datetime

balance = 5000
history = []


def format_currency(amount):
    return f"Rs.{amount:.2f}"


def log_transaction(action, amount):
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    entry = f"{time} - {action} {format_currency(amount)}"

    history.append(entry)

    with open("transactions.txt", "a") as file:
        file.write(entry + "\n")


def is_valid_amount(amount):
    return amount > 0


while True:

    print("\n1.Check Balance")
    print("2.Deposit")
    print("3.Withdraw")
    print("4.View History")
    print("5.Exit")

    choice = input("Enter Choice: ")

    if choice == "1":
        print(f"Current Balance: {format_currency(balance)}")

    elif choice == "2":
        amount = float(input("Enter amount: "))

        if is_valid_amount(amount):
            balance += amount
            log_transaction("Deposited", amount)
            print("Deposit Successful!")
        else:
            print("Invalid Amount!")

    elif choice == "3":
        amount = float(input("Enter amount: "))

        if not is_valid_amount(amount):
            print("Invalid Amount!")

        elif amount > balance:
            print("Insufficient Balance!")

        else:
            balance -= amount
            log_transaction("Withdrawn", amount)
            print("Withdrawal Successful!")

    elif choice == "4":

        try:
            with open("transactions.txt", "r") as file:
                print(file.read())

        except FileNotFoundError:
            print("No Transaction History!")

    elif choice == "5":

        print("\nThank You!")
        break

    else:
        print("Invalid Choice!")