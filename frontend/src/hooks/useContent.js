import { useEffect, useState } from "react";
import { CONTENT_BASE, fetchJSON } from "../config/api";

/**
 * Loads a PostgREST view (e.g. "quick_links_public") and falls back to local
 * static data if the request fails, so the page never renders empty.
 */
export function useContent(viewName, fallbackData) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchJSON(`${CONTENT_BASE}/${viewName}`)
      .then((json) => {
        if (!cancelled && Array.isArray(json) && json.length) setData(json);
      })
      .catch(() => {
        /* keep fallbackData */
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [viewName]);

  return { data, loading };
}
