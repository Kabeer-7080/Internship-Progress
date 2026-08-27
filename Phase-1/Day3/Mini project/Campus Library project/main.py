from library_utils import *

while True:
    print("\n===== CAMPUS LIBRARY =====")
    print("1. Add Book")
    print("2. List Books")
    print("3. Borrow Book")
    print("4. Return Book")
    print("5. View Borrow Log")
    print("6. Exit")

    choice = input("Enter your choice: ")

    if choice == "1":
        add_book()

    elif choice == "2":
        list_books()

    elif choice == "3":
        borrow_book()

    elif choice == "4":
        return_book()

    elif choice == "5":
        view_log()

    elif choice == "6":
        library_summary()
        print("Thank You!")
        break

    else:
        print("Invalid choice! Please try again.")