import { useEffect } from "react";
import { API_BASE } from "../config/api";

/**
 * Fires once per mount (and again if `path` changes, for a future
 * multi-route setup). Sends no personal data — just the path and referrer.
 * The visitor cookie itself is set server-side, httpOnly, by the backend.
 */
export function useAnalytics(path = window.location.pathname) {
  useEffect(() => {
    fetch(`${API_BASE}/track`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer: document.referrer || null }),
    }).catch(() => {
      /* analytics failures should never break the page */
    });
  }, [path]);
}
