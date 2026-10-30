
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.message || "Users API unavailable");
        return d;
      })
      .then((d) => setUsers(Array.isArray(d) ? d : d.users || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="noire-admin">
      <AdminSidebar />
      <main className="noire-main">
        <header className="noire-header">
          <div><p className="noire-eyebrow">CUSTOMER DIRECTORY</p><h1>Users</h1><p>View registered store accounts.</p></div>
        </header>
        {error && <p className="noire-error">{error} — Confirm GET /api/admin/users exists.</p>}
        <section className="noire-panel">
          {loading ? <p>Loading users…</p> : (
            <div className="noire-table-wrap">
              <table className="noire-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>{u.name || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td><span className="noire-status">{u.role || "customer"}</span></td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    </tr>
                  ))}
                  {!users.length && <tr><td colSpan="4">No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
