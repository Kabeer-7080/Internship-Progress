# Writing to a file
with open("demo.txt", "w") as file:
    file.write("Hello Python!\n")
    file.write("Welcome to File Handling.\n")

# Appending new content
with open("demo.txt", "a") as file:
    file.write("This is a new line.\n")

# Reading the file
with open("demo.txt", "r") as file:
    print(file.read())

print("File not found!")