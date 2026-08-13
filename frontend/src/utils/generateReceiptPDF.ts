import jsPDF from "jspdf";
import type { MyOrderItem, OrderDetailsResponse, OrderDocumentResponse } from "@/types/student";

interface ReceiptPDFInput {
  order: MyOrderItem;
  details?: OrderDetailsResponse | null;
}

export function generateReceiptPDF({ order, details }: ReceiptPDFInput): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const receiptNo = `REC-${order.order_id.slice(0, 8).toUpperCase()}-2026`;
  const invoiceNo = `INV-${order.order_id.slice(0, 8).toUpperCase()}`;

  const createdDateStr = order.created_at
    ? new Date(order.created_at).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN");

  const generatedDateStr = new Date().toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const grandTotal = Number(details?.total_amount ?? order.total_amount) || 0;

  // 1. Calculate Document Subtotal & Document List
  let docsList: OrderDocumentResponse[] = [];
  let rawSubtotal = 0;

  if (details?.documents && details.documents.length > 0) {
    docsList = details.documents;
    rawSubtotal = docsList.reduce((acc, item) => acc + (Number(item.document_total) || 0), 0);
  } else if (typeof details?.subtotal === "number" && details.subtotal > 0) {
    rawSubtotal = Number(details.subtotal);
  }

  // 2. Fees
  const convenienceFee = Number(details?.convenience_fee) || 0;
  const platformFee = Number(details?.platform_fee) || 0;
  const priorityFee = Number(details?.priority_fee) || (order.is_priority ? 10.0 : 0);

  // 3. Convenience fee and platform fee merged directly into printing subtotal
  let printingSubtotal = rawSubtotal + convenienceFee + platformFee;

  if (printingSubtotal <= 0) {
    printingSubtotal = Math.max(0, grandTotal - priorityFee);
  }

  if (docsList.length === 0) {
    docsList = [
      {
        id: order.order_id,
        file_name: `Print Order (${order.documents || 1} Document${(order.documents || 1) > 1 ? "s" : ""})`,
        copies: 1,
        page_count: 1,
        paper_size: "A4",
        print_type: "Black & White",
        print_side: "Double Sided",
        document_total: printingSubtotal,
      },
    ];
  } else {
    const totalFeesToDistribute = convenienceFee + platformFee;
    if (totalFeesToDistribute > 0) {
      const totalPagesInPdf = docsList.reduce(
        (acc, d) => acc + Number(d.page_count || 1) * Number(d.copies || 1),
        0
      ) || 1;

      docsList = docsList.map((d) => {
        const pgs = Number(d.page_count || 1) * Number(d.copies || 1);
        const share = (pgs / totalPagesInPdf) * totalFeesToDistribute;
        return {
          ...d,
          document_total: (Number(d.document_total) || 0) + share,
        };
      });
    }
  }

  // Exact precision adjustment
  const feesTotal = priorityFee;
  if (Math.abs(printingSubtotal + feesTotal - grandTotal) > 0.01 && grandTotal > 0) {
    printingSubtotal = grandTotal - feesTotal;
  }

  // ── Outer Frame Border ───────────────────────────────────────────────────
  doc.setDrawColor(15, 23, 42); // Midnight Slate
  doc.setLineWidth(0.6);
  doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - (margin - 2) * 2);

  doc.setDrawColor(245, 158, 11); // Amber inner accent line
  doc.setLineWidth(0.2);
  doc.rect(margin - 1, margin - 1, contentWidth + 2, pageHeight - (margin - 1) * 2);

  // ── 1. Top Executive Banner ────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // Deep Slate Navy (#0F172A)
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");

  // Top Amber Gold Line
  doc.setFillColor(245, 158, 11);
  doc.rect(margin, y, contentWidth, 2, "F");

  // Brand Badge
  doc.setFillColor(245, 158, 11); // Amber square
  doc.roundedRect(margin + 6, y + 6, 20, 20, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text("Q", margin + 16, y + 20, { align: "center" });

  // Company Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14.5);
  doc.text("MINDURA TECHNOLOGIES", margin + 31, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(245, 158, 11); // Amber accent
  doc.text("QLex • Rajalakshmi Institute of Technology", margin + 31, y + 18.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text("Central Campus Print & Digital Token Terminal", margin + 31, y + 24.5);

  // Status Badge (Top Right)
  doc.setFillColor(16, 185, 129); // Emerald (#10B981)
  doc.roundedRect(margin + contentWidth - 36, y + 8, 30, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("OFFICIAL RECEIPT", margin + contentWidth - 21, y + 14.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text("PAYMENT CONFIRMED", margin + contentWidth - 21, y + 24.5, { align: "center" });

  y += 38;

  // ── 2. Clean Metadata 3-Card Grid ──────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "FD");

  doc.setFontSize(7.5);

  // Column 1: Receipt Details
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("RECEIPT DETAILS", margin + 6, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Receipt No:", margin + 6, y + 14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(receiptNo, margin + 26, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Invoice No:", margin + 6, y + 21);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(invoiceNo, margin + 26, y + 21);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Order ID:", margin + 6, y + 28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(order.order_id, margin + 26, y + 28);

  // Column 2: Queue & Token Info
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("QUEUE & TOKEN INFO", margin + 70, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Pickup Token:", margin + 70, y + 14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(217, 119, 6); // Amber
  doc.text(order.token ? `Token #${order.token}` : "Standard Queue", margin + 94, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Priority Level:", margin + 70, y + 21);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(order.is_priority ? 217 : 71, order.is_priority ? 119 : 85, order.is_priority ? 6 : 105);
  doc.text(order.is_priority ? "EXPRESS PRIORITY" : "Standard Print", margin + 94, y + 21);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Order Date:", margin + 70, y + 28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(createdDateStr, margin + 94, y + 28);

  // Column 3: Payment Status
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("PAYMENT STATUS", margin + 135, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Gateway:", margin + 135, y + 14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Razorpay UPI / Card", margin + 155, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Status:", margin + 135, y + 21);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text("PAID & CONFIRMED", margin + 155, y + 21);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Generated:", margin + 135, y + 28);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(generatedDateStr, margin + 155, y + 28);

  y += 44;

  // ── 3. Itemized Document Table ─────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("ITEMIZED PRINT SPECIFICATIONS", margin, y);
  y += 4;

  // Table Header Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("#", margin + 4, y + 5.5);
  doc.text("DOCUMENT NAME & DESCRIPTION", margin + 12, y + 5.5);
  doc.text("PRINT SPECIFICATIONS", margin + 90, y + 5.5);
  doc.text("QTY / PAGES", margin + 140, y + 5.5);
  doc.text("TOTAL AMOUNT", margin + contentWidth - 4, y + 5.5, { align: "right" });

  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  docsList.forEach((docItem, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 10, "F");
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 10, margin + contentWidth, y + 10);

    // Number
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(String(idx + 1).padStart(2, "0"), margin + 4, y + 6);

    // File name
    let fileNameStr = docItem.file_name || "Print Document";
    if (fileNameStr.length > 40) {
      fileNameStr = fileNameStr.substring(0, 37) + "...";
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(fileNameStr, margin + 12, y + 6);

    // Specs
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const optsStr = `${docItem.paper_size || "A4"} • ${docItem.print_type || "B&W"} • ${docItem.print_side || "Duplex"}`;
    doc.text(optsStr, margin + 90, y + 6);

    // Qty
    const qtyStr = `${docItem.copies || 1} copy • ${docItem.page_count || 1} pgs`;
    doc.text(qtyStr, margin + 140, y + 6);

    // Amount
    const itemTotal = Number(docItem.document_total) || printingSubtotal;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`₹${itemTotal.toFixed(2)}`, margin + contentWidth - 4, y + 6, {
      align: "right",
    });

    y += 10;
  });

  y += 6;

  // ── 4. Financial Summary Card ──────────────────────────────────────────────
  const summaryLines: { label: string; amount: number }[] = [
    { label: "Printing Subtotal", amount: printingSubtotal },
  ];

  if (priorityFee > 0) {
    summaryLines.push({ label: "Priority Queue Fee", amount: priorityFee });
  }

  const boxHeight = summaryLines.length * 6 + 18;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2.5, 2.5, "FD");

  doc.setFontSize(8.5);

  let summaryY = y + 7;

  summaryLines.forEach((item, index) => {
    if (index === 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
    }
    doc.text(item.label, margin + 6, summaryY);
    doc.text(`₹${item.amount.toFixed(2)}`, margin + contentWidth - 6, summaryY, {
      align: "right",
    });
    summaryY += 6;
  });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 4, summaryY - 2, margin + contentWidth - 6, summaryY - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total Paid", margin + 6, summaryY + 3);

  doc.setTextColor(4, 120, 87); // Deep Emerald
  doc.setFontSize(12);
  doc.text(`₹${grandTotal.toFixed(2)}`, margin + contentWidth - 6, summaryY + 3, {
    align: "right",
  });

  y += boxHeight + 10;

  // ── 5. Dual Authorized Signatures Card (THIRUMALAI D & DIVAGAR E) ──────────
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "FD");

  // Section Header Inside Signature Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("DIGITALLY AUTHENTICATED & AUTHORIZED SIGNATORIES", margin + 6, y + 6);

  // Left Signatory: THIRUMALAI D
  const sig1X = margin + 35;
  const sigY = y + 10;

  // Digital Signature Graphic Text for Thirumalai D
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Thirumalai D", sig1X, sigY + 9, { align: "center" });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(sig1X - 25, sigY + 13, sig1X + 25, sigY + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("THIRUMALAI D", sig1X, sigY + 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signatory", sig1X, sigY + 22, { align: "center" });
  doc.text("Mindura Technologies", sig1X, sigY + 25.5, { align: "center" });

  // Center Verification Seal Crest
  const centerSealX = margin + contentWidth / 2;
  const centerSealY = y + 21;

  doc.setFillColor(245, 158, 11);
  doc.circle(centerSealX, centerSealY, 8, "F");

  doc.setFillColor(15, 23, 42);
  doc.circle(centerSealX, centerSealY, 6.8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(245, 158, 11);
  doc.text("QLEX", centerSealX, centerSealY - 0.5, { align: "center" });
  doc.setFontSize(4.5);
  doc.setTextColor(255, 255, 255);
  doc.text("VERIFIED", centerSealX, centerSealY + 3, { align: "center" });

  // Right Signatory: DIVAGAR E
  const sig2X = margin + contentWidth - 35;

  // Digital Signature Graphic Text for Divagar E
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Divagar E", sig2X, sigY + 9, { align: "center" });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(sig2X - 25, sigY + 13, sig2X + 25, sigY + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("DIVAGAR E", sig2X, sigY + 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signatory", sig2X, sigY + 22, { align: "center" });
  doc.text("Mindura Technologies", sig2X, sigY + 25.5, { align: "center" });

  y += 44;

  // ── 6. Corporate Legal Footer ──────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Receipt Generated: ${generatedDateStr} • QLex • Rajalakshmi Institute of Technology`,
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "© 2026 MINDURA TECHNOLOGIES. All rights reserved.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // Save the PDF file
  const filename = `QLex_Receipt_${receiptNo}.pdf`;
  doc.save(filename);
}
