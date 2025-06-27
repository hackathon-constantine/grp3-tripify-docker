import { UserRoles } from './enums';

// Request Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Response Types
export interface AuthResponse {
  user: UserInfo;
  message: string;
  status: string;
  code: number;
}

export interface UserInfo {
  id: string;
  name?: string;
  email: string;
  role: UserRoles;
  credit?: number;
  createdAt?: string;
  updatedAt?: string;
}

// JWT Payload Structure
export interface JwtPayload {
  sub: string;       // User ID
  email: string;
  role: UserRoles;
  name?: string;     // User name
  credit?: number;   // User credit
  iat?: number;      // Issued at timestamp
  exp?: number;      // Expiration timestamp
}