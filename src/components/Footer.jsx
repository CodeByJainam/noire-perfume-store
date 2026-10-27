import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-main">
        <div className="footer-main">
          <div className="footer-brand-block">
            <Link to="/" className="footer-logo">
              NOIRÉ<span>®</span>
            </Link>
            <p>
              Fragrance is personal.
              <br />
              Make it unmistakably yours.
            </p>
          </div>
          <div className="footer-column">
            <span className="footer-heading">Explore</span>
            <Link to="/products">Shop all</Link>
            <Link to="/collection">Collections</Link>
            <Link to="/about">Our story</Link>
            <Link to="/blog">The scent journal</Link>
          </div>
          <div className="footer-column">
            <span className="footer-heading">Customer care</span>
            <Link to="/about">Contact & story</Link>
            <Link to="/cart">Your bag</Link>
            <Link to="/">Shipping & returns</Link>
            <Link to="/">FAQs</Link>
          </div>
          <div className="footer-newsletter">
            <span className="footer-heading">A note from NOIRÉ</span>
            <p>New scents, rituals and stories. Nothing more, nothing less.</p>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="footer-email-form"
            >
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Your email address"
                required
              />
              <button type="submit" aria-label="Subscribe">
                ↗
              </button>
            </form>
            <small>
              Newsletter sign-up is a visual demo and is not connected yet.
            </small>
          </div>
        </div>
      </div>

      <div className="footer-bottom container-main">
        <span>© {new Date().getFullYear()} NOIRÉ. All rights reserved.</span>
        <span>Made for the moments that stay.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}

export default Footer
