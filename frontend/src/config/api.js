// FastAPI owns public content and staff management endpoints. In dev, Vite
// proxies /api to the backend (see vite.config.js).
export const CONTENT_BASE = "/api/content";
export const API_BASE = "/api"; // -> FastAPI

export async function fetchJSON(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}
