// ── Student Dashboard Types ──────────────────────────────────────
// Exact field names and types from backend schemas.

export interface MyTokenResponse {
  token: string;
  status: string;
  estimated_wait_minutes: number;
  estimated_completion_time?: string | null;
  shop_name?: string | null;
  is_priority: boolean;
  order_id?: string | null;
  queue_number?: number | null;
  students_ahead?: number | null;
  currently_printing?: string | null;
  created_at?: string | null;
}

export interface LiveQueueEntry {
  currently_printing: string | null;
  priority_queue: string[];
  regular_queue: string[];
}

export interface LiveQueueResponse {
  currently_printing: string | null;
  priority_queue: string[];
  regular_queue: string[];
}

export interface MyOrderItem {
  order_id: string;
  token: string | null;
  status: string;
  payment_status: string;
  total_amount: number;
  documents: number;
  created_at: string;
  is_priority?: boolean;
  shop_name?: string | null;
  estimated_wait_minutes?: number;
  estimated_completion_time?: string | null;
}

export interface MyOrdersResponse {
  orders: MyOrderItem[];
}

export interface PaymentItem {
  payment_id: string;
  order_id: string;
  token: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
}

export interface PaymentsResponse {
  payments: PaymentItem[];
}

// ── Order Details Types ─────────────────────────────────────────

export interface OrderDocumentResponse {
  id: string;
  file_name: string;
  copies: number;
  page_count: number;
  custom_pages?: string | null;
  printable_page_count?: number;
  paper_size: string;
  print_type: string;
  print_side: string;
  document_total: number;
}

export interface OrderDetailsResponse {
  order_id: string;
  token: string | null;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal?: number;
  convenience_fee?: number;
  platform_fee?: number;
  priority_fee?: number;
  is_priority: boolean;
  shop_name?: string;
  created_at: string;
  estimated_wait_minutes?: number;
  estimated_completion_time?: string | null;
  documents: OrderDocumentResponse[];
}

// ── Waiting Room Types ───────────────────────────────────────────

export interface WaitingRoomResponse {
  allowed: boolean;
  status: string;
  session_token: string | null;
  expires_at: string | null;
  position: number | null;
  estimated_wait_seconds: number | null;
  poll_after_seconds: number | null;
  traffic_level?: "LOW" | "NORMAL" | "HIGH" | "SURGE" | null;
  total_waiting_count?: number | null;
  active_sessions_count?: number | null;
  server_load_percentage?: number | null;
}
