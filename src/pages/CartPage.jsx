import { Link, useNavigate } from "react-router-dom"

const formatPrice = (value) => `₹${Number(value).toLocaleString("en-IN")}`

function CartPage({ cart, onIncrease, onDecrease, onRemove, onClearCart }) {
  const navigate = useNavigate()
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )
  return (
    <main className="cart-page">
      <div className="container-main cart-page-container">
        <div className="cart-page-heading">
          <div>
            <span className="section-eyebrow">
              <i /> Your NOIRÉ selection
            </span>
            <h1>
              Your <em>bag.</em>
            </h1>
            <p>A considered choice. Review your fragrance selection below.</p>
          </div>
          <Link to="/collection" className="text-link">
            Continue exploring <span>↗</span>
          </Link>
        </div>
        {cart.length === 0 ? (
          <section className="cart-page-empty">
            <div className="empty-cart-orbit">
              <span>N.</span>
            </div>
            <span className="section-eyebrow">
              <i /> Room for something special
            </span>
            <h2>
              Your bag is <em>waiting.</em>
            </h2>
            <p>
              Discover a scent that feels like you and it will find its place
              here.
            </p>
            <Link to="/collection" className="button button-dark">
              Explore the collection <span>↗</span>
            </Link>
          </section>
        ) : (
          <div className="cart-page-layout">
            <section
              className="cart-page-items"
              aria-labelledby="cart-items-title"
            >
              <div className="cart-page-items-heading">
                <div>
                  <span className="section-eyebrow">
                    <i /> Selected for you
                  </span>
                  <h2 id="cart-items-title">
                    Your fragrances <span>({totalItems})</span>
                  </h2>
                </div>
                <button
                  className="clear-cart-btn"
                  type="button"
                  onClick={onClearCart}
                >
                  Clear bag <span>×</span>
                </button>
              </div>
              {cart.map((item) => (
                <article key={item.id} className="cart-page-item">
                  <div className="cart-page-item-image">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80"
                      }}
                    />
                  </div>
                  <div className="cart-page-item-info">
                    <span>{item.category} fragrance</span>
                    <h3>{item.name}</h3>
                    <p>{item.notes || "A signature scent by NOIRÉ."}</p>
                    <strong>{formatPrice(item.price)}</strong>
                  </div>
                  <div
                    className="cart-page-quantity"
                    aria-label={`Quantity for ${item.name}`}
                  >
                    <button
                      type="button"
                      onClick={() => onDecrease(item.id, item.quantity)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onIncrease(item.id, item.quantity)}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-page-item-total">
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                    <button type="button" onClick={() => onRemove(item.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>
            <aside
              className="cart-page-summary"
              aria-labelledby="order-summary-title"
            >
              <span className="section-eyebrow">
                <i /> The details
              </span>
              <h2 id="order-summary-title">A good choice.</h2>
              <div className="summary-list">
                <div className="cart-summary-line">
                  <span>Items</span>
                  <strong>{totalItems}</strong>
                </div>
                <div className="cart-summary-line">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className="cart-summary-line">
                  <span>Shipping</span>
                  <strong className="free-text">Complimentary</strong>
                </div>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-total-row">
                <span>Total</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <button
                type="button"
                className="cart-checkout-btn"
                onClick={() => navigate("/checkout")}
                disabled={cart.length === 0}
              >
                <span>Continue to checkout</span>
                <span>↗</span>
              </button>

              <p className="cart-secure-note">
                <span>✳</span> Review your order before proceeding to payment.
              </p>
              <div className="cart-summary-promise">
                <span>NOIRÉ</span>
                <p>
                  Fragrance is personal. Thank you for making room for ours.
                </p>
              </div>
            </aside>
          </div>
        )}
        <div className="cart-trust-row">
          <div>
            <span>01</span>
            <p>
              Thoughtfully selected
              <br />
              <small>Made for your daily ritual</small>
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              Complimentary shipping
              <br />
              <small>On every fragrance order</small>
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              Here to help
              <br />
              <small>Questions? Get in touch</small>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CartPage
