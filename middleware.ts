import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE } from '@/lib/auth';

/**
 * Guards every /admin route. Runs on the edge, so it only verifies the signed
 * session cookie — database checks happen in the route/server action itself.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  let valid = false;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET));
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (pathname === '/admin/login') {
    if (valid) return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.next();
  }

  if (!valid) {
    const loginUrl = new URL('/admin/login', request.url);
    if (pathname !== '/admin') loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
