import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import "./App.css";

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

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const showToast = (message) => {
    setToast(message);

    // Clear any previous toast before showing the new one.
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const fetchCart = async () => {
    const response = await fetch("http://localhost:5000/api/cart");

    if (!response.ok) {
      throw new Error("Unable to load cart.");
    }

    const data = await response.json();
    const nextCart = Array.isArray(data) ? data : (data.cart ?? []);
    setCart(nextCart);
    return nextCart;
  };

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, cartResponse] = await Promise.all([
          fetch("http://localhost:5000/api/products"),
          fetch("http://localhost:5000/api/cart"),
        ]);

        if (!productsResponse.ok || !cartResponse.ok) {
          throw new Error("Unable to load store data.");
        }

        const productsData = await productsResponse.json();
        const cartData = await cartResponse.json();

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : (productsData.products ?? []),
        );

        setCart(Array.isArray(cartData) ? cartData : (cartData.cart ?? []));
      } catch (err) {
        console.error("Store loading error:", err);
        setError(
          "Unable to connect to the NOIRÉ store. Please check that your backend server is running.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, []);

  const addToCart = async (product) => {
    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to add product to cart.");
      }

      const data = await response.json();
      const nextCart = Array.isArray(data) ? data : (data.cart ?? []);
      setCart(nextCart);
      showToast(`${product.name} added to your bag`);
      return true;
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast("Could not add this product. Please try again.");
      return false;
    }
  };

  const increaseQuantity = async (productId, currentQuantity) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: currentQuantity + 1,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to update quantity.");
      }

      await fetchCart();
    } catch (err) {
      console.error("Increase quantity error:", err);
      showToast("Could not update quantity.");
    }
  };

  const decreaseQuantity = async (productId, currentQuantity) => {
    if (currentQuantity <= 1) {
      await removeFromCart(productId);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: currentQuantity - 1,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to update quantity.");
      }

      await fetchCart();
    } catch (err) {
      console.error("Decrease quantity error:", err);
      showToast("Could not update quantity.");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${productId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Unable to remove product.");
      }

      await fetchCart();
      showToast("Product removed from your bag");
    } catch (err) {
      console.error("Remove from cart error:", err);
      showToast("Could not remove this product.");
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to clear cart.");
      }

      await fetchCart();
      showToast("Your bag has been cleared");
    } catch (err) {
      console.error("Clear cart error:", err);
      showToast("Could not clear your bag.");
    }
  };

  const totalCartItems = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  if (loading) {
    return (
      <div className="app-status">
        <p>Loading NOIRÉ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-status">
        <p>{error}</p>
        <button
          className="app-status-btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header cartCount={totalCartItems} />

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
            element={<HomePage products={products} addToCart={addToCart} />}
          />

          <Route
            path="/products"
            element={<ProductsPage products={products} addToCart={addToCart} />}
          />

          <Route
            path="/shop"
            element={<ProductsPage products={products} addToCart={addToCart} />}
          />

          <Route
            path="/collection"
            element={<ProductsPage products={products} addToCart={addToCart} />}
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
              <CollectionDetails products={products} addToCart={addToCart} />
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProductDetails products={products} addToCart={addToCart} />
            }
          />
          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccess />} />

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
  );
}

export default App;
