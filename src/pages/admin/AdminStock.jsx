import { useCallback, useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { apiUrl } from "../../lib/api";

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(apiUrl("/api/admin/products"), { credentials: "include" });
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

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.name, p.title, p.collection, p.slug, p.id, p.brand]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [products, search]);

  const saveStock = async (id) => {
    const stock = Number(quantities[id]);
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number greater than or equal to zero.");
      return;
    }

    try {
      setSavingId(id);
      setError("");
      setMessage("");
      const r = await fetch(apiUrl(`/api/admin/products/${id}/stock`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || "Stock update failed");
      setProducts((old) => old.map((p) => (String(p._id || p.id) === String(id) ? { ...p, stock: d.product?.stock ?? stock } : p)));
      setQuantities((old) => ({ ...old, [id]: String(d.product?.stock ?? stock) }));
      setMessage(`${d.product?.name || "Product"} stock updated to ${d.product?.stock ?? stock}.`);
    } catch (e) { setError(e.message); }
    finally { setSavingId(null); }
  };

  const totalUnits = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const outOfStock = products.filter((p) => Number(p.stock || 0) === 0).length;

  return (
    <div className="noire-admin">
      <AdminSidebar />
      <main className="noire-main">
        <header className="noire-header">
          <div><p className="noire-eyebrow">INVENTORY CONTROL</p><h1>Stock</h1><p>Update inventory quantities saved in MongoDB.</p></div>
        </header>
        {error && <p className="noire-error">{error}</p>}
        {message && <p className="noire-success">{message}</p>}
        <section className="noire-stats noire-inventory-stats">
          <div className="noire-stat"><span>Total products</span><strong>{products.length}</strong><small>In your catalogue</small></div>
          <div className="noire-stat"><span>Total units in stock</span><strong>{totalUnits}</strong><small>Combined available quantity</small></div>
          <div className="noire-stat"><span>Sold out products</span><strong>{outOfStock}</strong><small>Products with zero stock</small></div>
        </section>
        <section className="noire-panel">
          <div className="noire-panel-heading noire-search-heading">
            <div>
              <h2>Manage inventory</h2>
              <p className="noire-search-count">Showing {filteredProducts.length} of {products.length} products. Current stock is the saved database quantity.</p>
            </div>
            <input
              className="noire-search-input"
              type="search"
              placeholder="Search product, collection, brand or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search inventory"
            />
          </div>
          {loading ? <p>Loading inventory…</p> : (
            <div className="noire-table-wrap">
              <table className="noire-table">
                <thead><tr><th>Product</th><th>Current stock</th><th>New quantity</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const id = p._id || p.id;
                    const stock = Number(p.stock ?? 0);
                    const newStock = Number(quantities[id] ?? stock);
                    const changed = String(quantities[id] ?? stock) !== String(stock);
                    return (
                      <tr key={id}>
                        <td>{p.name || p.title || "Unnamed product"}</td>
                        <td><span className={stock === 0 ? "noire-low-stock" : stock <= 10 ? "noire-low-stock" : "noire-status"}>{stock}</span></td>
                        <td>
                          <input
                            className="noire-stock-input"
                            type="number"
                            min="0"
                            step="1"
                            value={quantities[id] ?? "0"}
                            onChange={(e) => setQuantities((old) => ({ ...old, [id]: e.target.value }))}
                            aria-label={`New stock quantity for ${p.name || p.title || "product"}`}
                          />
                        </td>
                        <td>
                          <button className="noire-button small" disabled={savingId === id || !changed || !Number.isInteger(newStock) || newStock < 0} onClick={() => saveStock(id)}>
                            {savingId === id ? "Saving…" : "Save stock"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredProducts.length && <tr><td colSpan="4">{search ? "No products match your search." : "No products found."}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
