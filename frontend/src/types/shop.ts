// ── Shop Dashboard TypeScript Interfaces ─────────────────────────────

export type QueueState = "WAITING" | "PENDING" | "ACCEPTED" | "PRINTING" | "READY" | "READY_FOR_PICKUP" | "SERVED" | "COMPLETED" | "REJECTED" | "CANCELLED";

export interface TodayOrderItem {
  token: string;
  order_id: string;
  student_id: string;
  student_name?: string;
  register_number?: string;
  assigned_printer?: string;
  documents?: number;
  is_priority: boolean;
  queue_state: QueueState;
  is_current: boolean;
  created_at?: string;
  grand_total?: number;
  payment_status?: string;
  document_count?: number;
  total_pages?: number;
  paper_size?: string;
  color_mode?: string;
  duplex_mode?: string;
  estimated_wait_minutes?: number;
  estimated_completion_time?: string | null;
}

export interface ShopDocumentService {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ShopDocumentItem {
  id: string;
  original_filename: string;
  stored_filename?: string | null;
  page_count: number;
  copies: number;
  print_type: "BLACK_AND_WHITE" | "COLOR" | "BLACK_WHITE";
  paper_size: "A4" | "A3" | string;
  print_side: "SINGLE" | "DOUBLE" | string;
  document_total: number;
  url?: string | null;
  services?: ShopDocumentService[];
}

export interface ShopOrderDetails {
  order_id: string;
  student_id: string;
  student_name?: string;
  register_number?: string;
  assigned_printer?: string;
  token: string;
  status?: string;
  queue_state?: string;
  payment_status?: string;
  is_priority: boolean;
  subtotal?: number;
  convenience_fee?: number;
  platform_fee?: number;
  priority_fee?: number;
  grand_total: number;
  estimated_wait_minutes?: number;
  estimated_completion_time?: string | null;
  documents: ShopDocumentItem[];
}

export interface TodayRevenue {
  total_orders: number;
  total_revenue: number;
}

export interface SettlementItem {
  id: string;
  settlement_date: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "PAID" | "FAILED" | "CANCELLED" | string;
  generated_at: string;
  paid_at?: string | null;
  upi_reference?: string | null;
  notes?: string | null;
  orders_count?: number | null;
  gross_sales?: number | null;
  printing_revenue?: number | null;
  platform_fee_deduction?: number | null;
  convenience_fee_deduction?: number | null;
  priority_fee_deduction?: number | null;
  tax?: number | null;
  net_settlement_amount?: number | null;
}

export interface LiveQueueSummary {
  currently_printing: string | null;
  priority_queue: string[];
  regular_queue: string[];
}

export interface QueueStateResponse {
  order_id: string;
  token: string;
  queue_state: QueueState;
  is_current: boolean;
}

export interface ActiveShopOrder {
  id: string;
  student_id?: string;
  status: string;
  student_name?: string;
  register_number?: string;
  assigned_printer?: string;
  payment_status?: string;
  token?: string;
  queue_state?: string;
  grand_total: number;
  is_priority: boolean;
  created_at: string;
  estimated_wait_minutes?: number;
  estimated_completion_time?: string | null;
  documents?: DetailedOrderDocument[];
  document_count?: number;
  total_pages?: number;
}

export interface DetailedOrderDocument {
  id: string;
  original_filename: string;
  stored_filename?: string | null;
  page_count: number;
  copies: number;
  print_type: "BLACK_AND_WHITE" | "COLOR" | "BLACK_WHITE" | "colour" | "black_white";
  paper_size: "A4" | "A3" | string;
  print_side: "SINGLE" | "DOUBLE" | "single" | "double" | string;
  document_total: number;
  url?: string | null;
  services?: ShopDocumentService[];
}

export interface EnrichedShopOrder {
  order_id: string;
  token: string;
  student_id: string;
  student_name?: string;
  register_number?: string;
  assigned_printer?: string;
  is_priority: boolean;
  queue_state: QueueState;
  payment_status: "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "paid" | "pending" | string;
  grand_total: number;
  created_at: string;
  estimated_print_time?: string;
  documents: DetailedOrderDocument[];
  document_count: number;
  total_pages: number;
  total_copies: number;
  is_current: boolean;
  estimated_wait_minutes?: number;
  estimated_completion_time?: string | null;
  color_mode?: string;
  duplex_mode?: string;
  paper_size?: string;
}

export interface DashboardData {
  todaysOrders: TodayOrderItem[];
  revenue: TodayRevenue;
  pendingSettlements: SettlementItem[];
  historySettlements: SettlementItem[];
  liveQueue: LiveQueueSummary;
}

