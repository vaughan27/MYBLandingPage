import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { API_BASE, fetchJSON } from "../config/api";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const inputRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    fetchJSON(`${API_BASE}/search?q=${encodeURIComponent(q)}`)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setStatus("done");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <Modal open onClose={onClose} title="Search">
      <input
        ref={inputRef}
        type="search"
        className="search-modal__input"
        placeholder="Search for a system, policy, or contact…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search"
      />

      {status === "loading" && <p className="search-modal__hint">Searching…</p>}
      {status === "error" && (
        <p className="search-modal__hint">Something went wrong — try again.</p>
      )}
      {status === "done" && results.length === 0 && (
        <p className="search-modal__hint">No results for "{query}".</p>
      )}

      {results.length > 0 && (
        <ul className="search-modal__results">
          {results.map((item) => (
            <li key={item.id}>
              <a href={item.href} onClick={onClose}>
                <span>{item.name}</span>
                {item.category && (
                  <span className="search-modal__category">{item.category}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
