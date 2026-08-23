// ── Order API Service ─────────────────────────────────────────────
// All order, pricing, and payment APIs.
// No fake data, no hardcoded values.

import type {
  PricingConfig,
  ServiceConfig,
  DraftOrderResponse,
  CreateDraftOrderRequest,
  UploadResponse,
  UpdateDocumentRequest,
  DocumentResponse,
  OrderSummaryResponse,
  CreatePaymentResponse,
  WaitingRoomResponse,
  LiveQueueResponse,
} from "@/types/orders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://qlex-backend-ybnb435gbq-el.a.run.app";

// ── Waiting Room Session ──────────────────────────────────────────
let waitingRoomSession: string | null = null;

export function getWaitingRoomSession(): string | null {
  return waitingRoomSession;
}

export function setWaitingRoomSession(session: string | null) {
  waitingRoomSession = session;
}

export function clearWaitingRoomSession() {
  waitingRoomSession = null;
}

// ── Auth Token ────────────────────────────────────────────────────
function getAuthToken(): string {
  const stored = localStorage.getItem("qlex_token");
  if (!stored) throw new Error("Not authenticated");
  return stored;
}

// ── Request Helpers ───────────────────────────────────────────────
function headers(includeContentType = true): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${getAuthToken()}`,
  };
  if (includeContentType) {
    h["Content-Type"] = "application/json";
  }
  if (waitingRoomSession) {
    h["X-Waiting-Room-Session"] = waitingRoomSession;
  }
  return h;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      detail: "Network error. Please try again.",
    }));
    throw new Error(errorBody.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Waiting Room API ──────────────────────────────────────────────

export async function enterWaitingRoom(
  entryPoint: string = "new_order"
): Promise<WaitingRoomResponse> {
  const res = await fetch(`${API_BASE}/waiting-room/enter`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ entry_point: entryPoint }),
  });
  return handleResponse<WaitingRoomResponse>(res);
}

export async function checkWaitingRoomStatus(): Promise<WaitingRoomResponse> {
  const res = await fetch(`${API_BASE}/waiting-room/status`, {
    method: "GET",
    headers: headers(),
  });
  return handleResponse<WaitingRoomResponse>(res);
}

export async function leaveWaitingRoom(): Promise<void> {
  const res = await fetch(`${API_BASE}/waiting-room/leave`, {
    method: "POST",
    headers: headers(),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      detail: "Network error. Please try again.",
    }));
    throw new Error(errorBody.detail || `Request failed: ${res.status}`);
  }
}

// ── Pricing API ───────────────────────────────────────────────────

export async function fetchPricing(): Promise<PricingConfig[]> {
  const res = await fetch(`${API_BASE}/pricing`, {
    method: "GET",
    headers: headers(),
  });
  return handleResponse<PricingConfig[]>(res);
}

export async function fetchServices(): Promise<ServiceConfig[]> {
  const res = await fetch(`${API_BASE}/pricing/services`, {
    method: "GET",
    headers: headers(),
  });
  return handleResponse<ServiceConfig[]>(res);
}

export async function fetchPlatformFees(): Promise<{ platform_fee: number; priority_fee: number }> {
  const res = await fetch(`${API_BASE}/pricing/config`, {
    method: "GET",
    headers: headers(),
  });
  return handleResponse<{ platform_fee: number; priority_fee: number }>(res);
}

// ── Order API ─────────────────────────────────────────────────────

export async function createDraftOrder(
  is_priority: boolean = false
): Promise<DraftOrderResponse> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ is_priority } as CreateDraftOrderRequest),
  });
  return handleResponse<DraftOrderResponse>(res);
}

export async function getOrderSummary(
  orderId: string
): Promise<OrderSummaryResponse> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "GET",
    headers: headers(),
  });
  return handleResponse<OrderSummaryResponse>(res);
}

export async function confirmOrder(
  orderId: string,
  is_priority: boolean = false
): Promise<OrderSummaryResponse> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/confirm`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ is_priority }),
  });
  return handleResponse<OrderSummaryResponse>(res);
}

// ── Document Upload API ───────────────────────────────────────────

export async function uploadDocuments(
  orderId: string,
  files: File[]
): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const h: Record<string, string> = {
    Authorization: `Bearer ${getAuthToken()}`,
  };
  if (waitingRoomSession) {
    h["X-Waiting-Room-Session"] = waitingRoomSession;
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}/documents`, {
    method: "POST",
    headers: h,
    body: formData,
  });
  return handleResponse<UploadResponse>(res);
}

export async function updateDocumentSettings(
  orderId: string,
  documentId: string,
  settings: UpdateDocumentRequest
): Promise<DocumentResponse> {
  const res = await fetch(
    `${API_BASE}/orders/${orderId}/documents/${documentId}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(settings),
    }
  );
  return handleResponse<DocumentResponse>(res);
}

export async function deleteDocument(
  orderId: string,
  documentId: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${API_BASE}/orders/${orderId}/documents/${documentId}`,
    {
      method: "DELETE",
      headers: headers(),
    }
  );
  return handleResponse<{ success: boolean; message: string }>(res);
}

// ── Payment API ───────────────────────────────────────────────────

export async function createPayment(
  orderId: string
): Promise<CreatePaymentResponse> {
  const res = await fetch(
    `${API_BASE}/orders/${orderId}/payments/create`,
    {
      method: "POST",
      headers: headers(),
    }
  );
  return handleResponse<CreatePaymentResponse>(res);
}

export async function verifyPayment(
  data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
): Promise<{ success: boolean; payment_id: string; order_id: string; payment_status: string; order_status: string }> {
  const res = await fetch(`${API_BASE}/orders/verify`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── Live Queue API ────────────────────────────────────────────────

export async function fetchLiveQueue(): Promise<LiveQueueResponse> {
  const res = await fetch(`${API_BASE}/student/live-queue`, {
    method: "GET",
    headers: headers(),
  });
  return handleResponse<LiveQueueResponse>(res);
}
