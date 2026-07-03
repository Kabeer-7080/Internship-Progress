def build_receipt(details):
    receipt = "\n========== RECEIPT ==========\n"

    for key, value in details.items():
        receipt += f"{key:<10}: {value}\n"

    return receipt + "============================="


customers = [
    {
        "Name": "Kabeer",
        "Age": 25,
        "Amount": 220,
        "Type": "Food",
        "Payment": "Cash"
    },
    {
        "Name": "Amit",
        "Age": 33,
        "Amount": 120,
        "Type": "Electronics",
        "Payment": "UPI"
    }
]

for customer in customers:
    print(build_receipt(customer))
    print()