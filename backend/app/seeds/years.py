from app.models.year import Year


def seed_years(db):
    for number in range(1, 5):
        exists = (
            db.query(Year)
            .filter(Year.year_number == number)
            .first()
        )

        if not exists:
            db.add(
                Year(
                    year_number=number,
                )
            )

    db.commit()