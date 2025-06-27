// Export the imported types so they can be re-exported
export type { LoginRequest, RegisterRequest, AuthResponse, JwtPayload } from './auth';

import { LoginRequest, RegisterRequest, AuthResponse, JwtPayload } from './auth';

export interface AuthApi {
  register(data: RegisterRequest): Promise<AuthResponse>;
  login(data: LoginRequest): Promise<AuthResponse>;
  adminLogin(data: LoginRequest): Promise<AuthResponse>;
  logout(): Promise<{ message: string, status: string, code: number }>;
  getCurrentUser(): Promise<{ data: JwtPayload, message: string, status: string, code: number }>;
}