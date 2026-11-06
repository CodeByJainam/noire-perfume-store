// Dedicated Vercel entrypoint for the customer's order-history endpoint.
// Forward to the existing Express route so authentication and MongoDB logic
// remain centralized in server/server.js.
import app from "../../server/server.js";

export default function myOrdersHandler(req, res) {
  console.log("ORDERS VERCEL ENTRYPOINT:", req.method, req.url);
  return app(req, res);
}
