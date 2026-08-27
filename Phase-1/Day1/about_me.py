# about_me.py

# ------------------ Store Personal Details ------------------

name = "MOHAMED KABEER YOUSUFF"
age = 20
department = "Artificial Intelligence & Data Science"
college = "Bsr abdur rahman Crescent Institute of Science and Technology"
learning = "Python"
has_coded_before = True
goal = "AI Engineer"

# ------------------ Create Border ------------------

border = "=" * 50

# ------------------ Print Profile Card ------------------

print(border)
print("          MY DEVELOPER PROFILE CARD")
print(border)

print(f"{'Name':<20}: {name}")
print(f"{'Age':<20}: {age}")
print(f"{'Department':<20}: {department}")
print(f"{'College':<20}: {college}")
print(f"{'Learning':<20}: {learning}")
print(f"{'Has Coded Before':<20}: {has_coded_before}")
print(f"{'Career Goal':<20}: {goal}")

print(border)

# ------------------ Check Data Types ------------------

print(f"\nType of name       : {type(name)}")
print(f"Type of age        : {type(age)}")
print(f"Type of department : {type(department)}")
print(f"Type of learning   : {type(learning)}")
print(f"Type of experience : {type(has_coded_before)}")
print(f"Type of goal       : {type(goal)}")