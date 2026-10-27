import { useState } from "react"
import { Link } from "react-router-dom"

function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  function handleSignup(event) {
    event.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.")
      return
    }

    setError("Sign-up UI is ready. Account creation will be added later.")
  }

  return (
    <div className="signup-page">
      <div className="signup-layout">
        <div className="signup-visual">
          <Link to="/" className="signup-brand">
            NOIRÉ
          </Link>

          <div className="signup-visual-content">
            <p className="signup-eyebrow">DISCOVER YOUR SIGNATURE</p>

            <h1>
              A new chapter
              <br />
              in fragrance.
            </h1>

            <p>
              Create your NOIRÉ account and make room for fragrances that tell
              your story.
            </p>
          </div>

          <span className="signup-visual-note">
            THE ART OF BEING REMEMBERED
          </span>
        </div>

        <div className="signup-form-side">
          <div className="signup-form-wrapper">
            <Link to="/" className="signup-mobile-brand">
              NOIRÉ
            </Link>

            <p className="signup-eyebrow">JOIN THE WORLD OF NOIRÉ</p>

            <h2>Create your account</h2>

            <p className="signup-description">
              Your next signature scent starts here.
            </p>

            <form onSubmit={handleSignup}>
              <div className="signup-field">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-password">Password</label>

                <div className="signup-password-input">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="signup-field-hint">Use at least 8 characters.</p>
              </div>

              <div className="signup-field">
                <label htmlFor="signup-confirm-password">
                  Confirm password
                </label>

                <div className="signup-password-input">
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <label className="signup-terms">
                <input type="checkbox" required />
                <span>I agree to the terms and conditions.</span>
              </label>

              {error && (
                <p className="signup-message" role="status">
                  {error}
                </p>
              )}

              <button className="signup-submit" type="submit">
                Create Account <span aria-hidden="true">↗</span>
              </button>
            </form>

            <p className="signup-login">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <p className="signup-bottom-note">THE ART OF FRAGRANCE</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
