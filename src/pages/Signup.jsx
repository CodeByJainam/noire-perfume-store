import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignup(event) {
    event.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setLoading(true)

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      navigate("/")
    } catch (err) {
      setError(err.message || "Account creation failed. Please try again.")
    } finally {
      setLoading(false)
    }
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
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
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
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                    onClick={() => setShowPassword((previous) => !previous)}
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
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
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
                <p className="signup-message" role="alert">
                  {error}
                </p>
              )}

              <button
                className="signup-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <span aria-hidden="true">↗</span>}
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
