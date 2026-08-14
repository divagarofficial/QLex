/**
 * Utility functions for order pricing and fee calculations.
 */

export interface DocumentLike {
  document_total?: number;
  page_count?: number;
  copies?: number;
  [key: string]: any;
}

/**
 * Calculates the display price for a specific document, distributing platform and convenience fees
 * proportionally across documents based on total pages.
 * 
 * If fees are already included in doc.document_total (sum of doc.document_total matches total printing cost),
 * doc.document_total is returned as-is without double-adding fees.
 */
export function getDocumentDisplayPrice(
  doc: DocumentLike,
  documents: DocumentLike[],
  subtotal: number = 0,
  convenienceFee: number = 0,
  platformFee: number = 0,
  grandTotal?: number,
  priorityFee: number = 0
): number {
  const docBasePrice = Number(doc?.document_total || 0);
  if (!documents || documents.length === 0) return docBasePrice;

  // Total printing cost = base printing subtotal + convenience fee + platform fee
  let targetPrintingCost = Number(subtotal || 0) + Number(convenienceFee || 0) + Number(platformFee || 0);

  // Fallback to grandTotal - priorityFee if targetPrintingCost is 0
  if (targetPrintingCost <= 0 && grandTotal && grandTotal > 0) {
    targetPrintingCost = Math.max(0, Number(grandTotal) - Number(priorityFee || 0));
  }

  const sumDocTotals = documents.reduce((acc, d) => acc + Number(d.document_total || 0), 0);
  const remainingFees = Math.max(0, targetPrintingCost - sumDocTotals);

  if (remainingFees <= 0.001) {
    return docBasePrice;
  }

  const totalPages = documents.reduce(
    (sum, d) => sum + Number(d.page_count || 1) * Number(d.copies || 1),
    0
  ) || 1;

  const docPages = Number(doc.page_count || 1) * Number(doc.copies || 1);
  const feeShare = (docPages / totalPages) * remainingFees;

  return docBasePrice + feeShare;
}
