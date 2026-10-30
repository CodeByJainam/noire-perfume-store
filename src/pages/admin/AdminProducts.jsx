
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const API = "/api/admin/products";
const emptyForm = { name: "", price: "", description: "", image: "", collection: "", slug: "", stock: "0" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const request = async (url, options = {}) => {
    const res = await fetch(url, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const load = useCallback(async () => {
    try {
      const data = await request(API);
      setProducts(Array.isArray(data) ? data : data.products || []);
      setError("");
    } catch (e) { setError(e.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      await request(editing ? `${API}/${editing}` : API, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const edit = (p) => {
    setEditing(p._id || p.id);
    setForm({
      name: p.name || p.title || "",
      price: String(p.price ?? ""),
      description: p.description || "",
      image: p.image || p.images?.[0] || "",
      collection: p.collection || "",
      slug: p.slug || "",
      stock: String(p.stock ?? 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name || p.title || "this product"}?`)) return;
    try {
      await request(`${API}/${p._id || p.id}`, { method: "DELETE" });
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="noire-admin">
      <AdminSidebar />
      <main className="noire-main">
        <header className="noire-header">
          <div><p className="noire-eyebrow">CATALOGUE</p><h1>Products</h1><p>Manage the NOIRÉ collection.</p></div>
        </header>

        {error && <p className="noire-error">{error}</p>}

        <section className="noire-panel">
          <h2>{editing ? "Edit product" : "Add product"}</h2>
          <form className="noire-form" onSubmit={submit}>
            {[
              ["name", "Product name", true],
              ["price", "Price (₹)", true],
              ["collection", "Collection", false],
              ["slug", "Slug", false],
              ["image", "Image URL", false],
              ["stock", "Stock quantity", true],
            ].map(([name, label, required]) => (
              <label key={name}>{label}
                <input name={name} value={form[name]} onChange={change}
                  required={required}
                  type={["price", "stock"].includes(name) ? "number" : "text"}
                  min={["price", "stock"].includes(name) ? "0" : undefined}
                  step={name === "price" ? "0.01" : name === "stock" ? "1" : undefined}
                />
              </label>
            ))}
            <label className="noire-wide">Description
              <textarea name="description" value={form.description} onChange={change} rows="3" />
            </label>
            <div className="noire-form-actions">
              <button className="noire-button" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create product"}</button>
              {editing && <button type="button" className="noire-button secondary" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
            </div>
          </form>
        </section>

        <section className="noire-panel">
          <h2>Product catalogue</h2>
          <div className="noire-table-wrap">
            <table className="noire-table">
              <thead><tr><th>Product</th><th>Price</th><th>Collection</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>{p.name || p.title}</td>
                    <td>₹{Number(p.price || 0).toLocaleString("en-IN")}</td>
                    <td>{p.collection || "—"}</td>
                    <td>{p.stock ?? 0}</td>
                    <td className="noire-actions">
                      <button onClick={() => edit(p)}>Edit</button>
                      <button className="danger" onClick={() => remove(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!products.length && <tr><td colSpan="5">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
