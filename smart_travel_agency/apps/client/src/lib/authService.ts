// lib/authService.ts
import axios from 'axios';
import { AuthApi, LoginRequest, RegisterRequest, AuthResponse, JwtPayload } from '@/types/api';
import { AuthEndpoints } from '@/types/enums';

const API_URL = 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

export const authService: AuthApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {

      const response = await axiosInstance.post(AuthEndpoints.REGISTER, data);
      // Transform the API response to match our expected structure
      return {
        user: response.data.data,  // The user data is in response.data.data
        message: response.data.message,
        status: response.data.status,
        code: response.data.code
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post(AuthEndpoints.LOGIN, data);
      // Transform the API response to match our expected structure
      return {
        user: response.data.data,  // The user data is in response.data.data
        message: response.data.message,
        status: response.data.status,
        code: response.data.code
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async adminLogin(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post(AuthEndpoints.ADMIN_LOGIN, data);
      // Transform the API response to match our expected structure
      return {
        user: response.data.data,  // The user data is in response.data.data
        message: response.data.message,
        status: response.data.status,
        code: response.data.code
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Admin login failed');
    }
  },

  async logout(): Promise<{ message: string, status: string, code: number }> {
    try {
      const response = await axiosInstance.post(AuthEndpoints.LOGOUT);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  async getCurrentUser(): Promise<{ data: JwtPayload, message: string, status: string, code: number }> {
    try {
      const response = await axiosInstance.get(AuthEndpoints.CURRENT_USER);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get current user');
    }
  },
};