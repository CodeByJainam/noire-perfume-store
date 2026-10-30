
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/products", { credentials: "include" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || "Could not load products");
      const list = Array.isArray(d) ? d : d.products || [];
      setProducts(list);
      setQuantities(Object.fromEntries(list.map((p) => [p._id || p.id, String(p.stock ?? 0)])));
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveStock = async (id) => {
    const stock = Number(quantities[id]);
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number greater than or equal to zero.");
      return;
    }

    try {
      setError("");
      setMessage("");
      const r = await fetch(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || "Stock update failed");
      setMessage("Stock updated successfully.");
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="noire-admin">
      <AdminSidebar />
      <main className="noire-main">
        <header className="noire-header">
          <div><p className="noire-eyebrow">INVENTORY CONTROL</p><h1>Stock</h1><p>Update inventory quantities.</p></div>
        </header>
        {error && <p className="noire-error">{error}</p>}
        {message && <p className="noire-success">{message}</p>}
        <section className="noire-panel">
          {loading ? <p>Loading inventory…</p> : (
            <div className="noire-table-wrap">
              <table className="noire-table">
                <thead><tr><th>Product</th><th>Current stock</th><th>New quantity</th><th>Action</th></tr></thead>
                <tbody>
                  {products.map((p) => {
                    const id = p._id || p.id;
                    const stock = Number(p.stock ?? 0);
                    return (
                      <tr key={id}>
                        <td>{p.name || p.title || "Unnamed product"}</td>
                        <td><span className={stock <= 5 ? "noire-low-stock" : "noire-status"}>{stock}</span></td>
                        <td><input className="noire-stock-input" type="number" min="0" step="1" value={quantities[id] ?? "0"} onChange={(e) => setQuantities((old) => ({ ...old, [id]: e.target.value }))} /></td>
                        <td><button className="noire-button small" onClick={() => saveStock(id)}>Save</button></td>
                      </tr>
                    );
                  })}
                  {!products.length && <tr><td colSpan="4">No products found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
