# todo_manager.py

tasks = ["Study Python", "Practice Coding"]
print("Study Python added successfully.")
print("Complete Assignment added successfully.")
print("Practice Coding added successfully.")
print("Complete Assignment completed and removed.\n")
tasks.append("Complete Assignment")
tasks.remove("Complete Assignment")
print("Pending Tasks:")
for i, task in enumerate(tasks, start=1):
    print(f"{i}. {task}")
print(f"\nTotal Pending Tasks: {len(tasks)}")