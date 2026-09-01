import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE = 'auth_token';

export async function middleware(request: NextRequest) {
  // Hanya proteksi /dashboard dan sub-route-nya
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    // Baca token dari cookie Next.js (ditulis oleh saveToken() saat login)
    const token = request.cookies.get(TOKEN_COOKIE)?.value;

    // Jika tidak ada token sama sekali, redirect langsung tanpa hit backend
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Validasi token ke backend via Authorization header (Bearer)
      const response = await fetch(`${apiUrl}/user`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch {
      // Backend tidak terjangkau
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
