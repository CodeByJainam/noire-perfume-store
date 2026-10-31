
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { apiUrl } from "../../lib/api";

export default function SuperAdminManagement() {
  const { user, authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        apiUrl("/api/admin/users"),
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to load users (${response.status})`
        );
      }

      setUsers(
        Array.isArray(data)
          ? data
          : Array.isArray(data.users)
            ? data.users
            : []
      );
    } catch (error) {
      console.error("Super Admin users error:", error);
      setError(error.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === "super_admin") {
      loadUsers();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user, loadUsers]);

  const changeRole = async (target, newRole) => {
    const id = target._id || target.id;

    if (!id) {
      setError("User ID is missing.");
      return;
    }

    if (!["customer", "admin"].includes(newRole)) {
      setError("Invalid role selected.");
      return;
    }

    const confirmed = window.confirm(
      `Change ${target.name || target.email} to ${newRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setUpdatingId(String(id));

      const response = await fetch(
        apiUrl(`/api/admin/users/${id}/role`),
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Role update failed."
        );
      }

      setMessage("Role updated successfully.");

      await loadUsers();
    } catch (error) {
      console.error("Role update error:", error);
      setError(error.message || "Unable to update role.");
    } finally {
      setUpdatingId("");
    }
  };

  if (authLoading) {
    return (
      <div className="admin-loading">
        Loading NOIRÉ Admin…
      </div>
    );
  }

  if (user?.role !== "super_admin") {
    return (
      <div className="noire-admin">
        <AdminSidebar />

        <main className="noire-main">
          <h1>Access denied</h1>
          <p>
            Only Super Admin can manage account roles.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="noire-admin">
      <AdminSidebar />

      <main className="noire-main">
        <header className="noire-header">
          <div>
            <p className="noire-eyebrow">ACCESS CONTROL</p>

            <h1>Super Admin</h1>

            <p>
              Manage normal customer and admin roles.
            </p>
          </div>
        </header>

        <p className="noire-warning">
          Never promote accounts to Super Admin from this screen.
          Configure the owner email on the server.
        </p>

        {error && (
          <p className="noire-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="noire-success" role="status">
            {message}
          </p>
        )}

        <section className="noire-panel">
          {loading ? (
            <p>Loading accounts…</p>
          ) : (
            <div className="noire-table-wrap">
              <table className="noire-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current role</th>
                    <th>Change role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((account) => {
                    const id = account._id || account.id;

                    const isSelf =
                      String(id) ===
                      String(user.id || user._id);

                    const protectedAccount =
                      account.role === "super_admin";

                    return (
                      <tr key={id}>
                        <td>
                          {account.name || "—"}
                          {isSelf ? " (you)" : ""}
                        </td>

                        <td>{account.email}</td>

                        <td>
                          <span className="noire-status">
                            {account.role || "customer"}
                          </span>
                        </td>

                        <td>
                          {protectedAccount || isSelf ? (
                            "Protected"
                          ) : (
                            <select
                              value={account.role || "customer"}
                              disabled={updatingId === String(id)}
                              onChange={(event) =>
                                changeRole(
                                  account,
                                  event.target.value
                                )
                              }
                            >
                              <option value="customer">
                                Customer
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {!users.length && (
                    <tr>
                      <td colSpan="4">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
            >
              Refresh users
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
