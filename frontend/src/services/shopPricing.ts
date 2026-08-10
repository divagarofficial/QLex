import type { PricingConfig, ServiceConfig } from "@/types/orders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://qlex-two.vercel.app";

export interface PlatformSettings {
  platform_fee: number;
  priority_fee: number;
  max_documents_per_order: number;
  max_upload_size_mb: number;
  max_pages_per_document: number;
  draft_expiry_hours: number;
  queue_timeout_minutes: number;
  allow_new_orders: boolean;
  maintenance_mode: boolean;
}

export interface UpdatePricingPayload {
  shop_price: number;
  is_active: boolean;
}

export interface UpdateServicePayload {
  description: string | null;
  price: number;
  display_order: number;
  is_active: boolean;
}

export interface UpdatePlatformSettingsPayload {
  platform_fee: number;
  priority_fee: number;
  max_documents_per_order?: number;
  max_upload_size_mb?: number;
  max_pages_per_document?: number;
  draft_expiry_hours?: number;
  queue_timeout_minutes?: number;
  allow_new_orders?: boolean;
  maintenance_mode?: boolean;
}

export interface PricingHistoryItem {
  id: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
}

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
    let msg = "Network request failed.";
    if (typeof errorBody.detail === "string") {
      msg = errorBody.detail;
    } else if (Array.isArray(errorBody.detail)) {
      msg = errorBody.detail
        .map((e: any) => `${e.loc?.join(".") || "field"}: ${e.msg || e.detail || JSON.stringify(e)}`)
        .join("; ");
    } else if (errorBody.message) {
      msg = errorBody.message;
    }
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Fetch all pricing rules (A4/A3, B&W/Colour, Single/Double)
 */
export async function fetchPricingConfigs(): Promise<PricingConfig[]> {
  const res = await fetch(`${API_BASE}/pricing`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await handleResponse<any[]>(res);
  return data.map((item) => ({
    ...item,
    shop_price: Number(item.shop_price),
    convenience_fee: Number(item.convenience_fee),
  }));
}

/**
 * Update individual pricing config rule
 */
export async function updatePricingConfig(
  pricingId: string,
  payload: UpdatePricingPayload
): Promise<PricingConfig> {
  const res = await fetch(`${API_BASE}/pricing/${pricingId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const item = await handleResponse<any>(res);
  return {
    ...item,
    shop_price: Number(item.shop_price),
    convenience_fee: Number(item.convenience_fee),
  };
}

/**
 * Fetch additional print services (bindings, etc.)
 */
export async function fetchServicesConfigs(): Promise<ServiceConfig[]> {
  const res = await fetch(`${API_BASE}/pricing/services`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await handleResponse<any[]>(res);
  return data.map((item) => ({
    ...item,
    price: Number(item.price),
  }));
}

/**
 * Update individual finishing service rule
 */
export async function updateServiceConfig(
  serviceId: string,
  payload: UpdateServicePayload
): Promise<ServiceConfig> {
  const res = await fetch(`${API_BASE}/pricing/services/${serviceId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const item = await handleResponse<any>(res);
  return {
    ...item,
    price: Number(item.price),
  };
}

/**
 * Fetch global platform settings (fees, order limits)
 */
export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  const res = await fetch(`${API_BASE}/admin/platform-settings`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const item = await handleResponse<any>(res);
  return {
    platform_fee: Number(item.platform_fee),
    priority_fee: Number(item.priority_fee),
    max_documents_per_order: item.max_documents_per_order,
    max_upload_size_mb: item.max_upload_size_mb,
    max_pages_per_document: item.max_pages_per_document,
    draft_expiry_hours: item.draft_expiry_hours,
    queue_timeout_minutes: item.queue_timeout_minutes,
    allow_new_orders: item.allow_new_orders,
    maintenance_mode: item.maintenance_mode,
  };
}

/**
 * Update platform settings
 */
export async function updatePlatformSettings(
  payload: UpdatePlatformSettingsPayload
): Promise<PlatformSettings> {
  const fullPayload = {
    platform_fee: payload.platform_fee,
    priority_fee: payload.priority_fee,
    max_documents_per_order: payload.max_documents_per_order ?? 20,
    max_upload_size_mb: payload.max_upload_size_mb ?? 50,
    max_pages_per_document: payload.max_pages_per_document ?? 1000,
    draft_expiry_hours: payload.draft_expiry_hours ?? 24,
    queue_timeout_minutes: payload.queue_timeout_minutes ?? 10,
    allow_new_orders: payload.allow_new_orders ?? true,
    maintenance_mode: payload.maintenance_mode ?? false,
  };

  const res = await fetch(`${API_BASE}/admin/platform-settings`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(fullPayload),
  });
  const item = await handleResponse<any>(res);
  return {
    platform_fee: Number(item.platform_fee),
    priority_fee: Number(item.priority_fee),
    max_documents_per_order: item.max_documents_per_order,
    max_upload_size_mb: item.max_upload_size_mb,
    max_pages_per_document: item.max_pages_per_document,
    draft_expiry_hours: item.draft_expiry_hours,
    queue_timeout_minutes: item.queue_timeout_minutes,
    allow_new_orders: item.allow_new_orders,
    maintenance_mode: item.maintenance_mode,
  };
}
