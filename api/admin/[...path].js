// Dedicated Vercel entrypoint for all /api/admin/* requests.
// Keep the existing Express application and its authentication middleware.
import app from "../../server/server.js";

export default function adminHandler(req, res) {
  console.log("ADMIN VERCEL ENTRYPOINT:", req.method, req.url);
  return app(req, res);
}
