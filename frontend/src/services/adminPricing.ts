/**
 * Admin Pricing API Service
 * Interacts with FastAPI backend `/pricing`, `/pricing/services`, and `/admin/platform-settings` endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://qlex-backend-ybnb435gbq-el.a.run.app";

export interface PricingRule {
  id: string;
  paper_size: "A4" | "A3" | string;
  print_type: "BW" | "COLOR" | string;
  print_side: "SINGLE" | "DOUBLE" | string;
  shop_price: number;
  convenience_fee: number;
  is_active: boolean;
}

export interface ServiceRule {
  id: string;
  name: string;
  description: string | null;
  price: number;
  display_order: number;
  is_active: boolean;
}

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

export interface AuditLogItem {
  id: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("qlex_admin_token") || localStorage.getItem("qlex_token")
      : null;
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
    let msg = "Failed to communicate with pricing API.";
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

/** Fetch all print pricing rules */
export async function getPricingRules(): Promise<PricingRule[]> {
  const res = await fetch(`${API_BASE_URL}/pricing`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await handleResponse<any[]>(res);
  return data.map((item) => ({
    id: String(item.id),
    paper_size: item.paper_size,
    print_type: item.print_type,
    print_side: item.print_side,
    shop_price: Number(item.shop_price || 0),
    convenience_fee: Number(item.convenience_fee || 0),
    is_active: Boolean(item.is_active),
  }));
}

/** Update single print pricing rule */
export async function updatePricingRule(
  pricingId: string,
  shopPrice: number,
  convenienceFee: number,
  isActive: boolean
): Promise<PricingRule> {
  const res = await fetch(`${API_BASE_URL}/pricing/${pricingId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      shop_price: shopPrice,
      convenience_fee: convenienceFee,
      is_active: isActive,
    }),
  });
  const item = await handleResponse<any>(res);
  return {
    id: String(item.id),
    paper_size: item.paper_size,
    print_type: item.print_type,
    print_side: item.print_side,
    shop_price: Number(item.shop_price || 0),
    convenience_fee: Number(item.convenience_fee || 0),
    is_active: Boolean(item.is_active),
  };
}

/** Fetch finishing services configs (bindings, etc.) */
export async function getServiceRules(): Promise<ServiceRule[]> {
  const res = await fetch(`${API_BASE_URL}/pricing/services`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await handleResponse<any[]>(res);
  return data.map((item) => ({
    id: String(item.id),
    name: String(item.name || ""),
    description: item.description ? String(item.description) : null,
    price: Number(item.price || 0),
    display_order: Number(item.display_order || 0),
    is_active: Boolean(item.is_active),
  }));
}

/** Update finishing service pricing rule */
export async function updateServiceRule(
  serviceId: string,
  price: number,
  isActive: boolean,
  description?: string | null,
  displayOrder?: number
): Promise<ServiceRule> {
  const res = await fetch(`${API_BASE_URL}/pricing/services/${serviceId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      price: price,
      is_active: isActive,
      description: description ?? null,
      display_order: displayOrder ?? 1,
    }),
  });
  const item = await handleResponse<any>(res);
  return {
    id: String(item.id),
    name: String(item.name || ""),
    description: item.description ? String(item.description) : null,
    price: Number(item.price || 0),
    display_order: Number(item.display_order || 0),
    is_active: Boolean(item.is_active),
  };
}

/** Fetch platform settings (fees, priority charges, limits) */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const res = await fetch(`${API_BASE_URL}/admin/platform-settings`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const item = await handleResponse<any>(res);
  return {
    platform_fee: Number(item.platform_fee || 0),
    priority_fee: Number(item.priority_fee || 0),
    max_documents_per_order: Number(item.max_documents_per_order || 20),
    max_upload_size_mb: Number(item.max_upload_size_mb || 50),
    max_pages_per_document: Number(item.max_pages_per_document || 1000),
    draft_expiry_hours: Number(item.draft_expiry_hours || 24),
    queue_timeout_minutes: Number(item.queue_timeout_minutes || 10),
    allow_new_orders: Boolean(item.allow_new_orders),
    maintenance_mode: Boolean(item.maintenance_mode),
  };
}

/** Update platform settings (fees, priority charges) */
export async function updatePlatformSettings(
  payload: Partial<PlatformSettings> & { platform_fee: number; priority_fee: number }
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

  const res = await fetch(`${API_BASE_URL}/admin/platform-settings`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(fullPayload),
  });
  const item = await handleResponse<any>(res);
  return {
    platform_fee: Number(item.platform_fee || 0),
    priority_fee: Number(item.priority_fee || 0),
    max_documents_per_order: Number(item.max_documents_per_order || 20),
    max_upload_size_mb: Number(item.max_upload_size_mb || 50),
    max_pages_per_document: Number(item.max_pages_per_document || 1000),
    draft_expiry_hours: Number(item.draft_expiry_hours || 24),
    queue_timeout_minutes: Number(item.queue_timeout_minutes || 10),
    allow_new_orders: Boolean(item.allow_new_orders),
    maintenance_mode: Boolean(item.maintenance_mode),
  };
}

// Alias export for page compatibility
export const fetchAdminPricing = getPricingRules;

