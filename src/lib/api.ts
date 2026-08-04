const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  responseType?: 'json' | 'blob' | 'response';
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, responseType = 'json', headers, ...customConfig } = options;
  
  let url = `${API_BASE}${endpoint}`;
  
  if (params) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlParams.append(key, String(value));
      }
    });
    const queryString = urlParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const isFormData = customConfig.body instanceof FormData;

  // Extract XSRF-TOKEN and Cookies
  let xsrfToken = '';
  let serverCookie = '';
  let referer = '';

  if (typeof window !== 'undefined') {
    // Client-side
    const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
    if (match) {
      xsrfToken = decodeURIComponent(match[2]);
    }
  } else {
    // Server-side
    try {
      const { cookies } = require('next/headers');
      const cookieStore = await cookies();
      serverCookie = cookieStore.toString();
      const xsrfCookie = cookieStore.get('XSRF-TOKEN');
      if (xsrfCookie) {
        xsrfToken = decodeURIComponent(xsrfCookie.value);
      }
      referer = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    } catch (e) {
      // Ignore errors if next/headers is not available
    }
  }

  const headersObj: Record<string, string> = {
    'Accept': 'application/json',
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken }),
    ...(serverCookie && { 'Cookie': serverCookie }),
    ...(referer && { 'Referer': referer }),
    ...(headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...customConfig,
    headers: headersObj,
    credentials: 'include', // Automatically send cookies
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (responseType === 'response') {
    return response as unknown as T;
  }

  if (responseType === 'blob') {
    return (await response.blob()) as unknown as T;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export async function getCsrfCookie(): Promise<void> {
  const backendBaseUrl = API_BASE.replace('/api', '');
  await fetch(`${backendBaseUrl}/sanctum/csrf-cookie`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });
}
