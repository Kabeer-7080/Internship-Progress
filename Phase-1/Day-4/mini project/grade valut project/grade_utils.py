# grade_utils.py

PASS_CUTOFFS = (50, 75)


def get_status(score):
    if score >= PASS_CUTOFFS[1]:
        return "Distinction"
    elif score >= PASS_CUTOFFS[0]:
        return "Pass"
    else:
        return "Fail"


def add_student(students, name, subject, score):

    student = {
        "name": name,
        "subject": subject,
        "score": score,
        "status": get_status(score)
    }

    students.append(student)

    with open("grades_log.txt", "a") as file:
        file.write(f"{name} | {subject} | {score}\n")

    print(f"\n{name} added successfully!")


def list_students(students):

    print("\n===== Student Records =====\n")

    for student in students:

        print(f"Name    : {student['name']}")
        print(f"Subject : {student['subject']}")
        print(f"Score   : {student['score']}")
        print(f"Status  : {student['status']}")
        print("-" * 25)


def class_average(students):

    total = 0

    for student in students:
        total += student["score"]

    average = total / len(students)

    print(f"\nClass Average : {average:.2f}")


def top_scorer(students):

    top = max(students, key=lambda student: student["score"])

    print("\nTop Scorer\n")
    print(top)


def search_student(students, name):

    print("\nSearch Result\n")

    for student in students:

        if student["name"].lower() == name.lower():

            print(student)
            return

    print("Student not found.")


def unique_subjects(students):

    subjects = set()

    for student in students:
        subjects.add(student["subject"])

    print("\nUnique Subjects")
    print(subjects)