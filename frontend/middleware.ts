import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que deben estar protegidas
const PROTECTED_PATHS = ['/dashboard'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // only check routes under /dashboard
  if (!PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value || null;

  if (!token) {
    // redirect to login preserving the original path
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard'],
};
