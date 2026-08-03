import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only protect /dashboard and its sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    
    // Prepare the headers with the incoming cookies to forward to the backend
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    
    // Forward all cookies
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }
    
    // Simulate frontend request so Sanctum starts the session.
    // DENGAN HARDCODE ENV: Mencegah manipulasi Host/URL dari pihak luar
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    headers.set('Referer', appUrl);

    try {
      // Check auth status with the backend
      const response = await fetch(`${apiUrl}/user`, {
        method: 'GET',
        headers,
      });

      // If not authenticated, redirect to login page
      if (response.status === 401) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      // If backend is unreachable, also redirect or handle gracefully
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
