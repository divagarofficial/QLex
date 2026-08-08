from app.models.section import Section


SECTIONS = [chr(i) for i in range(ord("A"), ord("Z") + 1)]


def seed_sections(db):
    for section in SECTIONS:
        exists = (
            db.query(Section)
            .filter(Section.name == section)
            .first()
        )

        if not exists:
            db.add(
                Section(name=section)
            )

    db.commit()