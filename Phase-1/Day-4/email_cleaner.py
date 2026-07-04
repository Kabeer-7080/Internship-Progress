# email_cleaner.py

emails = [
    "kabeer@gmail.com",
    "john@gmail.com",
    "alice@gmail.com",
    "Rifa@gmail.com",
    "rahul@gmail.com",
    "john@gmail.com",
    "sara@gmail.com",
    "noor@gmail.com"
]

print("Original Email List:")
print(emails)

unique_emails = list(set(emails))

print("\nUnique Email Addresses:")
print(unique_emails)

print("\nTotal Entries :", len(emails))
print("Unique Emails :", len(unique_emails))
print("Duplicates Removed :", len(emails) - len(unique_emails))