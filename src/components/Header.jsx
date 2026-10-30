import { useEffect, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const links = [
  { label: "Home", to: "/", end: true },
  { label: "Shop", to: "/products" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Collection", to: "/collections" },
]

function Header({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const location = useLocation()

  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen)

    return () => {
      document.body.classList.remove("menu-is-open")
    }
  }, [menuOpen])

  const handleLogout = async () => {
    if (loggingOut) return

    try {
      setLoggingOut(true)
      await logout()
      setMenuOpen(false)
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <p>
          A considered scent for every version of you <span>—</span> Discover
          NOIRÉ
        </p>
      </div>

      <div className="header-shell">
        <div className="container-main">
          <div className="header-inner">
            <Link to="/" className="site-logo" aria-label="NOIRÉ home">
              NOIRÉ<span>®</span>
            </Link>

            <nav className="desktop-nav" aria-label="Main navigation">
              {links.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `nav-link${isActive ? " active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="header-actions">
              <Link
                to="/products"
                className="header-search-link"
                aria-label="Explore perfumes"
              >
                <span className="search-glyph" />
                <span className="header-search-label">Discover</span>
              </Link>

              <Link
                to="/cart"
                className="header-cart-link"
                aria-label={`Shopping bag with ${cartCount} items`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5.5 8h13l1 12h-15l1-12Z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                <span>Bag</span>
                <span className="header-cart-count">{cartCount}</span>
              </Link>

              {isAuthenticated ? (
                <Link to="/account" className="header-login">
                  My Account
                </Link>
              ) : (
                <Link to="/login" className="header-login">
                  Login
                </Link>
              )}
            </div>

            <button
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`mobile-nav-panel${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-inner">
          <span className="section-eyebrow">Explore NOIRÉ</span>

          <nav aria-label="Mobile navigation">
            {links.map((link, index) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className="mobile-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <span>{link.label}</span>
                <small>{String(index + 1).padStart(2, "0")}</small>
              </NavLink>
            ))}

            <NavLink
              to="/cart"
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <span>Your bag</span>
              <small>{String(cartCount).padStart(2, "0")}</small>
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/account"
                  className="header-login-mobile"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>My Account</span>
                </NavLink>

                <button
                  type="button"
                  className="header-login-mobile mobile-logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="header-login-mobile"
                onClick={() => setMenuOpen(false)}
              >
                <span>Login / Sign Up</span>
              </Link>
            )}
          </nav>

          <p>Find the scent that feels like you.</p>
        </div>
      </div>
    </header>
  )
}

export default Header
