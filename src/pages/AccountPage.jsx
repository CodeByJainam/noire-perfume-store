import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/api";

function AccountPage() {
  const { user, isAuthenticated, authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [visibleOrderCount, setVisibleOrderCount] = useState(5);
  const [expandedOrderIds, setExpandedOrderIds] = useState(new Set());
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const controller = new AbortController();

    async function loadOrders() {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const response = await fetch(apiUrl("/api/orders/my-orders"), {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(data.message || "Could not load your orders.");
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        if (err.name !== "AbortError")
          setOrdersError(err.message || "Could not load your orders.");
      } finally {
        if (!controller.signal.aborted) setOrdersLoading(false);
      }
    }

    loadOrders();
    return () => controller.abort();
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <main className="account-page">
        <p className="account-loading">Loading your account...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const startProfileEdit = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setProfileMessage("");
    setProfileError("");
    setEditingProfile(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    setProfileError("");
    try {
      const response = await fetch(apiUrl("/api/auth/profile"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Unable to update your profile.");
      updateUser(data.user);
      setEditingProfile(false);
      setProfileMessage("Your profile has been updated successfully.");
    } catch (err) {
      setProfileError(err.message || "Unable to update your profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError("Logout failed. Please try again.");
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderIds((previous) => {
      const updated = new Set(previous);

      if (updated.has(orderId)) {
        updated.delete(orderId);
      } else {
        updated.add(orderId);
      }

      return updated;
    });
  };

  const formatOrderPrice = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };
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

          {["admin", "super_admin"].includes(user?.role) && (
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
              <p className="noire-orders-subtitle">
                Your fragrance purchases, all in one place.
              </p>
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
              <>
                <div className="noire-orders-toolbar">
                  <span>
                    Showing {Math.min(visibleOrderCount, orders.length)} of{" "}
                    {orders.length} orders
                  </span>
                  <span className="noire-orders-count">
                    {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}
                  </span>
                </div>

                <div className="noire-accordion-list">
                  {orders.slice(0, visibleOrderCount).map((order) => {
                    const orderId = order._id || order.orderNumber;
                    const isExpanded = expandedOrderIds.has(orderId);

                    return (
                      <article
                        className={`noire-order-accordion ${
                          isExpanded ? "is-expanded" : ""
                        }`}
                        key={orderId}
                      >
                        <button
                          type="button"
                          className="noire-order-trigger"
                          aria-expanded={isExpanded}
                          aria-controls={`order-details-${orderId}`}
                          onClick={() => toggleOrderDetails(orderId)}
                        >
                          <div className="noire-order-main">
                            <span className="noire-order-reference">
                              ORDER REFERENCE
                            </span>

                            <h3>{order.orderNumber}</h3>

                            <span className="noire-order-date">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <div className="noire-order-summary">
                            <div className="noire-order-badges">
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

                            <strong className="noire-order-amount">
                              {formatOrderPrice(order.total, order.currency)}
                            </strong>

                            <span className="noire-order-view">
                              {isExpanded ? "Hide Details" : "View Details"}

                              <svg
                                className={`noire-order-chevron ${
                                  isExpanded ? "rotated" : ""
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="m6 9 6 6 6-6"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div
                            className="noire-order-details"
                            id={`order-details-${orderId}`}
                          >
                            <div className="noire-order-details-heading">
                              <span>ORDER ITEMS</span>
                              <span>
                                {(order.items || []).length}{" "}
                                {(order.items || []).length === 1
                                  ? "ITEM"
                                  : "ITEMS"}
                              </span>
                            </div>

                            <div className="noire-order-products">
                              {(order.items || []).map((item, index) => (
                                <div
                                  className="noire-order-product"
                                  key={`${orderId}-${item.productId || index}`}
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="noire-order-product-image"
                                    />
                                  ) : (
                                    <div className="noire-order-product-placeholder">
                                      N.
                                    </div>
                                  )}

                                  <div className="noire-order-product-info">
                                    <h4>{item.name}</h4>

                                    <p>
                                      Qty {item.quantity} ·{" "}
                                      {formatOrderPrice(
                                        item.unitPrice,
                                        order.currency,
                                      )}
                                    </p>
                                  </div>

                                  <strong className="noire-order-product-price">
                                    {formatOrderPrice(
                                      item.lineTotal,
                                      order.currency,
                                    )}
                                  </strong>
                                </div>
                              ))}
                            </div>

                            <div className="noire-order-breakdown">
                              <div>
                                <span>Subtotal</span>
                                <span>
                                  {formatOrderPrice(
                                    order.subtotal,
                                    order.currency,
                                  )}
                                </span>
                              </div>

                              <div>
                                <span>Shipping</span>
                                <span>
                                  {formatOrderPrice(
                                    order.shipping,
                                    order.currency,
                                  )}
                                </span>
                              </div>

                              <div className="noire-order-grand-total">
                                <strong>Total</strong>
                                <strong>
                                  {formatOrderPrice(
                                    order.total,
                                    order.currency,
                                  )}
                                </strong>
                              </div>
                            </div>

                            <div className="noire-order-payment-info">
                              <span>PAYMENT METHOD</span>
                              <strong>
                                {String(
                                  order.paymentMethod || "N/A",
                                ).toUpperCase()}
                              </strong>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>

                {visibleOrderCount < orders.length && (
                  <button
                    type="button"
                    className="noire-load-more"
                    onClick={() =>
                      setVisibleOrderCount((previous) => previous + 5)
                    }
                  >
                    Load More Orders
                    <span>({orders.length - visibleOrderCount} remaining)</span>
                  </button>
                )}
              </>
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
  );
}

export default AccountPage;
