# Table Printer Program

number = int(input("Enter a number: "))

print("\nMultiplication Table")

for i in range(1, 11):
    result = number * i
    print(f"{number} x {i} = {result}")