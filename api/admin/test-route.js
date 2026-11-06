// Exact Vercel route used to verify Admin API routing.
// The response is still produced by the existing Express route in server.js.
import app from "../../server/server.js";

export default function adminTestHandler(req, res) {
  console.log("ADMIN TEST VERCEL ENTRYPOINT:", req.method, req.url);
  return app(req, res);
}
