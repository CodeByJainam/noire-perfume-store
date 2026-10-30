const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

// In local development the API runs on port 5000. In a same-origin Vercel
// deployment, /api is served by the project's serverless API function.
export const API_BASE_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin)
).replace(/\/+$/, "")

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}
