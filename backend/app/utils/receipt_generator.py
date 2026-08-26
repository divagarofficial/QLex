import os
from datetime import datetime, timezone, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.graphics.shapes import Drawing, Rect, String, Circle, Group, Line

if os.path.exists("/data"):
    RECEIPTS_DIR = "/data/uploads/receipts"
elif os.path.exists("/tmp"):
    RECEIPTS_DIR = "/tmp/uploads/receipts"
else:
    RECEIPTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "receipts"))

try:
    os.makedirs(RECEIPTS_DIR, exist_ok=True)
except Exception:
    pass

# IST is UTC + 5:30
IST = timezone(timedelta(hours=5, minutes=30))


def format_datetime_ist(dt_val) -> str:
    """
    Converts a datetime object or ISO string to IST (UTC+5:30)
    and returns formatted string e.g. 'Aug 23, 2026, 08:43 PM'.
    """
    if dt_val is None:
        dt = datetime.now(timezone.utc)
    elif isinstance(dt_val, str):
        try:
            val_str = dt_val.replace("Z", "+00:00")
            dt = datetime.fromisoformat(val_str)
        except Exception:
            dt = datetime.now(timezone.utc)
    elif isinstance(dt_val, datetime):
        dt = dt_val
    else:
        dt = datetime.now(timezone.utc)

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    dt_ist = dt.astimezone(IST)
    return dt_ist.strftime("%b %d, %Y, %I:%M %p")


def generate_order_receipt_pdf(order, token_number: str = None, shop_name: str = "Print Hub") -> str:
    """
    Generates an official QLex PDF receipt 100% matching generateReceiptPDF.ts styling.
    """
    order_id_raw = str(getattr(order, "id", getattr(order, "order_id", "UNKNOWN")))
    short_id = order_id_raw[:8].upper()
    receipt_no = f"REC-{short_id}-2026"
    invoice_no = f"INV-{short_id}"
    file_name = f"QLex_Receipt_{receipt_no}.pdf"
    pdf_path = os.path.join(RECEIPTS_DIR, file_name)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=28,
        leftMargin=28,
        topMargin=28,
        bottomMargin=28
    )

    styles = getSampleStyleSheet()

    # Color Palette matching generateReceiptPDF.ts
    COLOR_NAVY = colors.HexColor('#0F172A')
    COLOR_AMBER = colors.HexColor('#F59E0B')
    COLOR_EMERALD = colors.HexColor('#10B981')
    COLOR_DEEP_EMERALD = colors.HexColor('#047857')
    COLOR_SLATE_700 = colors.HexColor('#334155')
    COLOR_SLATE_500 = colors.HexColor('#64748B')
    COLOR_SLATE_400 = colors.HexColor('#94A3B8')
    COLOR_BG = colors.HexColor('#F8FAFC')
    COLOR_BORDER = colors.HexColor('#E2E8F0')

    # Custom Paragraph Styles
    body_label = ParagraphStyle('BodyLabel', parent=styles['Normal'], fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#475569'), leading=11)
    body_val_bold = ParagraphStyle('BodyValBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, textColor=COLOR_NAVY, leading=11)
    body_val_amber = ParagraphStyle('BodyValAmber', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.HexColor('#D97706'), leading=11)
    body_val_emerald = ParagraphStyle('BodyValEmerald', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, textColor=COLOR_EMERALD, leading=11)

    table_header_style = ParagraphStyle('TH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, textColor=colors.white, leading=10)
    table_cell_style = ParagraphStyle('TC', parent=styles['Normal'], fontName='Helvetica', fontSize=8, textColor=COLOR_SLATE_700, leading=11)
    table_cell_bold = ParagraphStyle('TCB', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_NAVY, leading=11)

    elements = []

    # 1. Top Executive Banner Graphic
    banner_drawing = Drawing(538, 90)
    # Background Navy Container
    banner_drawing.add(Rect(0, 0, 538, 90, rx=4, ry=4, fillColor=COLOR_NAVY, strokeColor=None))
    # Top Amber Accent Bar
    banner_drawing.add(Rect(0, 86, 538, 4, fillColor=COLOR_AMBER, strokeColor=None))

    # Brand Logo Box
    banner_drawing.add(Rect(16, 20, 50, 50, rx=6, ry=6, fillColor=COLOR_AMBER, strokeColor=None))
    banner_drawing.add(String(41, 33, "Q", fontName="Helvetica-Bold", fontSize=32, textAnchor="middle", fillColor=COLOR_NAVY))

    # Title & Subtitles
    banner_drawing.add(String(78, 56, "MINDURA TECHNOLOGIES", fontName="Helvetica-Bold", fontSize=15, fillColor=colors.white))
    banner_drawing.add(String(78, 40, "QLex • Rajalakshmi Institute of Technology", fontName="Helvetica-Bold", fontSize=10, fillColor=COLOR_AMBER))
    banner_drawing.add(String(78, 26, "Central Campus Print & Digital Token Terminal", fontName="Helvetica", fontSize=8.5, fillColor=colors.HexColor('#CBD5E1')))

    # Status Badge (Top Right)
    banner_drawing.add(Rect(390, 42, 132, 26, rx=4, ry=4, fillColor=COLOR_EMERALD, strokeColor=None))
    banner_drawing.add(String(456, 56, "OFFICIAL RECEIPT", fontName="Helvetica-Bold", fontSize=9, textAnchor="middle", fillColor=colors.white))
    banner_drawing.add(String(456, 46, "PAYMENT CONFIRMED", fontName="Helvetica-Bold", fontSize=7, textAnchor="middle", fillColor=colors.HexColor('#DCFCE7')))

    elements.append(banner_drawing)
    elements.append(Spacer(1, 10))

    # Dates calculation formatted in IST (UTC+5:30)
    created_at = getattr(order, "created_at", None)
    created_str = format_datetime_ist(created_at)
    gen_str = format_datetime_ist(datetime.now(timezone.utc))

    # 2. Metadata 3-Column Grid
    target_hub_name = shop_name or getattr(order, "shop_name", None) or "QLex Central Print Hub"

    meta_col1 = [
        Paragraph("<font color='#64748B'><b>RECEIPT DETAILS</b></font>", body_label),
        Spacer(1, 4),
        Paragraph(f"Receipt No: <b>{receipt_no}</b>", body_val_bold),
        Paragraph(f"Invoice No: <b>{invoice_no}</b>", body_val_bold),
        Paragraph(f"Order ID: <b>{short_id}</b>", body_val_bold),
    ]

    raw_token = token_number if token_number else getattr(order, "token", None)
    if not raw_token or raw_token in ["Standard Queue", "Priority Queue"]:
        is_priority = bool(getattr(order, "is_priority", False))
        prefix = "S" if "Satellite" in target_hub_name else ("P" if is_priority else "R")
        order_id_str = str(getattr(order, "id", getattr(order, "order_id", "")))
        short_code = order_id_str[:4].upper() if order_id_str else "001"
        token_str = f"{prefix}-{short_code}"
    else:
        token_str = str(raw_token)

    if not token_str.startswith("Token #"):
        token_display = f"Token #{token_str}"
    else:
        token_display = token_str

    is_priority = bool(getattr(order, "is_priority", False))
    priority_label = "SATELLITE PRINT" if "Satellite" in target_hub_name else ('EXPRESS PRIORITY' if is_priority else 'Standard Print')

    meta_col2 = [
        Paragraph("<font color='#64748B'><b>QUEUE & TOKEN INFO</b></font>", body_label),
        Spacer(1, 4),
        Paragraph(f"Pickup Token: <font color='#D97706'><b>{token_display}</b></font>", body_val_amber),
        Paragraph(f"Queue Type: <b>{priority_label}</b>", body_val_bold),
        Paragraph(f"Order Date: <b>{created_str}</b>", body_val_bold),
    ]

    meta_col3 = [
        Paragraph("<font color='#64748B'><b>PICKUP & PAYMENT</b></font>", body_label),
        Spacer(1, 4),
        Paragraph(f"Pickup Location: <font color='#0F172A'><b>{target_hub_name}</b></font>", body_val_bold),
        Paragraph("Payment Status: <font color='#10B981'><b>PAID & CONFIRMED</b></font>", body_val_emerald),
        Paragraph(f"Generated: <b>{gen_str}</b>", body_label),
    ]

    grid_table = Table([[meta_col1, meta_col2, meta_col3]], colWidths=[175, 180, 183])
    grid_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))

    elements.append(grid_table)
    elements.append(Spacer(1, 12))

    # 3. Itemized Print Specifications Table Header
    elements.append(Paragraph("<b>ITEMIZED PRINT SPECIFICATIONS</b>", ParagraphStyle('H', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_NAVY)))
    elements.append(Spacer(1, 4))

    doc_headers = [
        Paragraph("#", table_header_style),
        Paragraph("DOCUMENT NAME & DESCRIPTION", table_header_style),
        Paragraph("PRINT SPECIFICATIONS", table_header_style),
        Paragraph("QTY / PAGES", table_header_style),
        Paragraph("TOTAL AMOUNT", ParagraphStyle('THRight', parent=table_header_style, alignment=2))
    ]

    table_rows = [doc_headers]

    documents = getattr(order, "documents", [])
    subtotal = float(getattr(order, "subtotal", 0.0))
    convenience_fee = float(getattr(order, "convenience_fee", 0.0))
    platform_fee = float(getattr(order, "platform_fee", 0.0))
    priority_fee = float(getattr(order, "priority_fee", 10.0 if is_priority else 0.0))
    printing_subtotal = subtotal + convenience_fee + platform_fee
    grand_total = float(getattr(order, "grand_total", printing_subtotal + priority_fee))

    total_fees_to_distribute = convenience_fee + platform_fee

    if documents:
        total_pages_in_pdf = 0
        for d in documents:
            if isinstance(d, dict):
                pgs = int(d.get("page_count") or d.get("total_pages") or 1) * int(d.get("copies") or 1)
            else:
                pgs = int(getattr(d, "page_count", 1) or getattr(d, "total_pages", 1) or 1) * int(getattr(d, "copies", 1) or 1)
            total_pages_in_pdf += pgs
        if total_pages_in_pdf <= 0:
            total_pages_in_pdf = 1

        for idx, d in enumerate(documents, start=1):
            if isinstance(d, dict):
                file_name_str = (
                    d.get("original_filename")
                    or d.get("file_name")
                    or d.get("filename")
                    or d.get("name")
                    or "Print Document"
                )
                paper_size = str(d.get("paper_size") or "A4")
                if hasattr(paper_size, "value"):
                    paper_size = paper_size.value
                is_color = bool(d.get("is_color"))
                is_duplex = bool(d.get("is_double_sided") or d.get("is_duplex"))
                copies = int(d.get("copies") or 1)
                pages = int(d.get("page_count") or d.get("total_pages") or 1)
                doc_raw_total = float(d.get("price") or d.get("document_total") or d.get("total_price") or 0.0)
            else:
                file_name_str = (
                    getattr(d, "original_filename", None)
                    or getattr(d, "file_name", None)
                    or getattr(d, "filename", None)
                    or getattr(d, "name", None)
                    or "Print Document"
                )
                paper_size = str(getattr(d, "paper_size", "A4"))
                if hasattr(paper_size, "value"):
                    paper_size = paper_size.value
                is_color = bool(getattr(d, "is_color", False))
                is_duplex = bool(getattr(d, "is_double_sided", False) or getattr(d, "is_duplex", False))
                copies = int(getattr(d, "copies", 1) or 1)
                pages = int(getattr(d, "page_count", 1) or getattr(d, "total_pages", 1) or 1)
                doc_raw_total = float(getattr(d, "price", 0.0) or getattr(d, "document_total", 0.0) or getattr(d, "total_price", 0.0) or 0.0)

            if doc_raw_total == 0.0 and len(documents) == 1:
                doc_raw_total = subtotal

            pgs = copies * pages
            share = (pgs / total_pages_in_pdf) * total_fees_to_distribute if total_pages_in_pdf > 0 else 0
            doc_total = doc_raw_total + share

            if len(file_name_str) > 38:
                file_name_str = file_name_str[:35] + "..."

            color_type = "Color" if is_color else "B&W"
            side_type = "Duplex" if is_duplex else "Single Sided"
            specs_str = f"{paper_size} • {color_type} • {side_type}"
            qty_str = f"{copies} copy • {pages} pgs" if copies == 1 else f"{copies} copies • {pages} pgs"

            table_rows.append([
                Paragraph(f"{idx:02d}", body_label),
                Paragraph(file_name_str, table_cell_bold),
                Paragraph(specs_str, table_cell_style),
                Paragraph(qty_str, table_cell_style),
                Paragraph(f"₹{doc_total:.2f}", ParagraphStyle('TCRight', parent=table_cell_bold, alignment=2))
            ])
    else:
        table_rows.append([
            Paragraph("01", body_label),
            Paragraph("Print Order Documents", table_cell_bold),
            Paragraph("A4 • B&W • Duplex", table_cell_style),
            Paragraph("1 copy • 1 pgs", table_cell_style),
            Paragraph(f"₹{printing_subtotal:.2f}", ParagraphStyle('TCRight', parent=table_cell_bold, alignment=2))
        ])

    doc_table = Table(table_rows, colWidths=[24, 180, 160, 94, 80])
    doc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_NAVY),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    elements.append(doc_table)
    elements.append(Spacer(1, 10))

    # 4. Financial Summary Card
    fin_rows = [
        [Paragraph("Printing Subtotal", body_val_bold), Paragraph(f"₹{printing_subtotal:.2f}", ParagraphStyle('FR', parent=body_val_bold, alignment=2))]
    ]
    if priority_fee > 0:
        fin_rows.append([Paragraph("Priority Queue Fee", body_label), Paragraph(f"₹{priority_fee:.2f}", ParagraphStyle('FR', parent=body_label, alignment=2))])

    fin_rows.append([
        Paragraph("<b>Grand Total Paid</b>", ParagraphStyle('GTL', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=COLOR_NAVY)),
        Paragraph(f"<b>₹{grand_total:.2f}</b>", ParagraphStyle('GTR', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, textColor=COLOR_DEEP_EMERALD, alignment=2))
    ])

    fin_table = Table(fin_rows, colWidths=[360, 178])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('LINEABOVE', (0, -1), (-1, -1), 0.8, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    elements.append(fin_table)
    elements.append(Spacer(1, 12))

    # 5. Dual Authorized Signatures Card Graphic
    sig_drawing = Drawing(538, 75)
    sig_drawing.add(Rect(0, 0, 538, 75, rx=4, ry=4, fillColor=COLOR_BG, strokeColor=COLOR_BORDER, strokeWidth=0.5))

    sig_drawing.add(String(12, 62, "DIGITALLY AUTHENTICATED & AUTHORIZED SIGNATORIES", fontName="Helvetica-Bold", fontSize=7.5, fillColor=COLOR_SLATE_500))

    # Left Signatory: THIRUMALAI D
    sig1_x = 110
    sig_drawing.add(String(sig1_x, 42, "Thirumalai D", fontName="Helvetica-BoldOblique", fontSize=12, textAnchor="middle", fillColor=COLOR_NAVY))
    sig_drawing.add(Line(sig1_x - 50, 36, sig1_x + 50, 36, strokeColor=COLOR_NAVY, strokeWidth=0.8))
    sig_drawing.add(String(sig1_x, 24, "THIRUMALAI D", fontName="Helvetica-Bold", fontSize=8.5, textAnchor="middle", fillColor=COLOR_NAVY))
    sig_drawing.add(String(sig1_x, 14, "Authorized Signatory", fontName="Helvetica", fontSize=7, textAnchor="middle", fillColor=COLOR_SLATE_500))
    sig_drawing.add(String(sig1_x, 6, "Mindura Technologies", fontName="Helvetica", fontSize=7, textAnchor="middle", fillColor=COLOR_SLATE_500))

    # Center Crest Seal
    center_x = 269
    sig_drawing.add(Circle(center_x, 34, 16, fillColor=COLOR_AMBER, strokeColor=None))
    sig_drawing.add(Circle(center_x, 34, 13.5, fillColor=COLOR_NAVY, strokeColor=None))
    sig_drawing.add(String(center_x, 33, "QLEX", fontName="Helvetica-Bold", fontSize=7, textAnchor="middle", fillColor=COLOR_AMBER))
    sig_drawing.add(String(center_x, 26, "VERIFIED", fontName="Helvetica-Bold", fontSize=4.5, textAnchor="middle", fillColor=colors.white))

    # Right Signatory: DIVAGAR E
    sig2_x = 428
    sig_drawing.add(String(sig2_x, 42, "Divagar E", fontName="Helvetica-BoldOblique", fontSize=12, textAnchor="middle", fillColor=COLOR_NAVY))
    sig_drawing.add(Line(sig2_x - 50, 36, sig2_x + 50, 36, strokeColor=COLOR_NAVY, strokeWidth=0.8))
    sig_drawing.add(String(sig2_x, 24, "DIVAGAR E", fontName="Helvetica-Bold", fontSize=8.5, textAnchor="middle", fillColor=COLOR_NAVY))
    sig_drawing.add(String(sig2_x, 14, "Authorized Signatory", fontName="Helvetica", fontSize=7, textAnchor="middle", fillColor=COLOR_SLATE_500))
    sig_drawing.add(String(sig2_x, 6, "Mindura Technologies", fontName="Helvetica", fontSize=7, textAnchor="middle", fillColor=COLOR_SLATE_500))

    elements.append(sig_drawing)
    elements.append(Spacer(1, 10))

    # 6. Barcode & Security Vector Graphic
    barcode_drawing = Drawing(538, 22)
    barcode_x = 180
    bar_pattern = [2, 1, 3, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 4, 1, 2]
    curr_x = barcode_x
    for idx, w in enumerate(bar_pattern):
        if idx % 2 == 0:
            barcode_drawing.add(Rect(curr_x, 8, w * 1.0, 12, fillColor=COLOR_NAVY, strokeColor=None))
        curr_x += w * 1.0 + 0.8
    barcode_drawing.add(String(269, 0, f"SEC-AUTH • {short_id} • QLEX-TERMINAL-2026", fontName="Courier-Bold", fontSize=6.5, textAnchor="middle", fillColor=COLOR_SLATE_500))

    elements.append(barcode_drawing)
    elements.append(Spacer(1, 8))

    # 7. Corporate Legal Footer
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=6))
    elements.append(Paragraph(
        f"Receipt Generated: {gen_str} • QLex • Rajalakshmi Institute of Technology",
        ParagraphStyle('F1', parent=styles['Normal'], fontName='Helvetica', fontSize=7, textColor=COLOR_SLATE_500, alignment=1)
    ))
    elements.append(Paragraph(
        "<b>© 2026 MINDURA TECHNOLOGIES. All rights reserved.</b>",
        ParagraphStyle('F2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, textColor=COLOR_SLATE_700, alignment=1)
    ))

    doc.build(elements)
    return pdf_path
