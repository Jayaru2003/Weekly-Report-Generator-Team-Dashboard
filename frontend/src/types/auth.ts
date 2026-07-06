/** Role values mirroring the backend Role enum. */
export type UserRole = 'MEMBER' | 'MANAGER';

/** Minimal user object stored in AuthContext. */
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

/** Body for POST /api/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Body for POST /api/auth/register */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

/** Response from both /login and /register */
export interface AuthResponse {
  token: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}
