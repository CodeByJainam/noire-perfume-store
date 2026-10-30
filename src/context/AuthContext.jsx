import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { apiUrl } from "../lib/api"

const AuthContext = createContext(null)

async function authRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.")
  }

  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Restore the login session when the app opens or refreshes.
  const updateUser = useCallback((nextUser) => {
    setUser(nextUser || null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const data = await authRequest("/api/auth/me")
      setUser(data.user || null)
      return data.user || null
    } catch {
      setUser(null)
      return null
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Create a new account.
  const signup = useCallback(async ({ name, email, password }) => {
    const data = await authRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })

    setUser(data.user || null)
    return data
  }, [])

  // Log in to an existing account.
  const login = useCallback(async ({ email, password }) => {
    const data = await authRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    setUser(data.user || null)
    return data
  }, [])

  // Sign out and clear the server-side authentication cookie.
  const logout = useCallback(async () => {
    try {
      await authRequest("/api/auth/logout", {
        method: "POST",
      })
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isAuthenticated: Boolean(user),
        signup,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider")
  }

  return context
}
