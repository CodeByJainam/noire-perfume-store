import { useEffect, useState } from "react"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { apiUrl } from "../../lib/api"

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(apiUrl("/api/admin/orders"), { credentials: "include" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(d.message || "Orders API unavailable")
        return d
      })
      .then((d) => setOrders(Array.isArray(d) ? d : d.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`

  const orderId = (o) => o._id || o.id || "—"

  const customer = (o) =>
    o.user?.name || o.customer?.name || o.shippingAddress?.name || o.name || "—"

  const payment = (o) => o.paymentStatus || o.payment?.status || o.status || "—"

  const orderStatus = (o) => o.orderStatus || "—"

  const total = (o) => o.totalAmount ?? o.total ?? o.amount ?? 0

  const getPaymentClass = (status) => {
    switch (String(status).toLowerCase()) {
      case "paid":
        return "status-paid"
      case "pending":
        return "status-pending"
      case "failed":
        return "status-failed"
      case "refunded":
        return "status-refunded"
      default:
        return "status-default"
    }
  }

  const getOrderClass = (status) => {
    switch (String(status).toLowerCase()) {
      case "placed":
        return "order-placed"
      case "processing":
        return "order-processing"
      case "shipped":
        return "order-shipped"
      case "delivered":
        return "order-delivered"
      case "cancelled":
        return "order-cancelled"
      default:
        return "status-default"
    }
  }

  return (
    <div className="noire-admin">
      <AdminSidebar />

      <main className="noire-main">
        <header className="noire-header">
          <div>
            <p className="noire-eyebrow">FULFILMENT</p>
            <h1>Orders</h1>
            <p>Review orders recorded by your store.</p>
          </div>
        </header>

        {error && (
          <p className="noire-error">
            {error} — Confirm that your backend exposes GET /api/admin/orders.
          </p>
        )}

        <section className="noire-panel">
          {loading ? (
            <p>Loading orders…</p>
          ) : (
            <div className="noire-table-wrap">
              <table className="noire-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((o) => (
                    <tr key={orderId(o)}>
                      <td>#{String(orderId(o)).slice(-8)}</td>

                      <td>{customer(o)}</td>

                      <td>{money(total(o))}</td>

                      <td>
                        <span
                          className={`noire-status ${getPaymentClass(payment(o))}`}
                        >
                          {String(payment(o))}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`noire-status ${getOrderClass(orderStatus(o))}`}
                        >
                          {String(orderStatus(o))}
                        </span>
                      </td>

                      <td>
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))}

                  {!orders.length && (
                    <tr>
                      <td colSpan="6">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
