from decimal import Decimal
from app.db.database import SessionLocal
from app.models.order import Order
from app.orders.pricing_service import PricingService

db = SessionLocal()
ps = PricingService(db)
acme_orders = db.query(Order).filter(Order.shop_name == 'Acme Print Hub').all()

for o in acme_orders:
    if not o.documents:
        continue
    sub = Decimal("0.00")
    for d in o.documents:
        total = ps.calculate_document_total(d.page_count, d.copies, d.paper_size, d.print_type, d.print_side)
        d.document_total = total
        d.shop_price_per_page = Decimal("1.00")
        sub += total
    o.subtotal = sub
    o.platform_fee = o.platform_fee or Decimal("0.25")
    o.convenience_fee = o.convenience_fee or Decimal("0.25")
    o.priority_fee = o.priority_fee or Decimal("0.00")
    o.grand_total = o.subtotal + o.platform_fee + o.convenience_fee + o.priority_fee

db.commit()
print("Updated Acme orders cleanly:")
for o in acme_orders:
    print(f"Order {o.id}: phone={o.guest_phone}, docs={len(o.documents)}, total=₹{o.grand_total}")
