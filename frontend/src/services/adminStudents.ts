/**
 * Admin Students Management API Service
 * Interacts with FastAPI backend `/admin/students*` endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://qlex-two.vercel.app";

export interface StudentOverview {
  total_students: number;
  active_students: number;
  blocked_students: number;
  new_registrations_today: number;
  students_with_active_orders: number;
}

export interface StudentItem {
  id: string;
  register_number: string;
  full_name: string;
  phone: string;
  email: string | null;
  department_id: string;
  department_name: string;
  year_id: string;
  year_number: number;
  section_id: string;
  section_name: string;
  is_active: boolean;
  created_at: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_spent: number;
  current_active_token: string | null;
  current_order_status: string | null;
}

export interface StudentsListResponse {
  students: StudentItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GetStudentsParams {
  search?: string;
  department_id?: string;
  year_id?: string;
  status?: string;
  order_status?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

/**
 * Fetches overview statistics for registered students.
 */
export async function getStudentsOverview(): Promise<StudentOverview> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/students/overview`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch student overview (${res.status})`);
    }

    const data = await res.json();
    return {
      total_students: Number(data.total_students || 0),
      active_students: Number(data.active_students || 0),
      blocked_students: Number(data.blocked_students || 0),
      new_registrations_today: Number(data.new_registrations_today || 0),
      students_with_active_orders: Number(data.students_with_active_orders || 0),
    };
  } catch (error) {
    console.error("Error in getStudentsOverview:", error);
    throw error;
  }
}

/**
 * Fetches filtered and paginated student list from backend.
 */
export async function getStudentsList(params: GetStudentsParams = {}): Promise<StudentsListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set("search", params.search);
    if (params.department_id) queryParams.set("department_id", params.department_id);
    if (params.year_id) queryParams.set("year_id", params.year_id);
    if (params.status) queryParams.set("status", params.status);
    if (params.order_status) queryParams.set("order_status", params.order_status);
    if (params.sort_by) queryParams.set("sort_by", params.sort_by);
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.page_size) queryParams.set("page_size", params.page_size.toString());

    const url = `${API_BASE_URL}/admin/students?${queryParams.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch student list (${res.status})`);
    }

    const data = await res.json();
    return {
      students: (data.students || []).map((s: any) => ({
        id: String(s.id),
        register_number: String(s.register_number || ""),
        full_name: String(s.full_name || ""),
        phone: String(s.phone || ""),
        email: s.email ? String(s.email) : null,
        department_id: String(s.department_id || ""),
        department_name: String(s.department_name || "N/A"),
        year_id: String(s.year_id || ""),
        year_number: Number(s.year_number || 0),
        section_id: String(s.section_id || ""),
        section_name: String(s.section_name || "N/A"),
        is_active: Boolean(s.is_active),
        created_at: String(s.created_at || ""),
        total_orders: Number(s.total_orders || 0),
        completed_orders: Number(s.completed_orders || 0),
        cancelled_orders: Number(s.cancelled_orders || 0),
        total_spent: Number(s.total_spent || 0),
        current_active_token: s.current_active_token ? String(s.current_active_token) : null,
        current_order_status: s.current_order_status ? String(s.current_order_status) : null,
      })),
      total: Number(data.total || 0),
      page: Number(data.page || 1),
      page_size: Number(data.page_size || 12),
      total_pages: Number(data.total_pages || 1),
    };
  } catch (error) {
    console.error("Error in getStudentsList:", error);
    throw error;
  }
}

/**
 * Toggles or sets student account active state.
 */
export async function toggleStudentStatus(studentId: string, isActive?: boolean): Promise<StudentItem> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}/toggle-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isActive !== undefined ? { is_active: isActive } : {}),
    });

    if (!res.ok) {
      throw new Error(`Failed to update student account status (${res.status})`);
    }

    const s = await res.json();
    return {
      id: String(s.id),
      register_number: String(s.register_number || ""),
      full_name: String(s.full_name || ""),
      phone: String(s.phone || ""),
      email: s.email ? String(s.email) : null,
      department_id: String(s.department_id || ""),
      department_name: String(s.department_name || "N/A"),
      year_id: String(s.year_id || ""),
      year_number: Number(s.year_number || 0),
      section_id: String(s.section_id || ""),
      section_name: String(s.section_name || "N/A"),
      is_active: Boolean(s.is_active),
      created_at: String(s.created_at || ""),
      total_orders: Number(s.total_orders || 0),
      completed_orders: Number(s.completed_orders || 0),
      cancelled_orders: Number(s.cancelled_orders || 0),
      total_spent: Number(s.total_spent || 0),
      current_active_token: s.current_active_token ? String(s.current_active_token) : null,
      current_order_status: s.current_order_status ? String(s.current_order_status) : null,
    };
  } catch (error) {
    console.error("Error in toggleStudentStatus:", error);
    throw error;
  }
}
