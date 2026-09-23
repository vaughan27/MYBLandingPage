// Two base URLs: PostgREST for read-only content, FastAPI for everything else.
// In dev, Vite proxies /content and /api to the right container (see vite.config.js).
export const CONTENT_BASE = "/content"; // -> PostgREST
export const API_BASE = "/api"; // -> FastAPI

export async function fetchJSON(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}
