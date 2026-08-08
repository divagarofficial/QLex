/**
 * Admin Settlements API Service
 * Interacts with FastAPI backend `/admin/settlements` and `/settlements` endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SettlementItem {
  id: string;
  settlement_date: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | string;
  generated_at: string;
  paid_at?: string | null;
  upi_reference?: string | null;
  notes?: string | null;
  
  // Financial Breakdown
  orders_count?: number;
  gross_sales?: number;
  printing_revenue?: number;
  platform_fee_deduction?: number;
  convenience_fee_deduction?: number;
  priority_fee_deduction?: number;
  tax?: number;
  net_settlement_amount?: number;

  // Shop Information
  shop_id?: string;
  shop_name?: string;
  owner_name?: string;
  bank_name?: string;
  account_number?: string;
  settlement_cycle?: string;
}

export interface CompleteSettlementPayload {
  upi_reference: string;
  notes?: string;
}

/** Helper fetcher with error handling */
async function fetchAdminApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `Failed to process request (Status: ${res.status})`;
    try {
      const errData = await res.json();
      if (errData?.detail) {
        errorMsg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

/** Parse and normalize settlement objects */
function normalizeSettlement(s: any): SettlementItem {
  return {
    id: String(s.id),
    settlement_date: String(s.settlement_date || ""),
    amount: Number(s.amount || 0),
    status: String(s.status || "pending").toLowerCase(),
    generated_at: String(s.generated_at || ""),
    paid_at: s.paid_at ? String(s.paid_at) : null,
    upi_reference: s.upi_reference || null,
    notes: s.notes || null,
    orders_count: Number(s.orders_count || 0),
    gross_sales: Number(s.gross_sales || s.amount || 0),
    printing_revenue: Number(s.printing_revenue || s.amount || 0),
    platform_fee_deduction: Number(s.platform_fee_deduction || 0),
    convenience_fee_deduction: Number(s.convenience_fee_deduction || 0),
    priority_fee_deduction: Number(s.priority_fee_deduction || 0),
    tax: Number(s.tax || 0),
    net_settlement_amount: Number(s.net_settlement_amount || s.amount || 0),
    shop_id: String(s.shop_id || "RIT_PRINT_SHOP"),
    shop_name: String(s.shop_name || "QLex Central Print Hub"),
    owner_name: String(s.owner_name || "RIT Central Admin"),
    bank_name: String(s.bank_name || "HDFC Bank Ltd."),
    account_number: String(s.account_number || "XXXX-XXXX-4821"),
    settlement_cycle: String(s.settlement_cycle || "Daily"),
  };
}

/** Fetch all settlements from backend */
export async function getAdminSettlements(): Promise<SettlementItem[]> {
  const data = await fetchAdminApi<{ settlements: any[] }>("/admin/settlements");
  const list = data.settlements || [];
  return list.map(normalizeSettlement);
}

/** Fetch single settlement by ID */
export async function getSettlementById(settlementId: string): Promise<SettlementItem> {
  const data = await fetchAdminApi<any>(`/admin/settlements/${settlementId}`);
  return normalizeSettlement(data);
}

/** Trigger generation of today's settlement */
export async function generateTodaySettlement(): Promise<SettlementItem> {
  const data = await fetchAdminApi<any>("/admin/settlements/generate", {
    method: "POST",
  });
  return normalizeSettlement(data);
}

/** Mark pending settlement as completed */
export async function completeSettlement(
  settlementId: string,
  payload: CompleteSettlementPayload
): Promise<SettlementItem> {
  const data = await fetchAdminApi<any>(`/admin/settlements/${settlementId}/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeSettlement(data);
}

/** Utility to convert ISO date strings or Date objects to IST (Asia/Kolkata) formatted string */
export function formatToIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "N/A";
  
  if (dateInput instanceof Date) {
    return dateInput.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  let str = String(dateInput).trim();
  if (!str) return "N/A";

  str = str.replace(" ", "T");

  // If timestamp explicitly contains UTC 'Z', parse with UTC offset
  if (str.endsWith("Z")) {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  // Otherwise, parse as local IST time
  const date = new Date(str);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Utility to generate and download statement TXT file */
export function downloadSettlementStatement(settlement: SettlementItem): void {
  const dateStr = settlement.settlement_date;
  const content = `===============================================================
                     QLEX MERCHANT FINANCIAL STATEMENT
===============================================================
Settlement ID       : ${settlement.id}
Settlement Date     : ${settlement.settlement_date}
Generated Time      : ${formatToIST(settlement.generated_at)}
Status              : ${settlement.status.toUpperCase()}
Payout Date         : ${formatToIST(settlement.paid_at)}
UPI Reference       : ${settlement.upi_reference || "N/A"}
---------------------------------------------------------------
SHOP INFORMATION
Shop ID             : ${settlement.shop_id || "SHOP-001"}
Shop Name           : ${settlement.shop_name || "QLex Central Print Hub"}
Merchant Owner      : ${settlement.owner_name || "RIT Central Admin"}
Bank Name           : ${settlement.bank_name || "HDFC Bank Ltd."}
Account Number      : ${settlement.account_number || "XXXX-XXXX-4821"}
Settlement Cycle    : ${settlement.settlement_cycle || "Daily"}
---------------------------------------------------------------
FINANCIAL BREAKDOWN (Orders Count: ${settlement.orders_count || 0})
Gross Student Payments    : ₹${(settlement.gross_sales || 0).toFixed(2)}
Shop Printing Revenue     : ₹${(settlement.printing_revenue || 0).toFixed(2)}
Platform Fee (Deduction) : ₹${(settlement.platform_fee_deduction || 0).toFixed(2)}
Convenience Fee           : ₹${(settlement.convenience_fee_deduction || 0).toFixed(2)}
Priority Fee              : ₹${(settlement.priority_fee_deduction || 0).toFixed(2)}
Taxes                     : ₹${(settlement.tax || 0).toFixed(2)}
---------------------------------------------------------------
NET SETTLEMENT PAYOUT     : ₹${(settlement.net_settlement_amount || settlement.amount).toFixed(2)}
===============================================================
This document is automatically generated by QLex Platform Finance (IST).
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `QLex_Settlement_${dateStr}_${settlement.id.slice(0, 8)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
