import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
  DepartmentsResponse,
  YearsResponse,
  SectionsResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    // Backend returns { success: false, message: "..." }
    throw new Error(errorBody.message || "Something went wrong.");
  }

  return res.json();
}

async function getRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      success: false,
      message: "Network error. Please try again.",
    }));
    throw new Error(errorBody.message || "Something went wrong.");
  }

  return res.json();
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/api/v1/auth/login", data);
}

export function register(data: RegisterRequest): Promise<UserResponse> {
  return request<UserResponse>("/api/v1/auth/register", data);
}

export function getDepartments(): Promise<DepartmentsResponse> {
  return getRequest<DepartmentsResponse>("/api/v1/auth/departments");
}

export function getYears(): Promise<YearsResponse> {
  return getRequest<YearsResponse>("/api/v1/auth/years");
}

export function getSections(): Promise<SectionsResponse> {
  return getRequest<SectionsResponse>("/api/v1/auth/sections");
}

