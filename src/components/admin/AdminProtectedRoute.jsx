import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function AdminProtectedRoute({
  allowedRoles = ["admin", "super_admin"],
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="admin-loading">Loading NOIRÉ Admin…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
