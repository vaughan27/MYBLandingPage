import { useCallback, useEffect, useState } from "react";
import { CONTENT_BASE, fetchJSON } from "../config/api";
import { FALLBACK_WHATS_NEW } from "../config/fallbackContent";

const STORAGE_KEY = "myb_whats_new_last_seen";

/**
 * "Unread" is purely a timestamp comparison, not per-item tracking — the
 * badge shows if the newest `published_at` from the backend is newer than
 * whatever timestamp is stored locally from the last time this person
 * opened the modal. Good enough for "there's something new," not meant to
 * track per-item read state.
 */
//check
function latestPublishedAt(items) {
  if (!items || items.length === 0) return null;
  return items.reduce(
    (max, item) => (new Date(item.published_at) > new Date(max) ? item.published_at : max),
    items[0].published_at
  );
}

export function useWhatsNewUnread() {
  const [latest, setLatest] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function applyItems(items) {
      if (cancelled) return;
      const newest = latestPublishedAt(items);
      setLatest(newest);
      if (!newest) {
        setHasUnread(false);
        return;
      }
      const lastSeen = localStorage.getItem(STORAGE_KEY);
      setHasUnread(!lastSeen || new Date(newest) > new Date(lastSeen));
    }

    fetchJSON(`${CONTENT_BASE}/whats-new`)
      .then(applyItems)
      .catch(() => applyItems(FALLBACK_WHATS_NEW));

    return () => {
      cancelled = true;
    };
  }, []);

  // Call this when the modal opens — marks the currently-known latest item
  // as seen so the badge clears immediately and stays cleared on reload.
  const markSeen = useCallback(() => {
    if (latest) localStorage.setItem(STORAGE_KEY, latest);
    setHasUnread(false);
  }, [latest]);

  return { hasUnread, markSeen };
}
