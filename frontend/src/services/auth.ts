import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
  DepartmentsResponse,
  YearsResponse,
  SectionsResponse,
} from "@/components/auth/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://qlex-two.vercel.app";

/**
 * Generic request helper (POST) — no auth required.
 */
async function request<T>(path: string, body?: unknown): Promise<T> {
  const options: RequestInit = {
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.method = "POST";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, options);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      success: false,
      message: "Network error. Please try again.",
    }));
    const err: any = new Error(errorBody.message || "Something went wrong.");
    err.status = res.status;
    err.response = { status: res.status, data: errorBody };
    throw err;
  }

  return res.json();
}

/**
 * Authenticated GET request — includes Bearer token.
 */
async function authGetRequest<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      success: false,
      message: "Network error. Please try again.",
    }));
    const err: any = new Error(errorBody.message || "Something went wrong.");
    err.status = res.status;
    err.response = { status: res.status, data: errorBody };
    throw err;
  }

  return res.json();
}

// ── Auth API ───────────────────────────────────────────────────────

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/api/v1/auth/login", data);
}

export function register(data: RegisterRequest): Promise<UserResponse> {
  return request<UserResponse>("/api/v1/auth/register", data);
}

/**
 * Fetch current user profile using the stored JWT token.
 * This is called on app bootstrap to validate & hydrate session.
 */
export function getCurrentUser(token: string): Promise<UserResponse> {
  return authGetRequest<UserResponse>("/api/v1/auth/me", token);
}

// ── Lookup APIs ────────────────────────────────────────────────────

export function getDepartments(): Promise<DepartmentsResponse> {
  return request<DepartmentsResponse>("/api/v1/auth/departments");
}

export function getYears(): Promise<YearsResponse> {
  return request<YearsResponse>("/api/v1/auth/years");
}

export function getSections(): Promise<SectionsResponse> {
  return request<SectionsResponse>("/api/v1/auth/sections");
}

