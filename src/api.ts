const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const TOKEN_KEY = 'piada-deploy-token';
export type User = { id: string; name: string; email: string };
export type Joke = { id: string; category: string; tone: string; context: string; joke: string; createdAt: string };
export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }
export function setToken(token: string) { localStorage.setItem(TOKEN_KEY, token); }
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, { ...options, headers: {
    'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}), ...options.headers,
  } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Algo deu errado.');
  return data as T;
}
