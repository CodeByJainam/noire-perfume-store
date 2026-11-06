// Dedicated Vercel entrypoint for Razorpay payment endpoints.
// Keep payment creation and verification logic in the shared Express app.
import app from "../../server/server.js";

export default function paymentsHandler(req, res) {
  console.log("PAYMENTS VERCEL ENTRYPOINT:", req.method, req.url);
  return app(req, res);
}
