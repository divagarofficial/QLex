import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from './apiClient';
import { storage } from './storage';
import { User } from '../types';

export interface LoginPayload {
  reg_number: string;
  password?: string;
}

export interface RegisterPayload {
  reg_number: string;
  full_name: string;
  email: string;
  password?: string;
  otp?: string;
  department_id?: string;
  year_id?: string;
  section_id?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ access_token: string; user: User }> {
    const data = await apiRequest<{ access_token: string; user: User }>(
      API_ENDPOINTS.LOGIN,
      { method: 'POST', body: payload }
    );
    if (data.access_token) {
      await storage.setToken(data.access_token);
    }
    return data;
  },

  async sendOTP(email: string, yearId?: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      body: { email, year_id: yearId },
    });
  },

  async register(payload: RegisterPayload): Promise<{ access_token: string; user: User }> {
    const data = await apiRequest<{ access_token: string; user: User }>(
      API_ENDPOINTS.REGISTER,
      { method: 'POST', body: payload }
    );
    if (data.access_token) {
      await storage.setToken(data.access_token);
    }
    return data;
  },

  async getCurrentUser(): Promise<User> {
    return apiRequest<User>(API_ENDPOINTS.ME, { method: 'GET' });
  },

  async shopLogin(pin: string): Promise<{ access_token: string; shop_name: string }> {
    const data = await apiRequest<{ access_token: string; shop_name: string }>(
      API_ENDPOINTS.SHOP_LOGIN,
      { method: 'POST', body: { pin } }
    );
    if (data.access_token) {
      await storage.setShopToken(data.access_token);
    }
    return data;
  },

  async logout(): Promise<void> {
    await storage.clearAll();
  },
};
