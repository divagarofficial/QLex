/**
 * Admin Dashboard API Service
 * Interacts with FastAPI backend `/admin/*` endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://qlex-backend-ybnb435gbq-el.a.run.app";

export interface AdminOverview {
  total_students: number;
  registered_shops: number;
  today_orders: number;
  active_orders: number;
  completed_orders_today: number;
  platform_revenue_today: number;
  platform_revenue_month: number;
  pending_settlements_amount: number;
  pending_settlements_count: number;
}

export interface AdminDashboardCounts {
  today_orders: number;
  today_revenue: number;
  waiting_orders: number;
  printing_orders: number;
  ready_orders: number;
  served_orders: number;
  waiting_room_students: number;
  active_sessions: number;
  server_status: string;
}

export interface RecentOrderItem {
  order_id: string;
  register_number: string;
  token?: string | null;
  shop_name: string;
  status: string;
  is_priority: boolean;
  grand_total: number;
  created_at: string;
}

export interface RecentPaymentItem {
  id: string;
  transaction_id: string;
  register_number: string;
  amount: number;
  gateway: string;
  status: string;
  created_at: string;
}

export interface AdminShopItem {
  shop_id: string;
  name: string;
  status: string;
  orders_today: number;
  orders_waiting: number;
  revenue_today: number;
  pending_settlement: number;
  health: string;
}


export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  created_at: string;
  unread: boolean;
}

export interface ServerHealth {
  status: string;
  database: string;
  timestamp: string;
}

export interface SettlementItem {
  id: string;
  settlement_date: string;
  amount: number;
  status: string;
  generated_at: string;
  paid_at?: string | null;
  upi_reference?: string | null;
  notes?: string | null;
}

/** Helper fetcher with error handling */
async function fetchAdminApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("qlex_admin_token") || localStorage.getItem("qlex_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  if (adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint} (Status: ${res.status})`);
  }

  return res.json();
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const data = await fetchAdminApi<any>("/admin/overview");
  return {
    total_students: Number(data.total_students || 0),
    registered_shops: Number(data.registered_shops || 0),
    today_orders: Number(data.today_orders || 0),
    active_orders: Number(data.active_orders || 0),
    completed_orders_today: Number(data.completed_orders_today || 0),
    platform_revenue_today: Number(data.platform_revenue_today || 0),
    platform_revenue_month: Number(data.platform_revenue_month || 0),
    pending_settlements_amount: Number(data.pending_settlements_amount || 0),
    pending_settlements_count: Number(data.pending_settlements_count || 0),
  };
}

export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const data = await fetchAdminApi<any>("/admin/dashboard");
  return {
    today_orders: Number(data.today_orders || 0),
    today_revenue: Number(data.today_revenue || 0),
    waiting_orders: Number(data.waiting_orders || 0),
    printing_orders: Number(data.printing_orders || 0),
    ready_orders: Number(data.ready_orders || 0),
    served_orders: Number(data.served_orders || 0),
    waiting_room_students: Number(data.waiting_room_students || 0),
    active_sessions: Number(data.active_sessions || 0),
    server_status: String(data.server_status || "HEALTHY"),
  };
}

export async function getRecentOrders(): Promise<RecentOrderItem[]> {
  const data = await fetchAdminApi<{ orders: any[] }>("/admin/recent-orders");
  return (data.orders || []).map((item) => ({
    ...item,
    grand_total: Number(item.grand_total || 0),
  }));
}

export async function getRecentPayments(): Promise<RecentPaymentItem[]> {
  const data = await fetchAdminApi<{ payments: any[] }>("/admin/recent-payments");
  return (data.payments || []).map((item) => ({
    ...item,
    amount: Number(item.amount || 0),
  }));
}

export interface AdminOrderItemFull {
  id: string;
  order_id: string;
  student_name: string;
  register_number: string;
  token?: string | null;
  shop_name: string;
  status: string;
  payment_status: string;
  is_priority: boolean;
  amount: number;
  final_amount: number;
  grand_total: number;
  created_at: string;
}

export interface AdminOrdersPaginatedResponse {
  orders: AdminOrderItemFull[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function getAdminOrdersPage(params: {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<AdminOrdersPaginatedResponse> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set("search", params.search);
  if (params.status) queryParams.set("status", params.status);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.page_size) queryParams.set("page_size", params.page_size.toString());

  const data = await fetchAdminApi<any>(`/admin/orders?${queryParams.toString()}`);
  return {
    orders: (data.orders || []).map((o: any) => ({
      id: String(o.id || o.order_id || ""),
      order_id: String(o.order_id || o.id || ""),
      student_name: String(o.student_name || "Student"),
      register_number: String(o.register_number || "N/A"),
      token: o.token ? String(o.token) : null,
      shop_name: String(o.shop_name || "QLex Central Print Hub"),
      status: String(o.status || "PENDING"),
      payment_status: String(o.payment_status || "PENDING"),
      is_priority: Boolean(o.is_priority),
      amount: Number(o.amount || 0),
      final_amount: Number(o.final_amount || o.grand_total || 0),
      grand_total: Number(o.grand_total || o.final_amount || 0),
      created_at: String(o.created_at || ""),
    })),
    total: Number(data.total || 0),
    page: Number(data.page || 1),
    page_size: Number(data.page_size || 12),
    total_pages: Number(data.total_pages || 1),
  };
}

export interface AdminPaymentItemFull {
  id: string;
  transaction_id: string;
  order_id?: string | null;
  user_name: string;
  register_number: string;
  amount: number;
  gateway: string;
  status: string;
  created_at: string;
}

export interface AdminPaymentsPaginatedResponse {
  payments: AdminPaymentItemFull[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function getAdminPaymentsPage(params: {
  search?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<AdminPaymentsPaginatedResponse> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set("search", params.search);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.page_size) queryParams.set("page_size", params.page_size.toString());

  const data = await fetchAdminApi<any>(`/admin/payments?${queryParams.toString()}`);
  return {
    payments: (data.payments || []).map((p: any) => ({
      id: String(p.id || ""),
      transaction_id: String(p.transaction_id || ""),
      order_id: p.order_id ? String(p.order_id) : null,
      user_name: String(p.user_name || "Student"),
      register_number: String(p.register_number || "N/A"),
      amount: Number(p.amount || 0),
      gateway: String(p.gateway || "Razorpay"),
      status: String(p.status || "PAID"),
      created_at: String(p.created_at || ""),
    })),
    total: Number(data.total || 0),
    page: Number(data.page || 1),
    page_size: Number(data.page_size || 12),
    total_pages: Number(data.total_pages || 1),
  };
}

export async function getRevenueHistory(): Promise<any> {
  return fetchAdminApi<any>("/admin/revenue/history");
}

export async function downloadAdminReportCsv(reportType: string, dateRange: string): Promise<void> {
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("qlex_admin_token") || localStorage.getItem("qlex_token") : null;
  const headers: Record<string, string> = {};
  if (adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  const url = `${API_BASE_URL}/admin/reports/export?report_type=${reportType}&date_range=${dateRange}`;
  const res = await fetch(url, { headers, cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to export report CSV (Status: ${res.status})`);
  }

  const blob = await res.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `QLex_${reportType.toUpperCase()}_Report_${dateRange}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

export async function getAdminShops(): Promise<AdminShopItem[]> {
  const data = await fetchAdminApi<{ shops: any[] }>("/admin/shops");
  return (data.shops || []).map((shop) => ({
    ...shop,
    revenue_today: Number(shop.revenue_today || 0),
    pending_settlement: Number(shop.pending_settlement || 0),
  }));
}

export async function getAdminNotifications(): Promise<AdminNotificationItem[]> {
  const data = await fetchAdminApi<{ notifications: any[] }>("/admin/notifications");
  return data.notifications || [];
}

export async function getPendingSettlementsList(): Promise<SettlementItem[]> {
  const data = await fetchAdminApi<{ settlements: any[] }>("/admin/settlements");
  return (data.settlements || []).map((s) => ({
    ...s,
    amount: Number(s.amount || 0),
  }));
}

export async function getServerHealth(): Promise<ServerHealth> {
  return fetchAdminApi<ServerHealth>("/admin/server-health");
}

export async function getWaitingRoomAdminMetrics(): Promise<any> {
  return fetchAdminApi<any>("/waiting-room/admin/metrics");
}

export async function adminAdmitNextWaitingUser(): Promise<any> {
  return fetchAdminApi<any>("/waiting-room/admin/admit-next", { method: "POST" });
}

export async function adminFlushExpiredSessions(): Promise<any> {
  return fetchAdminApi<any>("/waiting-room/admin/flush-expired", { method: "POST" });
}

// Alias exports for page compatibility
export const fetchAdminOverview = getAdminOverview;
export const fetchAdminRecentOrders = getRecentOrders;
export const fetchAdminRecentPayments = getRecentPayments;
export const fetchAdminShops = getAdminShops;



