from app.models.department import Department

DEPARTMENTS = [
    {"name": "Artificial Intelligence and Data Science", "code": "AI&DS"},
    {"name": "Computer Science and Engineering", "code": "CSE"},
    {"name": "Information Technology", "code": "IT"},
    {"name": "Electronics and Communication Engineering", "code": "ECE"},
    {"name": "Electrical and Electronics Engineering", "code": "EEE"},
    {"name": "Mechanical Engineering", "code": "MECH"},
    {"name": "Civil Engineering", "code": "CIVIL"},
]


def seed_departments(db):
    for index, department in enumerate(DEPARTMENTS, start=1):
        exists = (
            db.query(Department)
            .filter(Department.code == department["code"])
            .first()
        )

        if not exists:
            db.add(
                Department(
                    name=department["name"],
                    code=department["code"],
                    display_order=index,
                )
            )

    db.commit()