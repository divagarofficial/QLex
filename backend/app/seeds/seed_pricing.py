from decimal import Decimal

from sqlalchemy.orm import Session

from app.enums.paper_size import PaperSize
from app.enums.print_side import PrintSide
from app.enums.print_type import PrintType
from app.models.pricing import Pricing


PRICE_MAP = {

    # ======================
    # A4
    # ======================

    (PaperSize.A4, PrintType.BLACK_WHITE, PrintSide.SINGLE):
        (Decimal("2.00"), Decimal("0.50")),

    (PaperSize.A4, PrintType.BLACK_WHITE, PrintSide.DOUBLE):
        (Decimal("1.80"), Decimal("0.50")),

    (PaperSize.A4, PrintType.COLOUR, PrintSide.SINGLE):
        (Decimal("10.00"), Decimal("0.50")),

    (PaperSize.A4, PrintType.COLOUR, PrintSide.DOUBLE):
        (Decimal("9.00"), Decimal("0.50")),


    # ======================
    # A3
    # ======================

    (PaperSize.A3, PrintType.BLACK_WHITE, PrintSide.SINGLE):
        (Decimal("4.00"), Decimal("0.50")),

    (PaperSize.A3, PrintType.BLACK_WHITE, PrintSide.DOUBLE):
        (Decimal("3.80"), Decimal("0.50")),

    (PaperSize.A3, PrintType.COLOUR, PrintSide.SINGLE):
        (Decimal("20.00"), Decimal("0.50")),

    (PaperSize.A3, PrintType.COLOUR, PrintSide.DOUBLE):
        (Decimal("18.00"), Decimal("0.50")),
}


def seed_pricing(db: Session):

    for (paper_size, print_type, print_side), (
        shop_price,
        convenience_fee,
    ) in PRICE_MAP.items():

        exists = (
            db.query(Pricing)
            .filter(
                Pricing.paper_size == paper_size,
                Pricing.print_type == print_type,
                Pricing.print_side == print_side,
            )
            .first()
        )

        if exists:
            continue

        db.add(
            Pricing(
                paper_size=paper_size,
                print_type=print_type,
                print_side=print_side,
                shop_price=shop_price,
                convenience_fee=convenience_fee,
                is_active=True,
            )
        )

    db.commit()