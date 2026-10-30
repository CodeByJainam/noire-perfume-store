import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiUrl } from "../lib/api"

function AccountPage() {
  const { user, isAuthenticated, authLoading, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState("")
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileEmail, setProfileEmail] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")
  const [profileError, setProfileError] = useState("")

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    const controller = new AbortController()

    async function loadOrders() {
      setOrdersLoading(true)
      setOrdersError("")
      try {
        const response = await fetch(apiUrl("/api/orders/my-orders"), {
          credentials: "include",
          signal: controller.signal,
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok)
          throw new Error(data.message || "Could not load your orders.")
        setOrders(Array.isArray(data.orders) ? data.orders : [])
      } catch (err) {
        if (err.name !== "AbortError")
          setOrdersError(err.message || "Could not load your orders.")
      } finally {
        if (!controller.signal.aborted) setOrdersLoading(false)
      }
    }

    loadOrders()
    return () => controller.abort()
  }, [authLoading, isAuthenticated])

  if (authLoading) {
    return (
      <main className="account-page">
        <p className="account-loading">Loading your account...</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const startProfileEdit = () => {
    setProfileName(user?.name || "")
    setProfileEmail(user?.email || "")
    setProfileMessage("")
    setProfileError("")
    setEditingProfile(true)
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setProfileSaving(true)
    setProfileMessage("")
    setProfileError("")
    try {
      const response = await fetch(apiUrl("/api/auth/profile"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok)
        throw new Error(data.message || "Unable to update your profile.")
      updateUser(data.user)
      setEditingProfile(false)
      setProfileMessage("Your profile has been updated successfully.")
    } catch (err) {
      setProfileError(err.message || "Unable to update your profile.")
    } finally {
      setProfileSaving(false)
    }
  }

  const handleLogout = async () => {
    setError("")
    setLoggingOut(true)

    try {
      await logout()
      navigate("/login", { replace: true })
    } catch (err) {
      setError("Logout failed. Please try again.")
      console.error("Logout failed:", err)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <main className="account-page">
      <div className="account-main">
        <div className="container-main">
          <div className="account-heading">
            <span className="account-eyebrow">NOIRÉ / MY ACCOUNT</span>
            <h1>Welcome back{user?.name ? `, ${user.name}` : ""}.</h1>
            <p>
              Your personal space to manage your account and discover your next
              signature scent.
            </p>
          </div>

          <section className="account-profile">
            <div className="account-avatar" aria-hidden="true">
              {user?.name?.trim()?.charAt(0)?.toUpperCase() || "N"}
            </div>

            <div className="account-profile-info">
              <span className="account-label">YOUR PROFILE</span>
              <h2>{user?.name || "NOIRÉ Customer"}</h2>
              <p>{user?.email || "Email unavailable"}</p>
              <span className="account-status">
                <span className="account-status-dot" />
                Signed in
              </span>
            </div>
            <button
              type="button"
              className="account-edit-button"
              onClick={startProfileEdit}
            >
              Edit Profile
            </button>
          </section>

          {profileMessage && (
            <p className="account-profile-message" role="status">
              {profileMessage}
            </p>
          )}
          {profileError && (
            <p className="account-order-error" role="alert">
              {profileError}
            </p>
          )}
          {editingProfile && (
            <form className="account-edit-form" onSubmit={saveProfile}>
              <div className="account-orders-heading">
                <span className="account-label">ACCOUNT DETAILS</span>
                <h2>Edit Profile</h2>
              </div>
              <label>
                Full name
                <input
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  minLength={2}
                  maxLength={80}
                  required
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(event) => setProfileEmail(event.target.value)}
                  maxLength={254}
                  required
                />
              </label>
              <p className="account-edit-note">
                For security, role and password cannot be changed from this
                form.
              </p>
              <div className="account-edit-actions">
                <button
                  type="submit"
                  className="account-edit-button"
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="account-cancel-button"
                  onClick={() => setEditingProfile(false)}
                  disabled={profileSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {user?.role === "admin" && (
            <section className="account-admin-shortcut">
              <div>
                <span className="account-label">NOIRÉ MANAGEMENT</span>
                <h2>Administrator access</h2>
                <p>
                  Manage products, customer accounts and orders from the admin
                  dashboard.
                </p>
              </div>
              <Link className="account-edit-button" to="/admin">
                Open Admin Dashboard
              </Link>
            </section>
          )}

          <div className="account-section-grid">
            <section className="account-card">
              <div className="account-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M4 7h16v13H4z" />
                  <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                </svg>
              </div>
              <span className="account-label">ORDER HISTORY</span>
              <h2>My Orders</h2>
              <p>Keep track of your perfume purchases and order updates.</p>
              {ordersLoading ? (
                <span className="account-coming-soon">
                  Loading your orders...
                </span>
              ) : ordersError ? (
                <span className="account-order-error" role="alert">
                  {ordersError}
                </span>
              ) : (
                <span className="account-coming-soon">
                  {orders.length} {orders.length === 1 ? "order" : "orders"} on
                  your account
                </span>
              )}
            </section>

            <section className="account-card">
              <div className="account-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
              <span className="account-label">YOUR SECURITY</span>
              <h2>Account Security</h2>
              <p>Your account uses secure sign-in to protect your details.</p>
            </section>
          </div>

          <section
            className="account-orders-section"
            aria-labelledby="account-orders-title"
          >
            <div className="account-orders-heading">
              <span className="account-label">YOUR PURCHASES</span>
              <h2 id="account-orders-title">Order History</h2>
            </div>

            {ordersLoading ? (
              <p className="account-orders-message">
                Loading your order history...
              </p>
            ) : ordersError ? (
              <p className="account-order-error" role="alert">
                {ordersError}
              </p>
            ) : orders.length === 0 ? (
              <div className="account-orders-empty">
                <h3>Your first signature scent awaits.</h3>
                <p>
                  Your confirmed orders will appear here after you place an
                  order.
                </p>
                <Link to="/products" className="account-text-link">
                  Explore fragrances ↗
                </Link>
              </div>
            ) : (
              <div className="account-orders-list">
                {orders.map((order) => (
                  <article
                    className="account-order-card"
                    key={order._id || order.orderNumber}
                  >
                    <div className="account-order-card-heading">
                      <div>
                        <span className="account-label">ORDER REFERENCE</span>
                        <h3>{order.orderNumber}</h3>
                        <p>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </p>
                      </div>
                      <div className="account-order-statuses">
                        <span
                          className={`account-order-badge status-${order.orderStatus}`}
                        >
                          {String(order.orderStatus || "placed").replace(
                            /-/g,
                            " ",
                          )}
                        </span>
                        <span
                          className={`account-order-badge payment-${order.paymentStatus}`}
                        >
                          Payment: {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="account-order-items">
                      {(order.items || []).map((item) => (
                        <div
                          className="account-order-item"
                          key={`${order.orderNumber}-${item.productId}`}
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <div className="account-order-item-placeholder">
                              N.
                            </div>
                          )}
                          <div className="account-order-item-info">
                            <h4>{item.name}</h4>
                            <p>
                              Qty {item.quantity} ·{" "}
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: order.currency || "INR",
                                maximumFractionDigits: 2,
                              }).format(item.unitPrice)}
                            </p>
                          </div>
                          <strong>
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: order.currency || "INR",
                              maximumFractionDigits: 2,
                            }).format(item.lineTotal)}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <div className="account-order-total">
                      <span>Total</span>
                      <strong>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: order.currency || "INR",
                          maximumFractionDigits: 2,
                        }).format(order.total)}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}

          <section className="account-logout-section">
            <div>
              <h2>Leaving so soon?</h2>
              <p>You can sign in again whenever you want to return.</p>
            </div>

            <button
              type="button"
              className="account-logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </section>

          <Link to="/" className="account-back-link">
            Continue Exploring NOIRÉ
          </Link>
        </div>
      </div>
    </main>
  )
}

export default AccountPage
