
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";


const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

const getProduct = (item) => item.product || item;

const getQuantity = (item) => Number(item.quantity || 1);

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const items = useMemo(
    () =>
      (cart || []).map((item) => ({
        product: getProduct(item),
        quantity: getQuantity(item),
      })),
    [cart]
  );

  // This total is for display only.
  // The backend independently calculates the payable amount.
  const total = items.reduce((sum, item) => {
    return (
      sum +
      Number(item.product.price || 0) * item.quantity
    );
  }, 0);

  useEffect(() => {
    loadRazorpay();
  }, []);

  const updateCustomer = (event) => {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    setError("");

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !customer.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
      !/^\+?[0-9\s()-]{8,20}$/.test(customer.phone)
    ) {
      setError("Please enter a valid name, email and phone number.");
      return;
    }

    setLoading(true);

    try {
      const scriptReady = await loadRazorpay();

      if (!scriptReady) {
        throw new Error("Payment window could not load. Please retry.");
      }

      const response = await fetch(
        `${API_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map(({ product, quantity }) => ({
              id: product.id,
              quantity,
            })),
          }),
        }
      );

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.message || "Could not create order.");
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "NOIRÉ",
        description: "Your fragrance order",
        order_id: order.orderId,
        prefill: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          contact: customer.phone.trim(),
        },
        theme: {
          color: "#702c38",
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/api/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentResponse),
              }
            );

            const verification = await verifyResponse.json();

            if (!verifyResponse.ok || !verification.verified) {
              throw new Error(
                verification.message ||
                  "Payment has not been confirmed yet."
              );
            }

            // Clear the cart only after server verification succeeds.
            clearCart();

            navigate("/order-success", {
              replace: true,
              state: {
                orderId: verification.orderId,
                paymentId: verification.paymentId,
              },
            });
          } catch (verificationError) {
            setError(verificationError.message);
            setLoading(false);
          }
        },
      });

      razorpay.on("payment.failed", (failure) => {
        setError(
          failure.error?.description ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (paymentError) {
      setError(paymentError.message || "Something went wrong.");
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="noire-checkout">
        <div className="noire-checkout-empty">
          <span className="noire-checkout-eyebrow">
            NOIRÉ / YOUR ORDER
          </span>
          <h1>Your cart is waiting.</h1>
          <p>Add a fragrance to begin your order.</p>
          <button
            type="button"
            className="noire-checkout-button"
            onClick={() => navigate("/shop")}
          >
            Explore fragrances
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="noire-checkout">
      <div className="noire-checkout-container">
        <div className="noire-checkout-heading">
          <span className="noire-checkout-eyebrow">
            NOIRÉ / SECURE CHECKOUT
          </span>
          <h1>Complete your order.</h1>
          <p>
            A considered choice, delivered to your door.
          </p>
        </div>

        <div className="noire-checkout-grid">
          <form
            className="noire-checkout-form"
            onSubmit={handlePayment}
          >
            <section className="noire-checkout-section">
              <span className="noire-checkout-step">01</span>
              <div>
                <h2>Your details</h2>
                <p>
                  Enter your contact details for payment.
                </p>
              </div>
            </section>

            <label className="noire-checkout-field">
              Full name
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={customer.name}
                onChange={updateCustomer}
                required
              />
            </label>

            <label className="noire-checkout-field">
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={customer.email}
                onChange={updateCustomer}
                required
              />
            </label>

            <label className="noire-checkout-field">
              Phone number
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={customer.phone}
                onChange={updateCustomer}
                required
              />
            </label>

            <section className="noire-checkout-section">
              <span className="noire-checkout-step">02</span>
              <div>
                <h2>Payment</h2>
                <p>
                  Complete your payment securely through Razorpay.
                </p>
              </div>
            </section>

            {error && (
              <p className="noire-checkout-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="noire-checkout-button"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : `Pay ${formatPrice(total)}`}
            </button>

            <p className="noire-checkout-note">
              Your payment will be confirmed only after server
              verification.
            </p>
          </form>

          <aside className="noire-order-summary">
            <span className="noire-checkout-eyebrow">
              YOUR SELECTION
            </span>
            <h2>Order summary</h2>

            <div className="noire-order-items">
              {items.map(({ product, quantity }, index) => (
                <div
                  className="noire-order-item"
                  key={product.id ?? index}
                >
                  <div className="noire-order-item-image">
                    <img
                      src={product.image || product.imageUrl}
                      alt={product.name || "NOIRÉ fragrance"}
                    />
                  </div>

                  <div className="noire-order-item-details">
                    <h3>{product.name}</h3>
                    <p>Quantity: {quantity}</p>
                    <span>
                      {formatPrice(
                        Number(product.price || 0) * quantity
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="noire-order-total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <p className="noire-order-disclaimer">
              Final payment amount is calculated and validated
              by the NOIRÉ server.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
