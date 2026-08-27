from datetime import datetime

books = []
borrowed_books = []


def add_book():
    book = input("Enter Book Name: ").strip()

    if book:
        books.append(book)
        print(f"'{book}' added successfully!")
    else:
        print("Book name cannot be empty.")


def list_books():
    print("\n--- Available Books ---")

    available = [book for book in books if book not in borrowed_books]

    if available:
        for i, book in enumerate(available, start=1):
            print(f"{i}. {book}")
    else:
        print("No books available.")


def borrow_book():
    book = input("Enter Book Name to Borrow: ").strip()

    if book in books and book not in borrowed_books:
        borrowed_books.append(book)

        with open("borrow_log.txt", "a") as file:
            time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            file.write(f"{time} | BORROWED | {book}\n")

        print(f"You borrowed '{book}'.")

    elif book in borrowed_books:
        print("Book is already borrowed.")

    else:
        print("Book not found.")


def return_book():
    book = input("Enter Book Name to Return: ").strip()

    if book in borrowed_books:
        borrowed_books.remove(book)

        with open("borrow_log.txt", "a") as file:
            time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            file.write(f"{time} | RETURNED | {book}\n")

        print(f"You returned '{book}'.")

    else:
        print("This book was not borrowed.")


def view_log():
    print("\n--- Borrow Log ---")

    try:
        with open("borrow_log.txt", "r") as file:
            print(file.read())

    except FileNotFoundError:
        print("No borrow history found.")


def library_summary():
    print("\n--- Library Summary ---")
    print(f"Total Books: {len(books)}")
    print(f"Borrowed: {len(borrowed_books)}")
    print(f"Available: {len(books) - len(borrowed_books)}")