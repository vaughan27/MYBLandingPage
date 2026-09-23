import { useState } from "react";
import { API_BASE } from "../config/api";

export default function AnalyticsDashboard() {
  const [key, setKey] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadStats(e) {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API_BASE}/dashboard/summary`, {
      headers: { "X-Dashboard-Key": key },
    });
    if (!res.ok) {
      setError(
        res.status === 404
          ? "Wrong key (or the path is wrong)."
          : "Something went wrong."
      );
      return;
    }
    setData(await res.json());
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Traffic dashboard</h1>

        {!data && (
          <form onSubmit={loadStats} className="dashboard__key-form">
            <label htmlFor="dashboard-key">Dashboard key</label>
            <input
              id="dashboard-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoFocus
            />
            <button type="submit">View stats</button>
            {error && <p className="dashboard__error">{error}</p>}
          </form>
        )}

        {data && (
          <>
            <div className="dashboard__stats">
              <div className="dashboard__stat">
                <span className="dashboard__stat-value">{data.total_visitors}</span>
                <span>Unique visitors (all time)</span>
              </div>
              <div className="dashboard__stat">
                <span className="dashboard__stat-value">{data.total_views}</span>
                <span>Total page views</span>
              </div>
              <div className="dashboard__stat">
                <span className="dashboard__stat-value">{data.views_today}</span>
                <span>Views in the last 24h</span>
              </div>
            </div>

            <section>
              <h2>Views per day (last 14 days)</h2>
              <ul className="dashboard__bars">
                {data.daily_views.map((row) => (
                  <li key={row.day}>
                    <span>{row.day}</span>
                    <div
                      className="dashboard__bar"
                      style={{ width: `${Math.min(row.views * 6, 100)}%` }}
                    />
                    <span>{row.views}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2>Top pages</h2>
              <ol>
                {data.top_paths.map((row) => (
                  <li key={row.path}>
                    {row.path} — {row.views} views
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2>Top referrers</h2>
              <ol>
                {data.top_referrers.map((row) => (
                  <li key={row.referrer}>
                    {row.referrer} — {row.views} views
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
