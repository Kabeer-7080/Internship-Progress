# Importing modules
from datetime import datetime

# Function to add entry
def add_entry(text):
    with open("journal.txt", "a") as f:
        time = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        f.write(f"{time} - {text}\n")

# Function to show entries
def show_entries():
    with open("journal.txt", "r") as f:
        print(f.read())


# Clear the file before adding new entries
open("journal.txt", "w").close()

# Add entries
add_entry("My name is Kabeer.")
add_entry("I am a curious learner.")
add_entry("I like to play video games.")

# Show all entries
show_entries()