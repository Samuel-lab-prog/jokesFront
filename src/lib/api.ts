const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
const TOKEN_KEY = 'piada-deploy-token';
export type User = { id: string; name: string; email: string };
export type Joke = { id: string; category: string; tone: string; context: string; joke: string; createdAt: string };
export function getToken() { return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }
export function setToken(token: string) { localStorage.setItem(TOKEN_KEY, token); }
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Algo deu errado.');
  return data as T;
}
