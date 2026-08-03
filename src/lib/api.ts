const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;
  
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

  // Extract XSRF-TOKEN from cookies if we are on the client side
  let xsrfToken = '';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
    if (match) {
      xsrfToken = decodeURIComponent(match[2]);
    }
  }

  const headersObj: Record<string, string> = {
    'Accept': 'application/json',
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken }),
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
