const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

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

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }

  return response.json();
}
