import {
  GeneralSettingsState,
  PlatformSettingsState,
  OrderSettingsState,
  NotificationSettingsState,
  SecuritySettingsState,
  IntegrationItem,
  AppearanceSettingsState,
  AdvancedSettingsState,
  AboutSectionState,
} from "@/components/admin/settings/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://qlex-two.vercel.app";

export interface BackendPlatformSettings {
  platform_fee: number;
  priority_fee: number;
  max_documents_per_order: number;
  max_upload_size_mb: number;
  max_pages_per_document: number;
  draft_expiry_hours: number;
  queue_timeout_minutes: number;
  allow_new_orders: boolean;
  maintenance_mode: boolean;

  general?: GeneralSettingsState;
  platform?: PlatformSettingsState;
  orders?: OrderSettingsState;
  notifications?: NotificationSettingsState;
  security?: SecuritySettingsState;
  integrations?: IntegrationItem[];
  appearance?: AppearanceSettingsState;
  advanced?: AdvancedSettingsState;
  about?: AboutSectionState;
}

export interface BackendServerHealth {
  status: string;
  database: string;
  timestamp: string;
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
    let msg = "Failed to communicate with platform settings API.";
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

/** Fetch platform settings from backend */
export async function getBackendPlatformSettings(): Promise<BackendPlatformSettings> {
  const res = await fetch(`${API_BASE_URL}/admin/platform-settings`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await handleResponse<any>(res);
  return {
    platform_fee: Number(data.platform_fee || 0),
    priority_fee: Number(data.priority_fee || 0),
    max_documents_per_order: Number(data.max_documents_per_order || 20),
    max_upload_size_mb: Number(data.max_upload_size_mb || 50),
    max_pages_per_document: Number(data.max_pages_per_document || 1000),
    draft_expiry_hours: Number(data.draft_expiry_hours || 24),
    queue_timeout_minutes: Number(data.queue_timeout_minutes || 10),
    allow_new_orders: Boolean(data.allow_new_orders),
    maintenance_mode: Boolean(data.maintenance_mode),
    general: data.general || undefined,
    platform: data.platform || undefined,
    orders: data.orders || undefined,
    notifications: data.notifications || undefined,
    security: data.security || undefined,
    integrations: data.integrations || undefined,
    appearance: data.appearance || undefined,
    advanced: data.advanced || undefined,
    about: data.about || undefined,
  };
}

/** Update platform settings on backend */
export async function updateBackendPlatformSettings(
  payload: BackendPlatformSettings
): Promise<BackendPlatformSettings> {
  const res = await fetch(`${API_BASE_URL}/admin/platform-settings`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<any>(res);
  return {
    platform_fee: Number(data.platform_fee || 0),
    priority_fee: Number(data.priority_fee || 0),
    max_documents_per_order: Number(data.max_documents_per_order || 20),
    max_upload_size_mb: Number(data.max_upload_size_mb || 50),
    max_pages_per_document: Number(data.max_pages_per_document || 1000),
    draft_expiry_hours: Number(data.draft_expiry_hours || 24),
    queue_timeout_minutes: Number(data.queue_timeout_minutes || 10),
    allow_new_orders: Boolean(data.allow_new_orders),
    maintenance_mode: Boolean(data.maintenance_mode),
    general: data.general || undefined,
    platform: data.platform || undefined,
    orders: data.orders || undefined,
    notifications: data.notifications || undefined,
    security: data.security || undefined,
    integrations: data.integrations || undefined,
    appearance: data.appearance || undefined,
    advanced: data.advanced || undefined,
    about: data.about || undefined,
  };
}

/** Test integration connection */
export async function testIntegrationConnectionApi(id: string): Promise<{ id: string; success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/admin/integrations/test-connection`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id }),
  });
  return handleResponse<any>(res);
}

/** Fetch server health */
export async function getServerHealthInfo(): Promise<BackendServerHealth> {
  const res = await fetch(`${API_BASE_URL}/admin/server-health`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return handleResponse<BackendServerHealth>(res);
}
