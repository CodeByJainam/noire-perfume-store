
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage("")
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000"

      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed.")
      }

      setMessage("Your password has been updated successfully.")

      setTimeout(() => {
        navigate("/login")
      }, 2000)
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
              <p className="login-eyebrow">ACCOUNT SECURITY</p>
              <h1>
                A new chapter.
                <br />
                A new beginning.
              </h1>
              <p>
                Create a new password and return to your world
                of signature fragrances.
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
              <h2>Reset your password</h2>

              <p className="login-description">
                Choose a new password for your NOIRÉ account.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="new-password">New password</label>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="confirm-password">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                  />
                </div>

                <label className="reset-show-password">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(event.target.checked)
                    }
                  />
                  Show password
                </label>

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
                  {loading ? "Updating..." : "Update Password"}
                  {!loading && <span aria-hidden="true">↗</span>}
                </button>
              </form>

              <p className="login-signup">
                Remember your password? <Link to="/login">Sign in</Link>
              </p>

              <p className="login-bottom-note">
                YOUR SIGNATURE AWAITS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
