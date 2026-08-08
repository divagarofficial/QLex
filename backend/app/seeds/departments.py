from app.models.department import Department

DEPARTMENTS = [
    {"name": "Computer Science and Engineering", "code": "CSE"},
    {"name": "Artificial Intelligence and Data Science", "code": "AIDS"},
    {"name": "Computer Science and Engineering (Artificial Intelligence and Machine Learning)", "code": "CSE (AIML)"},
    {"name": "Computer Science and Business Systems", "code": "CSBS"},
    {"name": "Computer and Communication Engineering", "code": "CCE"},
    {"name": "Bio Technology", "code": "BIOTECH"},
    {"name": "Electronics and Communication Engineering", "code": "ECE"},
    {"name": "Electronics and Communication Engineering(VLSI)", "code": "ECE(VLSI)"},
    {"name": "Mechanical Engineering", "code": "MECH"},
]


def seed_departments(db):
    # Remove old departments not in the new list if any
    valid_codes = [d["code"] for d in DEPARTMENTS]
    db.query(Department).filter(Department.code.not_in(valid_codes)).delete(synchronize_session=False)

    for index, department in enumerate(DEPARTMENTS, start=1):
        existing = (
            db.query(Department)
            .filter(Department.code == department["code"])
            .first()
        )

        if not existing:
            db.add(
                Department(
                    name=department["name"],
                    code=department["code"],
                    display_order=index,
                    is_active=True,
                )
            )
        else:
            existing.name = department["name"]
            existing.display_order = index
            existing.is_active = True

    db.commit()