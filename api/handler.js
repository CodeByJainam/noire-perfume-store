import app from "../server/server.js";

/**
 * Vercel's non-Next.js file-system functions do not provide Next.js-style
 * multi-segment catch-all behavior. vercel.json rewrites every /api/* request
 * to this single function and passes the original API path in ?path=.
 */
export default function handler(req, res) {
  const requestUrl = new URL(req.url || "/api/handler", "http://localhost");
  const apiPath = requestUrl.searchParams.get("path");

  if (!apiPath) {
    return res.status(400).json({ message: "Missing API route path." });
  }

  const segments = apiPath.split("/");
  if (
    segments.some((segment) => !segment || segment === "." || segment === "..") ||
    !/^[a-zA-Z0-9._~-]+$/.test(apiPath.replaceAll("/", ""))
  ) {
    return res.status(400).json({ message: "Invalid API route path." });
  }

  requestUrl.searchParams.delete("path");
  const remainingQuery = requestUrl.searchParams.toString();
  req.url = `/api/${apiPath}${remainingQuery ? `?${remainingQuery}` : ""}`;

  return app(req, res);
}
