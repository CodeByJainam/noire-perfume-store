import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AdminSidebar from "../../components/admin/AdminSidebar"
import { apiUrl } from "../../lib/api"

const API = apiUrl("/api/admin/products")
const SUMMARY_API = apiUrl("/api/admin/summary")

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState({
    totalOrders: 0,
    revenue: 0,
  })

  const [error, setError] = useState("")
  const [summaryError, setSummaryError] = useState("")
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)

  useEffect(() => {
    fetch(API, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Could not load products")
        return data
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.products || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch(SUMMARY_API, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.message || "Could not load dashboard summary")
        }
        return data
      })
      .then((data) => {
        setSummary({
          totalOrders: Number(data.totalOrders || 0),
          revenue: Number(data.revenue || 0),
        })
      })
      .catch((err) => setSummaryError(err.message))
      .finally(() => setSummaryLoading(false))
  }, [])

  const lowStock = products.filter((p) => Number(p.stock ?? 0) <= 5)

  const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`

  return (
    <div className="noire-admin">
      <AdminSidebar />

      <main className="noire-main">
        <header className="noire-header">
          <div>
            <p className="noire-eyebrow">NOIRÉ / CONTROL CENTER</p>
            <h1>Dashboard</h1>
            <p>Welcome to your store overview.</p>
          </div>

          <Link className="noire-button" to="/admin/products">
            Manage products ↗
          </Link>
        </header>

        {error && <p className="noire-error">{error}</p>}

        {summaryError && <p className="noire-error">{summaryError}</p>}

        <section className="noire-stats">
          <article className="noire-stat">
            <span>Total products</span>
            <strong>{loading ? "…" : products.length}</strong>
          </article>

          <article className="noire-stat">
            <span>Low stock</span>
            <strong>{loading ? "…" : lowStock.length}</strong>
          </article>

          <article className="noire-stat">
            <span>Orders</span>
            <strong>{summaryLoading ? "…" : summary.totalOrders}</strong>
            <small>Total orders recorded</small>
          </article>

          <article className="noire-stat">
            <span>Revenue</span>
            <strong>{summaryLoading ? "…" : money(summary.revenue)}</strong>
            <small>From verified paid orders</small>
          </article>
        </section>

        <section className="noire-panel">
          <div className="noire-panel-heading">
            <div>
              <p className="noire-eyebrow">INVENTORY WATCH</p>
              <h2>Products needing attention</h2>
            </div>

            <Link className="noire-stock-link" to="/admin/stock">
              Manage stock 
            </Link>
          </div>

          {loading ? (
            <p>Loading products…</p>
          ) : lowStock.length === 0 ? (
            <p>No low-stock products found.</p>
          ) : (
            <div className="noire-table-wrap">
              <table className="noire-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Collection</th>
                    <th>Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {lowStock.slice(0, 8).map((p) => (
                    <tr key={p._id || p.id}>
                      <td>{p.name || p.title || "Unnamed product"}</td>
                      <td>{p.collection || "—"}</td>
                      <td>
                        <span className="noire-low-stock">
                          {p.stock ?? 0} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
