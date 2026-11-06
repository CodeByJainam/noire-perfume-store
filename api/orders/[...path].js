// Dedicated Vercel entrypoint for /api/orders/* routes.
// Keep all order business logic and authentication in the existing Express app.
import app from "../../server/server.js";

export default function ordersHandler(req, res) {
  console.log("ORDERS VERCEL CATCH-ALL:", req.method, req.url);
  return app(req, res);
}
