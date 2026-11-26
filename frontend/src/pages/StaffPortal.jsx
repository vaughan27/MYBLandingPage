import { useCallback, useEffect, useRef, useState } from "react";

const CONTENT_TYPES = {
  "What's New": { key: "whats-new", fields: ["title", "body", "url", "active"] },
  "Company systems": { key: "quick-links", fields: ["label", "href", "icon", "sort_order", "enabled"] },
  "Manuals & resources": { key: "feature-tiles", fields: ["title", "file", "icon", "sort_order", "enabled"] },
};

const emptyDraft = (type) => type === "What's New"
  ? { title: "", body: "", url: "", active: true }
  : type === "Company systems"
    ? { label: "", href: "", icon: "link", sort_order: 0, enabled: true }
    : { title: "", icon: "link", sort_order: 0, enabled: true, file: null };

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { credentials: "include", ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || "Request failed");
  return body;
}

export default function StaffPortal() {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [type, setType] = useState("What's New");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(emptyDraft("What's New"));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "manager" });
  const [tab, setTab] = useState("content");
  const itemsRequest = useRef(0);

  const loadUser = useCallback(async () => {
    try { setUser(await api("/staff/me")); } catch { setUser(null); }
  }, []);

  const loadItems = useCallback(async () => {
    if (!user) return;
    const requestId = ++itemsRequest.current;
    try {
      const data = await api(`/staff/${CONTENT_TYPES[type].key}`);
      if (requestId !== itemsRequest.current) return;
      setItems(data);
      setSelected(null);
      setDraft(emptyDraft(type));
      setError("");
    } catch (err) { if (requestId === itemsRequest.current) setError(err.message); }
  }, [type, user]);

  useEffect(() => { loadUser(); }, [loadUser]);
  useEffect(() => { loadItems(); }, [loadItems]);

  async function signIn(event) {
    event.preventDefault(); setLoginError("");
    try { setUser(await api("/staff/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(login) })); }
    catch (err) { setLoginError(err.message); }
  }

  async function signOut() {
    await api("/staff/logout", { method: "POST" });
    setUser(null); setItems([]); setUsers([]);
  }

  function chooseType(next) {
    if (next === type) return;
    itemsRequest.current += 1;
    setType(next); setItems([]); setSelected(null); setDraft(emptyDraft(next)); setMessage(""); setError("");
  }

  function editItem(item) {
    setSelected(item);
    setDraft(type === "What's New"
      ? { title: item.title, body: item.body, url: item.url || "", active: item.active }
      : type === "Company systems"
        ? { label: item.label, href: item.href, icon: item.icon || "link", sort_order: item.sort_order, enabled: item.enabled }
        : { title: item.title, icon: item.icon || "link", sort_order: item.sort_order, enabled: item.enabled, file: null });
    setMessage(""); setError("");
  }

  async function saveContent(event) {
    event.preventDefault(); setError(""); setMessage("");
    const key = CONTENT_TYPES[type].key;
    const method = selected ? "PUT" : "POST";
    const path = `/staff/${key}${selected ? `/${selected.id}` : ""}`;
    try {
      let result;
      if (type === "Manuals & resources") {
        const form = new FormData();
        for (const field of ["title", "icon", "sort_order", "enabled"]) form.append(field, String(draft[field]));
        if (draft.file) form.append("file", draft.file);
        result = await api(path, { method, body: form });
      } else {
        result = await api(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      }
      setMessage("Changes saved.");
      if (selected) setSelected(result);
      else { setSelected(null); setDraft(emptyDraft(type)); }
      const refreshed = await api(`/staff/${key}`); setItems(refreshed);
    } catch (err) { setError(err.message); }
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete “${item.title || item.label}”? This cannot be undone.`)) return;
    try {
      await api(`/staff/${CONTENT_TYPES[type].key}/${item.id}`, { method: "DELETE" });
      setItems((rows) => rows.filter((row) => row.id !== item.id));
      if (selected?.id === item.id) { setSelected(null); setDraft(emptyDraft(type)); }
      setMessage("Item deleted."); setError("");
    } catch (err) { setError(err.message); }
  }

  async function loadUsers() {
    try { setUsers(await api("/staff/users")); setError(""); } catch (err) { setError(err.message); }
  }

  async function createUser(event) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      await api("/staff/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser) });
      setNewUser({ username: "", password: "", role: "manager" });
      setMessage("Staff account created."); loadUsers();
    } catch (err) { setError(err.message); }
  }

  async function changeUser(row, patch) {
    try {
      await api(`/staff/users/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: patch.role || row.role, active: patch.active ?? row.active }) });
      loadUsers(); setMessage("Staff account updated.");
    } catch (err) { setError(err.message); }
  }

  if (!user) return (
    <main className="staff-page">
      <div className="staff-shell staff-login">
        <a className="staff-back" href="/">← Back to Landing</a>
        <p className="eyebrow">MYB INTRANET</p>
        <h1>Staff login</h1>
        <p>Sign in to manage company systems, manuals, and What's New updates.</p>
        <form className="staff-form" onSubmit={signIn}>
          <label>Username<input autoComplete="username" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required /></label>
          {loginError && <p className="staff-error">{loginError}</p>}
          <button className="staff-primary">Sign in</button>
        </form>
      </div>
    </main>
  );

  return (
    <main className="staff-page">
      <div className="staff-shell">
        <header className="staff-topbar">
          <div><a className="staff-back" href="/">← home</a><p className="eyebrow">STAFF · {user.role.toUpperCase()}</p><h1>Content manager</h1></div>
          <button className="staff-secondary" onClick={signOut}>Sign out</button>
        </header>
        <nav className="staff-tabs">
          <button className={tab === "content" ? "is-active" : ""} onClick={() => setTab("content")}>Content</button>
          {user.role === "admin" && <button className={tab === "users" ? "is-active" : ""} onClick={() => { setTab("users"); loadUsers(); }}>Staff accounts</button>}
        </nav>
        {message && <p className="staff-success">{message}</p>}{error && <p className="staff-error">{error}</p>}
        {tab === "content" ? <>
          <div className="staff-content-layout">
            <section className="staff-panel staff-list-panel">
              <div className="staff-panel-heading"><div><p className="eyebrow">MANAGE CONTENT</p><h2>Choose a section</h2></div><button className="staff-primary" onClick={() => { setSelected(null); setDraft(emptyDraft(type)); setMessage(""); }}>+ Add new</button></div>
              <div className="staff-section-select">{Object.keys(CONTENT_TYPES).map((name) => <button className={type === name ? "is-active" : ""} key={name} onClick={() => chooseType(name)}>{name}</button>)}</div>
              <div className="staff-items">
                {items.map((item) => <article className={`staff-item ${selected?.id === item.id ? "is-selected" : ""}`} key={item.id}>
                  <button className="staff-item-main" onClick={() => editItem(item)}><strong>{item.title || item.label}</strong><span>{type === "What's New" ? (item.active ? "Active" : "Inactive") : (item.enabled ? "Enabled" : "Disabled")}{type === "Manuals & resources" && item.href ? ` · ${item.href.split("/").pop()}` : ""}</span></button>
                  <button className="staff-text-button" onClick={() => editItem(item)}>Edit</button>
                  {user.role === "admin" && <button className="staff-delete" onClick={() => deleteItem(item)}>Delete</button>}
                </article>)}
                {!items.length && <p className="staff-muted">No items yet.</p>}
              </div>
            </section>
            <section className="staff-panel staff-editor">
              <p className="eyebrow">{selected ? `EDIT ITEM #${selected.id}` : "NEW ITEM"}</p><h2>{selected ? "Edit content" : "Add content"}</h2>
              {selected && type === "What's New" && <p className="staff-muted">Published {new Date(selected.published_at).toLocaleString()}</p>}
              <form className="staff-form" onSubmit={saveContent}>
                {(type === "What's New" ? ["title", "body", "url"] : type === "Company systems" ? ["label", "href", "icon", "sort_order"] : ["title", "file", "icon", "sort_order"]).map((field) => <label key={field}>{field === "href" ? "Link URL" : field === "url" ? "Optional link URL" : field === "file" ? (selected ? "Replace PDF (optional)" : "PDF file") : field.replace("_", " ")}
                  {field === "body" ? <textarea rows="5" value={draft[field]} onChange={(e) => setDraft({ ...draft, [field]: e.target.value })} required />
                    : field === "file" ? <input type="file" accept="application/pdf,.pdf" required={!selected} onChange={(e) => setDraft({ ...draft, file: e.target.files?.[0] || null })} />
                    : <input type={field === "sort_order" ? "number" : "text"} value={draft[field]} onChange={(e) => setDraft({ ...draft, [field]: field === "sort_order" ? Number(e.target.value) : e.target.value })} required={field !== "url"} />}
                </label>)}
                {type !== "What's New" && <label className="staff-checkbox"><input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} /> Enabled on the intranet</label>}
                {type === "What's New" && <label className="staff-checkbox"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active and visible</label>}
                <p className="staff-muted">Icon name (examples: link, book, user, shield, ticket, phone).</p>
                <button className="staff-primary">{selected ? "Save changes" : "Create item"}</button>
              </form>
            </section>
          </div>
        </> : <section className="staff-panel staff-users-panel">
          <p className="eyebrow">ADMINISTRATION</p><h2>Staff accounts</h2>
          <form className="staff-user-create" onSubmit={createUser}>
            <label>Username<input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required minLength="3" /></label>
            <label>Temporary password<input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required minLength="8" /></label>
            <label>Role<select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}><option value="manager">Manager</option><option value="admin">Admin</option></select></label>
            <button className="staff-primary">Create account</button>
          </form>
          <div className="staff-user-list">{users.map((row) => <div className="staff-user-row" key={row.id}><strong>{row.username}</strong><select value={row.role} onChange={(e) => changeUser(row, { role: e.target.value })}><option value="manager">Manager</option><option value="admin">Admin</option></select><label className="staff-checkbox"><input type="checkbox" checked={row.active} onChange={(e) => changeUser(row, { active: e.target.checked })} /> Active</label></div>)}</div>
        </section>}
      </div>
    </main>
  );
}
