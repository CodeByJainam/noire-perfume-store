import { useState } from "react"
import { Link } from "react-router-dom"
function Login() {
  const [showPassword, setShowPassword] = useState(false)

  function handleLogin(event) {
    event.preventDefault()
    // Frontend UI only — authentication baad mein.
  }

  return (
    <div className="login-page">
      <div className="container-main">
        <div className="login-layout">
          <div className="login-visual">
            <div className="login-brand">NOIRÉ</div>

            <div className="login-visual-content">
              <p className="login-eyebrow">THE ART OF FRAGRANCE</p>

              <h1>
                Your scent.
                <br />
                Your signature.
              </h1>

              <p>
                Discover fragrances that feel personal, timeless, and
                unmistakably yours.
              </p>
            </div>

            <span className="login-visual-note">A WORLD OF YOUR OWN</span>
          </div>

          <div className="login-form-side">
            <div className="login-form-wrapper">
              <div className="login-mobile-brand">NOIRÉ</div>

              <p className="login-eyebrow">WELCOME BACK</p>

              <h2>Sign in to NOIRÉ</h2>

              <p className="login-description">
                Return to your collection and discover your next signature
                fragrance.
              </p>

              <form onSubmit={handleLogin}>
                <div className="login-field">
                  <label htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="login-field">
                  <div className="login-password-heading">
                    <label htmlFor="login-password">Password</label>

                    <a href="/forgot-password">Forgot password?</a>
                  </div>

                  <div className="login-password-input">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <label className="login-remember">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button className="login-submit" type="submit">
                  Sign In <span aria-hidden="true">↗</span>
                </button>
              </form>

              <p className="login-signup">
                New to NOIRÉ? <Link to="/signup">Create an account</Link>
              </p>
              <p className="login-bottom-note">THE ART OF BEING REMEMBERED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
