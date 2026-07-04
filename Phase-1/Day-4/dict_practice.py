# dict_practice.py
student = {
    "Name": "Mohammed Kabeer",
    "Subject": "Python",
    "Score": 78,
    "Status": "Pass"
}
print("Student Details")
print("---------------")
for key, value in student.items():
    print(f"{key} : {value}")
# Update the score
student["Score"] = 98

print("\nAfter Updating Score")
print("--------------------")
for key, value in student.items():
    print(f"{key} : {value}")