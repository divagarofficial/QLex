import type {
  TodayOrderItem,
  ShopOrderDetails,
  TodayRevenue,
  SettlementItem,
  LiveQueueSummary,
  QueueStateResponse,
  ActiveShopOrder,
} from "@/types/shop";
import type { OrderSummaryResponse } from "@/types/orders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://qlex-backend-ybnb435gbq-el.a.run.app";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      detail: `Request failed with status ${res.status}`,
    }));
    throw new Error(errorBody.detail || errorBody.message || "Network request failed.");
  }
  return res.json();
}

/**
 * Fetch today's queued orders for the shop
 */
export async function fetchTodaysOrders(shopName?: string): Promise<TodayOrderItem[]> {
  const url = shopName
    ? `${API_BASE}/shop/orders/today?shop_name=${encodeURIComponent(shopName)}`
    : `${API_BASE}/shop/orders/today`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<TodayOrderItem[]>(res);
}

/**
 * Fetch detailed specification for a specific order
 */
export async function fetchOrderDetails(orderId: string): Promise<ShopOrderDetails> {
  const res = await fetch(`${API_BASE}/shop/orders/${orderId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<ShopOrderDetails>(res);
}

/**
 * Mark order as PRINTING / Trigger document print
 */
export async function printShopOrder(orderId: string): Promise<QueueStateResponse> {
  const res = await fetch(`${API_BASE}/shop/orders/${orderId}/print`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<QueueStateResponse>(res);
}

/**
 * Mark order as READY (Ready for Pickup)
 */
export async function markOrderReady(orderId: string): Promise<QueueStateResponse> {
  const res = await fetch(`${API_BASE}/shop/orders/${orderId}/ready`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<QueueStateResponse>(res);
}

/**
 * Mark order as SERVED (completed)
 */
export async function serveShopOrder(orderId: string): Promise<QueueStateResponse> {
  const res = await fetch(`${API_BASE}/shop/orders/${orderId}/serve`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<QueueStateResponse>(res);
}

/**
 * Mark order as SERVED directly from any active state (WAITING/PRINTING/READY).
 * Called when operator clicks Print — order exits queue immediately.
 */
export async function markOrderServed(orderId: string): Promise<QueueStateResponse> {
  const res = await fetch(`${API_BASE}/shop/orders/${orderId}/mark-served`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<QueueStateResponse>(res);
}

/**
 * Reject order
 */
export async function rejectShopOrder(orderId: string, reason?: string): Promise<QueueStateResponse> {
  const res = await fetch(`${API_BASE}/shop/orders/${orderId}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason: reason || null }),
  });
  return handleResponse<QueueStateResponse>(res);
}

/**
 * Fetch today's shop revenue summary
 */
export async function fetchTodayRevenue(shopName?: string): Promise<TodayRevenue> {
  const url = shopName
    ? `${API_BASE}/shop/revenue/today?shop_name=${encodeURIComponent(shopName)}`
    : `${API_BASE}/shop/revenue/today`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<TodayRevenue>(res);
}

/**
 * Fetch pending settlements for the shop
 */
export async function fetchPendingSettlements(): Promise<SettlementItem[]> {
  const res = await fetch(`${API_BASE}/settlements/pending`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<SettlementItem[]>(res);
}

/**
 * Fetch historical settlements for the shop
 */
export async function fetchSettlementHistory(): Promise<SettlementItem[]> {
  const res = await fetch(`${API_BASE}/settlements/history`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<SettlementItem[]>(res);
}

/**
 * Fetch a specific settlement by ID
 */
export async function fetchSettlementById(settlementId: string): Promise<SettlementItem> {
  const res = await fetch(`${API_BASE}/settlements/${settlementId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<SettlementItem>(res);
}

/**
 * Generate today's settlement
 */
export async function generateTodaySettlement(): Promise<SettlementItem> {
  const res = await fetch(`${API_BASE}/settlements/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<SettlementItem>(res);
}

/**
 * Generate UPI payment details for a settlement
 */
export async function generateUpiPayment(settlementId: string): Promise<{
  upi_id: string;
  payee_name: string;
  amount: number;
  reference: string;
}> {
  const res = await fetch(`${API_BASE}/settlements/${settlementId}/generate-upi`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<{
    upi_id: string;
    payee_name: string;
    amount: number;
    reference: string;
  }>(res);
}

/**
 * Complete a settlement
 */
export async function completeSettlement(settlementId: string): Promise<SettlementItem> {
  const res = await fetch(`${API_BASE}/settlements/${settlementId}/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<SettlementItem>(res);
}

/**
 * Fetch live queue summary (currently printing, priority queue, regular queue)
 */
export async function fetchLiveQueueSummary(): Promise<LiveQueueSummary> {
  const res = await fetch(`${API_BASE}/student/live-queue`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<LiveQueueSummary>(res);
}

/**
 * Fetch all active shop orders
 */
export async function fetchActiveShopOrders(): Promise<ActiveShopOrder[]> {
  const res = await fetch(`${API_BASE}/shop/orders`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<ActiveShopOrder[]>(res);
}

/**
 * Fetch complete order summary (including documents, totals, statuses)
 */
export async function fetchOrderSummary(orderId: string): Promise<OrderSummaryResponse> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<OrderSummaryResponse>(res);
}

export interface PrinterTelemetry {
  printer_name: string;
  status: string;
  black_toner?: number | null;
  cyan_ink?: number | null;
  magenta_ink?: number | null;
  yellow_ink?: number | null;
  paper_a4_status?: string;
  paper_a3_status?: string;
  is_low_ink?: boolean;
  is_paper_jam?: boolean;
}

export interface PrintAgentHealth {
  status: string;
  is_connected: boolean;
  shop_name?: string;
  terminal_location?: string;
  last_seen: string;
  active_printers: (string | PrinterTelemetry)[];
}

/**
 * Fetch live connectivity status of shop Print Agent
 */
export async function fetchPrintAgentHealth(shopName?: string): Promise<PrintAgentHealth> {
  const url = shopName
    ? `${API_BASE}/shop/print-agent/health?shop_name=${encodeURIComponent(shopName)}`
    : `${API_BASE}/shop/print-agent/health`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<PrintAgentHealth>(res);
}


