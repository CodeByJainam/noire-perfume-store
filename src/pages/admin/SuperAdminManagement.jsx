
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";

export default function SuperAdminManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await fetch("/api/admin/users", { credentials: "include" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || "Could not load users");
      setUsers(Array.isArray(d) ? d : d.users || []);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (target, role) => {
    if (!window.confirm(`Change ${target.name || target.email} to ${role}?`)) return;
    try {
      setError("");
      setMessage("");
      const r = await fetch(`/api/admin/users/${target._id || target.id}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || "Role update failed");
      setMessage("Role updated successfully.");
      await load();
    } catch (e) { setError(e.message); }
  };

  if (user?.role !== "super_admin") {
    return (
      <div className="noire-admin">
        <AdminSidebar />
        <main className="noire-main">
          <h1>Access denied</h1>
          <p>Only Super Admin can manage account roles.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="noire-admin">
      <AdminSidebar />
      <main className="noire-main">
        <header className="noire-header">
          <div><p className="noire-eyebrow">ACCESS CONTROL</p><h1>Super Admin</h1><p>Manage normal customer and admin roles.</p></div>
        </header>
        <p className="noire-warning">Never promote accounts to Super Admin from this screen. Configure the owner email on the server.</p>
        {error && <p className="noire-error">{error}</p>}
        {message && <p className="noire-success">{message}</p>}
        <section className="noire-panel">
          {loading ? <p>Loading accounts…</p> : (
            <div className="noire-table-wrap">
              <table className="noire-table">
                <thead><tr><th>Name</th><th>Email</th><th>Current role</th><th>Change role</th></tr></thead>
                <tbody>
                  {users.map((u) => {
                    const id = u._id || u.id;
                    const self = String(id) === String(user.id || user._id);
                    const protectedAccount = u.role === "super_admin";
                    return (
                      <tr key={id}>
                        <td>{u.name || "—"}{self ? " (you)" : ""}</td>
                        <td>{u.email}</td>
                        <td><span className="noire-status">{u.role || "customer"}</span></td>
                        <td>
                          {protectedAccount || self ? "Protected" : (
                            <select value={u.role || "customer"} onChange={(e) => changeRole(u, e.target.value)}>
                              <option value="customer">Customer</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
