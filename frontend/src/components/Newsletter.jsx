import { useState } from "react";
import { API_BASE, fetchJSON } from "../config/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await fetchJSON(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="newsletter">
      <div className="container newsletter__inner">
        <div>
          <h2 className="section-heading">Stay in the loop</h2>
          <p>Circulars, events and company news, sent when there's something worth reading.</p>
        </div>

        {status === "done" ? (
          <p className="newsletter__done">Subscribed — thank you.</p>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="you@myb.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="newsletter__error">Something went wrong — please try again.</p>
        )}
      </div>
    </section>
  );
}
