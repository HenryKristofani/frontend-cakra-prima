const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Nama cookie yang menyimpan token Sanctum (dikelola oleh Next.js, bukan Laravel)
const TOKEN_COOKIE = 'auth_token';

// ─── Token helpers ──────────────────────────────────────────────────────────

/**
 * Simpan token ke cookie (accessible oleh SSR via next/headers) dan localStorage (fallback).
 * Dipanggil setelah login berhasil.
 */
export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7;
  const isProduction = window.location.protocol === 'https:';
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${isProduction ? '; Secure' : ''}`;
  localStorage.setItem(TOKEN_COOKIE, token);
}

/**
 * Hapus token dari cookie dan localStorage.
 * Dipanggil saat logout.
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
  localStorage.removeItem(TOKEN_COOKIE);
}

/**
 * Ambil token dari cookie (works both client & server) atau localStorage (fallback client).
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // Client-side: coba dari cookie dulu, lalu localStorage
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${TOKEN_COOKIE}=([^;]*)`));
    if (match) return decodeURIComponent(match[2]);
    return localStorage.getItem(TOKEN_COOKIE);
  }
  // Server-side diambil oleh caller (middleware / RSC) dari next/headers
  return null;
}

// ─── Fetch wrapper ──────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  responseType?: 'json' | 'blob' | 'response';
  /** Override token (untuk SSR/RSC yang membaca cookie via next/headers) */
  token?: string;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, responseType = 'json', headers, token: overrideToken, ...customConfig } = options;

  let url = `${API_BASE}${endpoint}`;

  if (params) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) urlParams.append(key, String(value));
    });
    const qs = urlParams.toString();
    if (qs) url += `?${qs}`;
  }

  // Resolusi token: override (SSR) > cookie/localStorage (client)
  let token = overrideToken ?? getToken();

  // Jika di server-side (RSC) dan token belum ada, otomatis ambil dari next/headers
  if (!token && typeof window === 'undefined') {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      const resolvedCookies = cookieStore instanceof Promise ? await cookieStore : cookieStore;
      token = resolvedCookies.get(TOKEN_COOKIE)?.value || null;
    } catch (e) {
      // Abaikan jika tidak berjalan di konteks Next.js App Router
    }
  }

  const isFormData = customConfig.body instanceof FormData;

  const headersObj: Record<string, string> = {
    Accept: 'application/json',
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(headers as Record<string, string>),
  };

  const config: RequestInit = {
    cache: 'no-store',
    ...customConfig,
    headers: headersObj,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        clearToken();
        window.location.href = '/login';
      } else {
        const { redirect } = require('next/navigation');
        redirect('/login');
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }

  if (response.status === 204) return {} as T;
  if (responseType === 'response') return response as unknown as T;
  if (responseType === 'blob') return (await response.blob()) as unknown as T;

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// getCsrfCookie tidak lagi diperlukan — hapus agar tidak ada yang memanggilnya secara keliru
