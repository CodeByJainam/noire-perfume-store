import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Customers" },
  { to: "/admin/stock", label: "Inventory" },
];

export default function AdminSidebar() {
  const { user } = useAuth();

  return (
    <aside className="noire-sidebar">
      <NavLink to="/admin" className="noire-brand">
        NOIRÉ <span>ADMIN</span>
      </NavLink>

      <div className="noire-sidebar-label">WORKSPACE</div>

      <nav className="noire-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `noire-nav-link ${isActive ? "active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}

        {user?.role === "super_admin" && (
          <NavLink
            to="/admin/management"
            className={({ isActive }) =>
              `noire-nav-link ${isActive ? "active" : ""}`
            }
          >
            Super Admin
          </NavLink>
        )}
      </nav>

      <div className="noire-sidebar-bottom">
        <div className="noire-role">{user?.role?.replace("_", " ")}</div>
        <div className="noire-email">{user?.email}</div>
        <NavLink to="/" className="noire-store-link">
          ← Back to Store
        </NavLink>
      </div>
    </aside>
  );
}
