
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";
import "./pages/admin/Admin.css";

import Footer from "./components/Footer";
import Header from "./components/Header";

import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import ProductsPage from "./pages/ProductsPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import Collections from "./pages/Collections";
import CollectionDetails from "./pages/CollectionDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import BlogPageDetail from "./pages/BlogPageDetail";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";
import AccountPage from "./pages/AccountPage";
import ForgotPassword from "./pages/ForgotPassword";

import { apiUrl } from "./lib/api";

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStock from "./pages/admin/AdminStock";
import SuperAdminManagement from "./pages/admin/SuperAdminManagement";

const CART_STORAGE_KEY = "noire-cart";

function readSavedCart() {
  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(readSavedCart);
  const [toast, setToast] = useState("");
  const [apiNotice, setApiNotice] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timeoutId);

    showToast.timeoutId = window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.warn("Could not save NOIRÉ cart.", error);
    }
  }, [cart]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const healthResponse = await fetch(apiUrl("/api/health"));

        if (healthResponse.ok) {
          const health = await healthResponse.json();

          const notices = [];

          if (health.database !== "connected") {
            notices.push("MongoDB is disconnected.");
          }

          if (!health.razorpayConfigured) {
            notices.push("Razorpay keys are not configured.");
          }

          if (!cancelled) {
            setApiNotice(notices.join(" "));
          }
        }

        const response = await fetch(apiUrl("/api/products"));

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const payload = await response.json();
        const nextProducts = Array.isArray(payload)
          ? payload
          : payload.products;

        if (!Array.isArray(nextProducts)) {
          throw new Error("Invalid products response.");
        }

        if (!cancelled) {
          setProducts(nextProducts);
        }
      } catch (error) {
        console.error("API error:", error);

        if (!cancelled) {
          setApiNotice(
            "Products could not be loaded. Check the backend connection."
          );
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = (product) => {
    if (!product || product.id == null) {
      showToast("This fragrance could not be added.");
      return false;
    }

    const existing = cart.find(
      (item) => String(item.id) === String(product.id)
    );

    if (existing && Number(existing.quantity) >= 99) {
      showToast("Maximum quantity is 99.");
      return false;
    }

    setCart((current) => {
      const found = current.find(
        (item) => String(item.id) === String(product.id)
      );

      if (found) {
        return current.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity: Math.min(
                  99,
                  Number(item.quantity || 1) + 1
                ),
              }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    showToast(`${product.name} added to your bag`);
    return true;
  };

  const increaseQuantity = (productId, currentQuantity) => {
    if (Number(currentQuantity) >= 99) {
      showToast("Maximum quantity is 99.");
      return;
    }

    setCart((current) =>
      current.map((item) =>
        String(item.id) === String(productId)
          ? {
              ...item,
              quantity: Number(item.quantity || 1) + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (productId, currentQuantity) => {
    if (Number(currentQuantity) <= 1) {
      removeFromCart(productId);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        String(item.id) === String(productId)
          ? {
              ...item,
              quantity: Number(item.quantity || 1) - 1,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) =>
      current.filter(
        (item) => String(item.id) !== String(productId)
      )
    );

    showToast("Product removed from your bag");
  };

  const clearCart = () => {
    setCart([]);
    showToast("Your bag has been cleared");
  };

  const totalCartItems = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  return (
    <AuthProvider>
      <BrowserRouter>
        <Header cartCount={totalCartItems} />

        {apiNotice && (
          <div className="app-api-notice" role="status">
            <div className="container-main">{apiNotice}</div>
          </div>
        )}

        {toast && (
          <div className="toast-container" role="status">
            <div className="container-main">
              <div className="toast-flex">
                <span className="toast-message">{toast}</span>

                <button
                  type="button"
                  className="toast-close"
                  onClick={() => setToast("")}
                  aria-label="Close notification"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        <CartProvider value={{ cart, clearCart }}>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  products={products}
                  addToCart={addToCart}
                />
              }
            />

            <Route
              path="/products"
              element={
                <ProductsPage
                  products={products}
                  addToCart={addToCart}
                />
              }
            />

            <Route
              path="/shop"
              element={
                <ProductsPage
                  products={products}
                  addToCart={addToCart}
                />
              }
            />

            <Route
              path="/collection"
              element={
                <ProductsPage
                  products={products}
                  addToCart={addToCart}
                />
              }
            />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPageDetail />} />

            <Route
              path="/cart"
              element={
                <CartPage
                  cart={cart}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeFromCart}
                  onClearCart={clearCart}
                />
              }
            />

            <Route path="/collections" element={<Collections />} />

            <Route
              path="/collections/:slug"
              element={
                <CollectionDetails
                  products={products}
                  addToCart={addToCart}
                />
              }
            />

            <Route
              path="/product/:id"
              element={
                <ProductDetails
                  products={products}
                  addToCart={addToCart}
                />
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin and Super Admin dashboard */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/stock" element={<AdminStock />} />
            </Route>

            {/* Super Admin only */}
            <Route
              element={
                <AdminProtectedRoute
                  allowedRoles={["super_admin"]}
                />
              }
            >
              <Route
                path="/admin/management"
                element={<SuperAdminManagement />}
              />
            </Route>

            <Route
              path="*"
              element={
                <div className="app-status">
                  <h1>Page not found</h1>
                  <p>The page you are looking for doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </CartProvider>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
