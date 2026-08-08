// ── Token Page Type Definitions ──────────────────────────────────

export type OrderStatus =
  | "WAITING"
  | "ACCEPTED"
  | "PRINTING"
  | "READY_FOR_PICKUP"
  | "READY"
  | "COLLECTED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface DocumentItem {
  id: string;
  file_name: string;
  pages: number;
  copies: number;
  is_color: boolean;
  paper_size?: string;
  print_side?: string;
  document_total?: number;
}

export interface ShopDetailsInfo {
  name: string;
  location: string;
  working_hours: string;
  contact_number: string;
  google_maps_url?: string;
}

export interface OrderTokenData {
  token: string;
  order_id: string;
  student_id?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  is_priority: boolean;
  created_at: string;
  estimated_wait_minutes: number;
  shop: ShopDetailsInfo;
  documents: DocumentItem[];
  total_pages: number;
  total_copies: number;
  color_pages_count: number;
  bw_pages_count: number;
}

export interface TimelineStep {
  id: string;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
}
