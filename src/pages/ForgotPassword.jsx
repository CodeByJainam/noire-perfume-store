import { useState } from "react"
import { Link } from "react-router-dom"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)

    try {
      // Backend API integration will be added here.
      setMessage(
        "The password reset feature is not connected yet. Please try again later.",
      )
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="container-main">
        <div className="login-layout">
          <div className="login-visual">
            <div className="login-brand">NOIRÉ</div>

            <div className="login-visual-content">
              <p className="login-eyebrow">ACCOUNT RECOVERY</p>
              <h1>
                A fresh start.
                <br />
                A familiar scent.
              </h1>
              <p>
                Let's help you return to your world of signature fragrances.
              </p>
            </div>

            <span className="login-visual-note">
              THE ART OF BEING REMEMBERED
            </span>
          </div>

          <div className="login-form-side">
            <div className="login-form-wrapper">
              <div className="login-mobile-brand">NOIRÉ</div>

              <p className="login-eyebrow">PASSWORD RECOVERY</p>
              <h2>Forgot your password?</h2>

              <p className="login-description">
                Enter your registered email address to begin resetting your
                password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="forgot-email">Email address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                {message && (
                  <p className="login-message" role="status">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="login-message" role="alert">
                    {error}
                  </p>
                )}

                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : "Reset Password"}
                  {!loading && <span aria-hidden="true">↗</span>}
                </button>
              </form>

              <p className="login-signup">
                Remember your password? <Link to="/login">Sign in</Link>
              </p>

              <p className="login-bottom-note">YOUR SIGNATURE AWAITS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
