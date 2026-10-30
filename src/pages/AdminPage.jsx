import { useCallback, useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiUrl } from "../lib/api"

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

function AdminPage() {
  const { user, isAuthenticated, authLoading } = useAuth()
  const [summary, setSummary] = useState(null)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [savingProduct, setSavingProduct] = useState(false)
  const [editingProductId, setEditingProductId] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    price: "",
    category: "Fragrance",
    description: "",
    image: "",
    size: "100 ml",
    concentration: "Eau De Parfum",
    notes: "",
    badge: "",
  })

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(apiUrl(path), {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok)
      throw new Error(data.message || `Request failed (${response.status})`)
    return data
  }, [])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [stats, orderData, userData, productData] = await Promise.all([
        request("/api/admin/summary"),
        request("/api/admin/orders"),
        request("/api/admin/users"),
        request("/api/admin/products"),
      ])
      setSummary(stats)
      setOrders(orderData.orders || [])
      setUsers(userData.users || [])
      setProducts(productData.products || [])
    } catch (err) {
      setError(err.message || "Unable to load admin dashboard.")
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "admin")
      loadDashboard()
  }, [authLoading, isAuthenticated, user?.role, loadDashboard])

  if (authLoading)
    return (
      <main className="admin-page">
        <div className="container-main">
          <p>Checking administrator access...</p>
        </div>
      </main>
    )
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: "/admin" }} replace />
  if (user?.role !== "admin")
    return (
      <main className="admin-page">
        <div className="container-main">
          <div className="admin-container">
            <span className="admin-eyebrow">NOIRÉ / RESTRICTED</span>
            <h1>Administrator access required</h1>
            <p>
              This page is only available to the configured NOIRÉ administrator.
            </p>
            <Link to="/account">Return to My Account</Link>
          </div>
        </div>
      </main>
    )

  const updateOrderStatus = async (orderId, orderStatus) => {
    setNotice("")
    setError("")
    try {
      await request(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus }),
      })
      setOrders((current) =>
        current.map((order) =>
          order._id === orderId ? { ...order, orderStatus } : order,
        ),
      )
      setNotice("Order status updated.")
    } catch (err) {
      setError(err.message)
    }
  }

  const resetProductForm = () => {
    setProductForm({
      id: "",
      name: "",
      price: "",
      category: "Fragrance",
      description: "",
      image: "",
      size: "100 ml",
      concentration: "Eau De Parfum",
      notes: "",
      badge: "",
    })
    setEditingProductId("")
    setImageFile(null)
  }

  const createProduct = async (event) => {
    event.preventDefault()
    setSavingProduct(true)
    setError("")
    setNotice("")
    try {
      let image = productForm.image
      if (imageFile) {
        setUploadingImage(true)
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () =>
            reject(new Error("Could not read the selected image."))
          reader.readAsDataURL(imageFile)
        })
        const uploadData = await request("/api/admin/uploads/product-image", {
          method: "POST",
          body: JSON.stringify({ dataUrl }),
        })
        image = uploadData.image
      }
      const payload = {
        ...productForm,
        image,
        price: Number(productForm.price),
      }
      if (editingProductId) {
        await request(
          `/api/admin/products/${encodeURIComponent(editingProductId)}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        )
        setNotice("Product updated successfully.")
      } else {
        await request("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        setNotice("Product added successfully.")
      }
      resetProductForm()
      await loadDashboard()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingProduct(false)
      setUploadingImage(false)
    }
  }

  const editProduct = (product) => {
    setEditingProductId(product.id)
    setImageFile(null)
    setProductForm({
      id: product.id || "",
      name: product.name || "",
      price: String(product.price ?? ""),
      category: product.category || "Fragrance",
      description: product.description || "",
      image: product.image || "",
      size: product.size || "100 ml",
      concentration: product.concentration || "Eau De Parfum",
      notes: product.notes || "",
      badge: product.badge || "",
    })
    setError("")
    setNotice("Editing product. Save changes when finished.")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product from the catalogue?")) return
    setError("")
    setNotice("")
    try {
      await request(`/api/admin/products/${encodeURIComponent(productId)}`, {
        method: "DELETE",
      })
      setProducts((current) =>
        current.filter((product) => product.id !== productId),
      )
      setSummary((current) =>
        current
          ? { ...current, products: Math.max(0, current.products - 1) }
          : current,
      )
      setNotice("Product deleted.")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="admin-page">
      <div className="container-main">
        <div className="admin-container">
          <div className="admin-topline">
            <span className="admin-eyebrow">NOIRÉ / ADMINISTRATION</span>
            <Link to="/account">← My Account</Link>
          </div>
          <div className="admin-heading">
            <div>
              <h1>Admin Dashboard</h1>
              <p>
                Welcome, {user.name}. Manage the NOIRÉ store from one place.
              </p>
            </div>
            <button type="button" onClick={loadDashboard}>
              Refresh data
            </button>
          </div>
          {error && (
            <p className="admin-alert admin-alert-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="admin-alert" role="status">
              {notice}
            </p>
          )}
          {loading ? (
            <p className="admin-loading">Loading dashboard data...</p>
          ) : (
            <>
              <section className="admin-stats">
                <article>
                  <span>Total customers / accounts</span>
                  <strong>{summary?.users ?? 0}</strong>
                </article>
                <article>
                  <span>Products</span>
                  <strong>{summary?.products ?? 0}</strong>
                </article>
                <article>
                  <span>Orders</span>
                  <strong>{summary?.orders ?? 0}</strong>
                </article>
                <article>
                  <span>Paid revenue</span>
                  <strong>{money(summary?.revenue)}</strong>
                </article>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-eyebrow">CATALOGUE</span>
                    <h2>
                      {editingProductId ? "Edit product" : "Add a product"}
                    </h2>
                  </div>
                </div>
                <form className="admin-product-form" onSubmit={createProduct}>
                  <label>
                    Product ID *
                    <input
                      value={productForm.id}
                      onChange={(e) =>
                        setProductForm({ ...productForm, id: e.target.value })
                      }
                      placeholder="e.g. noir-oud-100"
                      required
                      disabled={Boolean(editingProductId)}
                    />
                  </label>
                  <label>
                    Product name *
                    <input
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Price (INR) *
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Category
                    <input
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Product image (JPG, PNG, WEBP, AVIF — max 5 MB)
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />
                    <small>
                      Choose a file to upload, or keep the current image URL
                      below.
                    </small>
                  </label>
                  <label>
                    Image URL (optional)
                    <input
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image: e.target.value,
                        })
                      }
                      placeholder="https://... or uploaded image URL"
                    />
                  </label>
                  <label>
                    Size
                    <input
                      value={productForm.size}
                      onChange={(e) =>
                        setProductForm({ ...productForm, size: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Concentration
                    <input
                      value={productForm.concentration}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          concentration: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Fragrance notes
                    <input
                      value={productForm.notes}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Oud, rose, amber"
                    />
                  </label>
                  <label>
                    Product badge
                    <input
                      value={productForm.badge}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          badge: e.target.value,
                        })
                      }
                      placeholder="Bestseller, New"
                    />
                  </label>
                  <label>
                    Collection Name
                    <input
                      value={productForm.badge}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          badge: e.target.value,
                        })
                      }
                      placeholder="Collection"
                    />
                  </label>
                  <label className="admin-form-wide">
                    Description
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      rows="2"
                    />
                  </label>
                  <div className="admin-form-wide">
                    <button
                      type="submit"
                      disabled={savingProduct || uploadingImage}
                    >
                      {uploadingImage
                        ? "Uploading image..."
                        : savingProduct
                          ? "Saving product..."
                          : editingProductId
                            ? "Save product changes"
                            : "Add product to store"}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        className="admin-cancel-edit"
                        onClick={resetProductForm}
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-eyebrow">FULFILMENT</span>
                    <h2>All orders ({orders.length})</h2>
                  </div>
                </div>
                {orders.length === 0 ? (
                  <p className="admin-empty">No orders have been placed yet.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Payment</th>
                          <th>Order status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              <strong>{order.orderNumber}</strong>
                              <small>
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-IN",
                                )}
                              </small>
                            </td>
                            <td>
                              {order.customer?.name ||
                                order.user?.name ||
                                "Customer"}
                              <small>
                                {order.customer?.email ||
                                  order.user?.email ||
                                  ""}
                              </small>
                            </td>
                            <td>{money(order.total)}</td>
                            <td>
                              <span
                                className={`admin-pill ${order.paymentStatus === "paid" ? "is-paid" : ""}`}
                              >
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td>
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  updateOrderStatus(order._id, e.target.value)
                                }
                                aria-label={`Status for order ${order.orderNumber}`}
                              >
                                <option value="placed">Placed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-eyebrow">CUSTOMER ACCESS</span>
                    <h2>Registered accounts ({users.length})</h2>
                  </div>
                </div>
                {users.length === 0 ? (
                  <p className="admin-empty">No registered accounts found.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((account) => (
                          <tr key={account._id}>
                            <td>{account.name}</td>
                            <td>{account.email}</td>
                            <td>
                              <span
                                className={`admin-pill ${account.role === "admin" ? "is-admin" : ""}`}
                              >
                                {account.role || "customer"}
                              </span>
                            </td>
                            <td>
                              {new Date(account.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-eyebrow">PRODUCT MANAGEMENT</span>
                    <h2>Store products ({products.length})</h2>
                  </div>
                </div>
                {products.length === 0 ? (
                  <p className="admin-empty">No products found in MongoDB.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>ID</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id || product.id}>
                            <td>
                              <div className="admin-product-cell">
                                {product.image && (
                                  <img src={product.image} alt="" />
                                )}
                                <span>{product.name}</span>
                              </div>
                            </td>
                            <td>{product.id}</td>
                            <td>{money(product.price)}</td>
                            <td>
                              <div className="admin-product-actions">
                                <button
                                  className="admin-edit-product-button"
                                  type="button"
                                  onClick={() => editProduct(product)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="admin-delete-button"
                                  type="button"
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default AdminPage
