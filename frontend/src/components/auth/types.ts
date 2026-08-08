// Backend API contracts — exact field names and types from backend schemas

export interface LoginRequest {
  register_number: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  register_number: string;
  full_name: string;
  phone: string;
  email: string | null;
  password: string;
  confirm_password: string;
  department_id: string;
  year_id: string;
  section_name: string;
}

export interface UserResponse {
  id: string;
  register_number: string;
  full_name: string;
  phone: string;
  email: string | null;
  department_name: string;
  year_number: number;
  section_name: string;
}

// Backend error format
export interface ApiError {
  success: boolean;
  message: string;
}

// Lookup types from backend seeds/models
export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

export interface YearOption {
  id: string;
  year_number: number;
}

export interface SectionOption {
  id: string;
  name: string;
}

// Lookup API response types
export interface DepartmentsResponse {
  departments: DepartmentOption[];
}

export interface YearsResponse {
  years: YearOption[];
}

export interface SectionsResponse {
  sections: SectionOption[];
}

// Shared popup result type
export interface ResultState {
  open: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  buttons: { label: string; action: () => void; variant?: "primary" | "secondary" }[];
}

