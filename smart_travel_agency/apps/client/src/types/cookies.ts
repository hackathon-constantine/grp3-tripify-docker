export interface AuthCookies {
  auth_token: string;
  admin_auth_token: string;
}

export const COOKIE_CONFIG = {
  USER_COOKIE: 'auth_token',
  ADMIN_COOKIE: 'admin_auth_token',
  OPTIONS: {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
};