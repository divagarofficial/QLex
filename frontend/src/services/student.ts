// ── Student API Service ───────────────────────────────────────────
// All student dashboard data fetched from backend.
// No fake data, no hardcoded values.

import type {
  MyOrdersResponse,
  MyTokenResponse,
  PaymentsResponse,
  LiveQueueResponse,
  WaitingRoomResponse,
  OrderDetailsResponse,
} from "@/types/student";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://qlex-backend-ybnb435gbq-el.a.run.app";

// ── Waiting Room Session (stored in memory & sessionStorage) ────────
let waitingRoomSession: string | null = null;

/**
 * Retrieve the current waiting room session token.
 */
export function getWaitingRoomSession(): string | null {
  if (!waitingRoomSession && typeof window !== "undefined") {
    waitingRoomSession = sessionStorage.getItem("qlex_waiting_room_session");
  }
  return waitingRoomSession;
}

/**
 * Set the waiting room session token.
 */
export function setWaitingRoomSession(session: string | null) {
  waitingRoomSession = session;
  if (typeof window !== "undefined") {
    if (session) {
      sessionStorage.setItem("qlex_waiting_room_session", session);
    } else {
      sessionStorage.removeItem("qlex_waiting_room_session");
    }
  }
}

/**
 * Clear the waiting room session.
 */
export function clearWaitingRoomSession() {
  waitingRoomSession = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("qlex_waiting_room_session");
  }
}

/**
 * Authenticated GET request helper.
 * Includes waiting room session header if available.
 */
async function authGet<T>(path: string, token: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Add waiting room session if we have one
  if (waitingRoomSession) {
    headers["X-Waiting-Room-Session"] = waitingRoomSession;
  }

  const res = await fetch(`${API_BASE}${path}`, { headers });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      message: "Network error. Please try again.",
    }));
    const err: any = new Error(errorBody.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.response = { status: res.status, data: errorBody };
    throw err;
  }

  return res.json();
}

/**
 * Authenticated POST request helper (for waiting room).
 */
async function authPost<T>(path: string, token: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      message: "Network error. Please try again.",
    }));
    const err: any = new Error(errorBody.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.response = { status: res.status, data: errorBody };
    throw err;
  }

  return res.json();
}

// ── Waiting Room API Methods ─────────────────────────────────────

/**
 * Check waiting room status.
 */
export function fetchWaitingRoomStatus(token: string): Promise<WaitingRoomResponse> {
  return authGet<WaitingRoomResponse>("/waiting-room/status", token);
}

/**
 * Enter the waiting room.
 */
export function enterWaitingRoom(token: string, entryPoint: string): Promise<WaitingRoomResponse> {
  return authPost<WaitingRoomResponse>("/waiting-room/enter", token, {
    entry_point: entryPoint,
  });
}

// ── Student API Methods ──────────────────────────────────────────

/**
 * Fetch the current user's active token and queue status.
 */
export function fetchMyToken(token: string): Promise<MyTokenResponse> {
  return authGet<MyTokenResponse>("/student/token", token);
}

/**
 * Fetch the live queue (currently printing, priority, regular).
 */
export function fetchLiveQueue(token: string): Promise<LiveQueueResponse> {
  return authGet<LiveQueueResponse>("/student/live-queue", token);
}

/**
 * Fetch all orders for the current student.
 */
export function fetchMyOrders(token: string): Promise<MyOrdersResponse> {
  return authGet<MyOrdersResponse>("/student/orders", token);
}

/**
 * Fetch payment history for the current student.
 */
export function fetchPayments(token: string): Promise<PaymentsResponse> {
  return authGet<PaymentsResponse>("/student/payments", token);
}

/**
 * Fetch detailed information for a specific order.
 */
export function fetchOrderDetails(token: string, orderId: string): Promise<OrderDetailsResponse> {
  return authGet<OrderDetailsResponse>(`/student/orders/${orderId}`, token);
}

/**
 * Submit a staff print order (zero-cost, routed to QLex Satellite Print Hub).
 */
export function submitStaffOrder(token: string, orderId: string): Promise<any> {
  return authPost<any>(`/orders/${orderId}/submit-staff-order`, token, {});
}


