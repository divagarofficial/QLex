// ── Express Order API Service ──────────────────────────────────────────
// Handles public shop resolution, express no-login drafts, uploads, payments, and live tracking.

import type {
  UploadResponse,
  UpdateDocumentRequest,
  DocumentResponse,
  OrderSummaryResponse,
  CreatePaymentResponse,
} from "@/types/orders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://qlex-backend-ybnb435gbq-el.a.run.app";

export interface PublicShop {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  is_express_enabled: boolean;
  requires_account: boolean;
  operating_hours?: string | null;
}

export interface ShopRegisterInput {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  upi_id?: string;
  operating_hours?: string;
  is_express_enabled?: boolean;
  requires_account?: boolean;
  pin?: string;
}



export interface ExpressDraftResponse {
  order_id: string;
  shop_name: string;
  shop_slug: string;
  guest_phone: string;
  guest_name?: string | null;
  status: string;
  created_at: string;
}

export interface ExpressOrderStatusResponse {
  order_id: string;
  token_number?: string | null;
  queue_state?: string | null;
  status: string;
  payment_status: string;
  shop_name: string;
  shop_slug?: string | null;
  shop_address?: string | null;
  shop_phone?: string | null;
  estimated_wait_minutes?: number | null;
  guest_phone?: string | null;
  guest_name?: string | null;
  grand_total: number;
  documents_count: number;
  total_pages: number;
  created_at: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  token: string;
  queue_number: number;
  payment_status: string;
  order_status: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      detail: `Server error (${res.status}). Please try again.`,
    }));
    const message =
      errorBody.detail ||
      errorBody.message ||
      (Array.isArray(errorBody) ? errorBody.map((e: any) => e.msg).join(", ") : "An error occurred");
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return res.json();
}

/**
 * Fetch all publicly available shops
 */
export async function fetchPublicShops(): Promise<PublicShop[]> {
  const res = await fetch(`${API_BASE}/shops/public`);
  return handleResponse<PublicShop[]>(res);
}

/**
 * Fetch shop profile by slug (e.g. 'acme' or 'rit')
 */
export async function fetchPublicShopBySlug(slug: string): Promise<PublicShop> {
  const res = await fetch(`${API_BASE}/shops/public/${encodeURIComponent(slug)}`);
  return handleResponse<PublicShop>(res);
}

/**
 * Register a new shop in the multi-shop network
 */
export async function registerShop(payload: ShopRegisterInput): Promise<PublicShop> {
  const res = await fetch(`${API_BASE}/shops/public/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<PublicShop>(res);
}


/**
 * Create a guest express draft order (Mobile Number only, zero login required)
 */
export async function createExpressDraftOrder(payload: {
  phone: string;
  full_name?: string;
  shop_slug: string;
  is_priority?: boolean;
}): Promise<ExpressDraftResponse> {
  const res = await fetch(`${API_BASE}/orders/express/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<ExpressDraftResponse>(res);
}

/**
 * Upload files for an express guest order
 */
export async function uploadExpressDocuments(orderId: string, files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(`${API_BASE}/orders/express/${orderId}/documents`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<UploadResponse>(res);
}

/**
 * Update document print settings (color, copies, duplex, custom pages)
 */
export async function updateExpressDocumentSettings(
  orderId: string,
  documentId: string,
  data: UpdateDocumentRequest
): Promise<DocumentResponse> {
  const res = await fetch(`${API_BASE}/orders/express/${orderId}/documents/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<DocumentResponse>(res);
}

/**
 * Delete a document from the draft
 */
export async function deleteExpressDocument(orderId: string, documentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/express/${orderId}/documents/${documentId}`, {
    method: "DELETE",
  });
  await handleResponse<{ status: string }>(res);
}

/**
 * Get full calculated summary and bill breakdown
 */
export async function getExpressOrderSummary(orderId: string): Promise<OrderSummaryResponse> {
  const res = await fetch(`${API_BASE}/orders/express/${orderId}/summary`);
  return handleResponse<OrderSummaryResponse>(res);
}

/**
 * Confirm the express order before initiating payment
 */
export async function confirmExpressOrder(orderId: string): Promise<OrderSummaryResponse> {
  const res = await fetch(`${API_BASE}/orders/express/${orderId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<OrderSummaryResponse>(res);
}

/**
 * Create Razorpay payment intent for the express order
 */
export async function createExpressPayment(orderId: string): Promise<CreatePaymentResponse> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<CreatePaymentResponse>(res);
}

/**
 * Verify Razorpay payment signature and generate queue token
 */
export async function verifyExpressPayment(payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  const res = await fetch(`${API_BASE}/orders/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<VerifyPaymentResponse>(res);
}

/**
 * Get real-time status and token for guest pickup
 */
export async function getExpressOrderStatus(orderId: string): Promise<ExpressOrderStatusResponse> {
  const res = await fetch(`${API_BASE}/orders/express/${orderId}/status`);
  return handleResponse<ExpressOrderStatusResponse>(res);
}
