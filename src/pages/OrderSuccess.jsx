import { Link, useLocation } from "react-router-dom"

export default function OrderSuccess() {
  const { state } = useLocation()

  return (
    <main className="noire-checkout">
      <div className="noire-checkout-empty">
        <span className="noire-checkout-eyebrow">NOIRÉ / ORDER CONFIRMED</span>

        <h1>Thank you for your order.</h1>

        <p>Your payment has been verified successfully.</p>

        {state?.orderId && (
          <p>
            Order reference: <strong>{state.orderId}</strong>
          </p>
        )}

        {state?.paymentId && (
          <p>
            Payment reference: <strong>{state.paymentId}</strong>
          </p>
        )}

        <Link
          to="/shop"
          className="noire-checkout-button"
          style={{ textDecoration: "none" }}
        >
          Continue exploring
        </Link>
      </div>
    </main>
  )
}
