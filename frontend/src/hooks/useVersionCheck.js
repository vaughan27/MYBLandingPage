import { useEffect } from "react";

const CHECK_INTERVAL_MS = 60_000; // also checks whenever the tab regains focus
const RELOADED_KEY = "myb_reloaded_for_version";

/**
 * Reloads the page when a newer build has been deployed, so nobody has to be
 * told to hard refresh. Call once, at the top of App.
 * - Does nothing in dev (no version.json exists there).
 * - Won't yank the page while someone is typing in a field; it just
 *   retries at the next check.
 * - Reloads at most once per deployed version, so a misconfigured server
 *   that keeps serving the old index.html can't cause a reload loop.
 */
export function useVersionCheck() {
  useEffect(() => {
    if (import.meta.env.DEV) return;

    const running = __APP_VERSION__;

    async function check() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const { version } = await res.json();
        if (!version || version === running) return;
        if (sessionStorage.getItem(RELOADED_KEY) === version) return;

        const el = document.activeElement;
        const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
        if (typing) return;

        sessionStorage.setItem(RELOADED_KEY, version);
        console.log(
          `[MYB Intranet] New version detected. Reloading...`,
          {
              runningVersion: running,
              serverVersion: version,
              time: new Date().toLocaleString(),
          }
      );
        window.location.reload();
      } catch {
        /* offline, or server returned HTML instead of JSON — ignore, retry later */
      }
    }

    const timer = setInterval(check, CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}
