// ── Order Types ──────────────────────────────────────────────────
// Exact field names and types from backend schemas.

// ── Enums (mirroring backend) ─────────────────────────────────────
export enum PrintType {
  BLACK_WHITE = "black_white",
  COLOUR = "colour",
}

export enum PrintSide {
  SINGLE = "single",
  DOUBLE = "double",
}

export enum PaperSize {
  A4 = "A4",
  A3 = "A3",
}

export enum OrderStatus {
  DRAFT = "draft",
  PENDING_PAYMENT = "pending_payment",
  PAID = "paid",
  ACCEPTED = "accepted",
  PRINTING = "printing",
  READY_FOR_PICKUP = "ready_for_pickup",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PAYMENT_FAILED = "payment_failed",
  EXPIRED = "expired",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// ── Pricing Types ─────────────────────────────────────────────────

export interface PricingConfig {
  id: string;
  paper_size: string;
  print_type: string;
  print_side: string;
  shop_price: number;
  convenience_fee: number;
  is_active: boolean;
}

export interface ServiceConfig {
  id: string;
  name: string;
  description: string | null;
  price: number;
  display_order: number;
  is_active: boolean;
}

// ── Draft Order ───────────────────────────────────────────────────

export interface CreateDraftOrderRequest {
  is_priority: boolean;
}

export interface DraftOrderResponse {
  id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  convenience_fee: number;
  platform_fee: number;
  priority_fee: number;
  grand_total: number;
  estimated_completion_time: string | null;
  draft_expires_at: string | null;
}

// ── Upload Types ──────────────────────────────────────────────────

export interface UploadedDocumentResponse {
  id: string;
  original_filename: string;
  page_count: number;
  file_size?: number;
  url?: string | null;
  copies: number;
  document_total: number;
}

export interface UploadResponse {
  documents: UploadedDocumentResponse[];
}

// ── Document Update ───────────────────────────────────────────────

export interface UpdateDocumentRequest {
  paper_size: PaperSize;
  print_type: PrintType;
  print_side: PrintSide;
  copies: number;
  spiral_binding: boolean;
  soft_binding: boolean;
}

export interface DocumentResponse {
  id: string;
  page_count: number;
  file_size?: number;
  url?: string | null;
  paper_size: string;
  print_type: string;
  print_side: string;
  copies: number;
  document_total: number;
}

// ── Order Summary ─────────────────────────────────────────────────

export interface OrderServiceSummary {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderDocumentSummary {
  id: string;
  original_filename: string;
  page_count: number;
  file_size?: number;
  url?: string | null;
  paper_size: string;
  print_type: string;
  print_side: string;
  copies: number;
  shop_price_per_page: number;
  document_total: number;
  services: OrderServiceSummary[];
}

export interface OrderSummaryResponse {
  id: string;
  student_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  is_priority: boolean;
  subtotal: number;
  convenience_fee: number;
  platform_fee: number;
  priority_fee: number;
  grand_total: number;
  estimated_completion_time: string | null;
  draft_expires_at: string | null;
  created_at: string;
  documents: OrderDocumentSummary[];
}

// ── Payment Types ─────────────────────────────────────────────────

export interface CreatePaymentResponse {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment_id: string;
  order_id: string;
  token?: string | null;
  queue_number?: number | null;
  payment_status: string;
  order_status: string;
}

// ── Waiting Room Types ────────────────────────────────────────────

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

export interface AdminWaitingRoomMetrics {
  total_waiting: number;
  active_sessions: number;
  max_capacity: number;
  server_load_percentage: number;
  traffic_level: "LOW" | "NORMAL" | "HIGH" | "SURGE";
  cpu_usage: number;
  memory_usage: number;
}


// ── Shop Queue Types ──────────────────────────────────────────────

export interface LiveQueueResponse {
  currently_printing: string | null;
  priority_queue: string[];
  regular_queue: string[];
}
