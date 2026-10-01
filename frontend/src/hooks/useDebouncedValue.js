import { useEffect, useState } from "react";

/** Returns `value`, but delayed until it's stopped changing for `delayMs`. */
export function useDebouncedValue(value, delayMs = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
