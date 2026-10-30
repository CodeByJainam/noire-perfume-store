import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AdminSidebar from "../../components/admin/AdminSidebar"

const API = "/api/admin/products"

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

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

  const lowStock = products.filter((p) => Number(p.stock ?? 0) <= 5)

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
            <strong>—</strong>
            <small>Orders API required</small>
          </article>
          <article className="noire-stat">
            <span>Revenue</span>
            <strong>—</strong>
            <small>Verified paid orders required</small>
          </article>
        </section>

        <section className="noire-panel">
          <div className="noire-panel-heading">
            <div>
              <p className="noire-eyebrow">INVENTORY WATCH</p>
              <h2>Products needing attention</h2>
            </div>
            <Link to="/admin/stock">Manage stock →</Link>
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
