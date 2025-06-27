import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_CONFIG } from './src/types/cookies';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

// Define admin-only routes
const ADMIN_ROUTES = ['/admin', '/admin/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public routes without authentication
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for auth token
  const authToken = request.cookies.get(COOKIE_CONFIG.USER_COOKIE)?.value;
  
  // If trying to access admin routes, check for admin token
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    const adminToken = request.cookies.get(COOKIE_CONFIG.ADMIN_COOKIE)?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // If no token and not on a public route, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all routes except static files, images, and api
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};