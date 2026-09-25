// Removed unused import

let accessToken: string | null = null;
export function setAccessToken(token: string | null) { accessToken = token; }
export function getAccessToken() { return accessToken; }

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  options.credentials = 'include';
  options.headers = headers;

  let res = await fetch(`${API_URL}${url}`, options);
  
  if (res.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.data.accessToken);
        headers.set('Authorization', `Bearer ${data.data.accessToken}`);
        options.headers = headers;
        res = await fetch(`${API_URL}${url}`, options);
      } else {
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  }

  return res;
}

export async function get<T>(url: string): Promise<T> {
  const res = await fetchWithAuth(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error occurred');
  return data;
}

export async function post<T>(url: string, body: any): Promise<T> {
  const res = await fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error occurred');
  return data;
}

export async function patch<T>(url: string, body: any): Promise<T> {
  const res = await fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error occurred');
  return data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await fetchWithAuth(url, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error occurred');
  return data;
}
