
const mongoose = require("mongoose");
const Product = require("./models/Product");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Local development cart. It resets when the server restarts.
let cart = [];

const pendingOrders = new Map();
const verifiedOrders = new Map();

app.use(cors({ origin: CLIENT_URL }));

// Razorpay webhook must be registered before express.json().
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      return res.status(503).json({
        message: "Webhook secret is not configured.",
      });
    }

    if (!signature || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        message: "Invalid webhook request.",
      });
    }

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        message: "Invalid webhook signature.",
      });
    }

    let event;

    try {
      event = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({
        message: "Invalid webhook payload.",
      });
    }

    if (event.event === "order.paid") {
      const order = event.payload?.order?.entity;
      const payment = event.payload?.payment?.entity;
      const localOrder = order?.id
        ? pendingOrders.get(order.id)
        : null;

      if (
        localOrder &&
        payment?.order_id === order.id &&
        payment.status === "captured" &&
        Number(order.amount) === localOrder.amount &&
        Number(payment.amount) === localOrder.amount &&
        payment.currency === localOrder.currency
      ) {
        verifiedOrders.set(order.id, {
          ...localOrder,
          status: "paid",
          paymentId: payment.id,
          paidAt: new Date().toISOString(),
        });

        pendingOrders.delete(order.id);
      }
    }

    return res.status(200).json({ received: true });
  }
);

app.use(express.json());

let razorpay = null;

function getRazorpay() {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    throw new Error(
      "Missing Razorpay credentials. Check server/.env"
    );
  }

  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpay;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "NOIRÉ API" });
});
let mongoConnectionPromise = null;

async function ensureMongoConnected() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
}

app.use(async (_req, res, next) => {
  try {
    await ensureMongoConnected();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    res.status(503).json({
      message: "Database is temporarily unavailable.",
    });
  }
});
// Fetch products from MongoDB Atlas
app.get("/api/products", async (_req, res) => {
  try {
    const products = await Product.find().lean();
    return res.json(products);
  } catch (error) {
    console.error("Fetch products error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch products from database.",
    });
  }
});

// Get current cart
app.get("/api/cart", (_req, res) => {
  return res.json(cart);
});

// Add product to cart
app.post("/api/cart", async (req, res) => {
  try {
    const productId = req.body?.productId;

    // Compatibility with the existing frontend cart-fetch request.
    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      return res.json(cart);
    }

    // Find product in MongoDB instead of an undefined products array.
    const product = await Product.findOne({
      id: String(productId),
    }).lean();

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const existing = cart.find(
      (item) => String(item.id) === String(product.id)
    );

    if (existing) {
      if (existing.quantity >= 99) {
        return res.status(400).json({
          message: "Maximum quantity is 99.",
        });
      }

      existing.quantity += 1;
    } else {
      const {
        _id,
        __v,
        createdAt,
        updatedAt,
        ...cartProduct
      } = product;

      cart.push({
        ...cartProduct,
        quantity: 1,
      });
    }

    return res.status(201).json(cart);
  } catch (error) {
    console.error("Add to cart error:", error.message);

    return res.status(500).json({
      message: "Unable to add product to cart.",
    });
  }
});

// Update cart item quantity
app.put("/api/cart/:productId", (req, res) => {
  const item = cart.find(
    (entry) =>
      String(entry.id) === String(req.params.productId)
  );

  if (!item) {
    return res.status(404).json({
      message: "Cart item not found.",
    });
  }

  const quantity = Number(req.body?.quantity);

  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  ) {
    return res.status(400).json({
      message: "Quantity must be between 1 and 99.",
    });
  }

  item.quantity = quantity;
  return res.json(cart);
});

// Remove one cart item
app.delete("/api/cart/:productId", (req, res) => {
  const previousLength = cart.length;

  cart = cart.filter(
    (item) =>
      String(item.id) !== String(req.params.productId)
  );

  if (cart.length === previousLength) {
    return res.status(404).json({
      message: "Cart item not found.",
    });
  }

  return res.json(cart);
});

// Clear cart
app.delete("/api/cart", (_req, res) => {
  cart = [];
  return res.json(cart);
});

// Create Razorpay order
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { items } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    if (items.length > 100) {
      return res.status(400).json({
        message: "Too many cart items.",
      });
    }

    let amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        id: String(item.id),
      }).lean();

      const quantity = Number(item.quantity);

      if (
        !product ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity in cart.",
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price <= 0) {
        return res.status(500).json({
          message: "A product has an invalid configured price.",
        });
      }

      // Razorpay expects the amount in paise.
      const lineAmount = Math.round(price * 100) * quantity;

      if (!Number.isSafeInteger(lineAmount)) {
        return res.status(400).json({
          message: "Invalid order amount.",
        });
      }

      amount += lineAmount;

      orderItems.push({
        id: String(product.id),
        quantity,
      });
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invalid order total.",
      });
    }

    const client = getRazorpay();

    const receipt = `noire_${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 32)}`;

    const order = await client.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: { store: "NOIRE" },
    });

    pendingOrders.set(order.id, {
      amount,
      currency: "INR",
      items: orderItems,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(500).json({
      message: "Unable to create payment order. Please try again.",
    });
  }
});

// Verify Razorpay payment
app.post("/api/payments/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      [
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      ].some((value) => typeof value !== "string" || !value)
    ) {
      return res.status(400).json({
        message: "Missing payment verification details.",
      });
    }

    const localOrder = pendingOrders.get(razorpay_order_id);

    if (!localOrder) {
      return res.status(400).json({
        message: "Order not found or expired. Please try again.",
      });
    }

    const expected = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        message: "Payment signature verification failed.",
      });
    }

    const payment = await getRazorpay().payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      Number(payment.amount) !== localOrder.amount ||
      payment.currency !== localOrder.currency
    ) {
      return res.status(400).json({
        message: "Payment details do not match the order.",
      });
    }

    if (payment.status !== "captured") {
      return res.status(409).json({
        verified: false,
        message:
          "Payment is not captured yet. Please check your payment status.",
      });
    }

    verifiedOrders.set(razorpay_order_id, {
      ...localOrder,
      status: "paid",
      paymentId: payment.id,
      paidAt: new Date().toISOString(),
    });

    pendingOrders.delete(razorpay_order_id);

    return res.json({
      verified: true,
      orderId: razorpay_order_id,
      paymentId: payment.id,
      status: "paid",
    });
  } catch (error) {
    console.error("Payment verification error:", error.message);

    return res.status(500).json({
      message:
        "We could not verify your payment yet. Please contact support before trying to pay again.",
    });
  }
});

// Start the server only once, after MongoDB connects.
// async function startServer() {
//   if (!process.env.MONGO_URI) {
//     throw new Error("MONGO_URI missing in server/.env");
//   }

//   await mongoose.connect(process.env.MONGO_URI, {
//     serverSelectionTimeoutMS: 10000,
//   });

//   console.log(
//     `MongoDB connected: ${mongoose.connection.name}`
//   );

//   app.listen(PORT, () => {
//     console.log(
//       `NOIRÉ API running at http://localhost:${PORT}`
//     );
//   });
// }

// startServer().catch((error) => {
//   console.error("Server startup failed:", error.message);
//   process.exit(1);
// });


// Local development: npm start
if (require.main === module) {
  ensureMongoConnected()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`NOIRÉ API running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error.message);
      process.exit(1);
    });
}

// Export the Express app for Vercel.
module.exports = app;