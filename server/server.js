const dns = require("node:dns")

if (process.platform === "win32") {
  dns.setServers(["1.1.1.1", "8.8.8.8"])
}
const mongoose = require("mongoose")
const Product = require("./models/Product")
const path = require("path")
const fs = require("node:fs")
const crypto = require("crypto")
const express = require("express")
const cors = require("cors")
const Razorpay = require("razorpay")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const User = require("./models/User")
const Order = require("./models/Order")
const nodemailer = require("nodemailer")
require("dotenv").config({ path: path.join(__dirname, ".env") })

const hasRazorpayCredentials = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
)
const app = express()
const PORT = Number(process.env.PORT) || 5000
const allowedOrigins = [
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://noire-perfume-store-five.vercel.app/",
]

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(null, false)
    },
    credentials: true,
  }),
)

app.use(cookieParser())
// Legacy API cart storage. The React app now persists its cart in the browser,
// which also works correctly across Vercel serverless function instances.
let cart = []

// Razorpay webhook must be registered before express.json().
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    const signature = req.headers["x-razorpay-signature"]

    if (!webhookSecret) {
      return res.status(503).json({
        message: "Webhook secret is not configured.",
      })
    }

    if (!signature || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        message: "Invalid webhook request.",
      })
    }

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex")

    const expectedBuffer = Buffer.from(expected)
    const receivedBuffer = Buffer.from(signature)

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        message: "Invalid webhook signature.",
      })
    }

    let event

    try {
      event = JSON.parse(req.body.toString("utf8"))
    } catch {
      return res.status(400).json({
        message: "Invalid webhook payload.",
      })
    }

    // Keep order payment state synchronized using only signature-verified events.
    const paymentEntity = event.payload?.payment?.entity
    const orderEntity = event.payload?.order?.entity
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id

    if (
      razorpayOrderId &&
      event.event === "payment.captured" &&
      paymentEntity?.id
    ) {
      Order.findOneAndUpdate(
        { razorpayOrderId },
        {
          $set: { paymentStatus: "paid", razorpayPaymentId: paymentEntity.id },
        },
      ).catch((error) =>
        console.error("Order webhook update failed:", error.message),
      )
    } else if (razorpayOrderId && event.event === "payment.failed") {
      Order.findOneAndUpdate(
        { razorpayOrderId, paymentStatus: { $ne: "paid" } },
        { $set: { paymentStatus: "failed" } },
      ).catch((error) =>
        console.error("Order webhook update failed:", error.message),
      )
    }

    return res
      .status(200)
      .json({ received: true, event: event.event || "unknown" })
  },
)

app.use(express.json({ limit: "8mb" }))

// Local development image storage. For serverless production deployments, use cloud storage.
const uploadsDirectory = process.env.VERCEL
  ? path.join("/tmp", "noire-uploads")
  : path.join(__dirname, "uploads")
fs.mkdirSync(uploadsDirectory, { recursive: true })
app.use("/uploads", express.static(uploadsDirectory, { maxAge: "1d" }))
const allowedImageMimeTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
}

// Health check does not require MongoDB. It confirms the API process is reachable.
app.get("/api/health", (_req, res) => {
  const connectionStates = [
    "disconnected",
    "connected",
    "connecting",
    "disconnecting",
  ]
  return res.status(200).json({
    status: "ok",
    service: "NOIRÉ API",
    database: connectionStates[mongoose.connection.readyState] || "unknown",
    databaseConfigured: Boolean(process.env.MONGO_URI),
    razorpayConfigured: hasRazorpayCredentials,
    timestamp: new Date().toISOString(),
  })
})

let mongoConnectionPromise = null
let lastMongoFailureAt = 0
const isDevelopment = process.env.NODE_ENV !== "production"
const mongoRetryDelayMs = 15000

async function ensureMongoConnected() {
  if (mongoose.connection.readyState === 1) {
    return
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured")
  }

  if (
    isDevelopment &&
    lastMongoFailureAt &&
    Date.now() - lastMongoFailureAt < mongoRetryDelayMs
  ) {
    throw new Error("MongoDB connection recently failed; retrying shortly.")
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
      })
      .catch((error) => {
        lastMongoFailureAt = Date.now()
        mongoConnectionPromise = null
        throw error
      })
  }

  await mongoConnectionPromise
  lastMongoFailureAt = 0
}

async function getCatalogProducts() {
  await ensureMongoConnected()
  return Product.find().lean()
}

async function findCatalogProduct(productId) {
  await ensureMongoConnected()
  return Product.findOne({ id: String(productId) }).lean()
}

const AUTH_COOKIE = "noire_auth"
const AUTH_DURATION = 7 * 24 * 60 * 60 * 1000

function createAuthToken(user) {
  if (!process.env.AUTH_JWT_SECRET) {
    throw new Error("AUTH_JWT_SECRET is not configured")
  }

  return jwt.sign({ sub: user._id.toString() }, process.env.AUTH_JWT_SECRET, {
    expiresIn: "7d",
  })
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_DURATION,
  })
}

function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE]

  if (!token) {
    return res.status(401).json({
      message: "Please log in to continue.",
    })
  }

  try {
    req.auth = jwt.verify(token, process.env.AUTH_JWT_SECRET)
    next()
  } catch {
    res.clearCookie(AUTH_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return res.status(401).json({
      message: "Your session has expired. Please log in again.",
    })
  }
}

async function requireAdmin(req, res, next) {
  try {
    await ensureMongoConnected()
    const user = await User.findById(req.auth?.sub).select("role").lean()
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." })
    }
    req.adminUser = user
    return next()
  } catch (error) {
    console.error("Admin authorization error:", error.message)
    return res.status(503).json({ message: "Could not verify admin access." })
  }
}

app.use("/api/auth", async (req, res, next) => {
  try {
    await ensureMongoConnected()
    next()
  } catch (error) {
    console.error("Auth database connection error:", error.message)

    return res.status(503).json({
      message: "Authentication service is temporarily unavailable.",
    })
  }
})


// SIGNUP
app.post("/api/auth/register", async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    // Validate input
    if (
      typeof name !== "string" ||
      name.length < 2 ||
      name.length > 80 ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid name, email and password (8–72 characters).",
      });
    }

    // Read configured admin emails
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

    const adminEmail = process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

    // Assign role based on configured email
    let role = "customer";

    if (superAdminEmail && email === superAdminEmail) {
      role = "super_admin";
    } else if (adminEmail && email === adminEmail) {
      role = "admin";
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with assigned role
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });



    // Create authentication token
    const token = createAuthToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Signup error:", error.message);

    return res.status(500).json({
      message: "Unable to create your account.",
    });
  }
});


// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    // Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter your email and password.",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");

    // Verify password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Read configured admin emails
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

    const adminEmail = process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

    // Assign role based on configured email
    let expectedRole = "customer";

    if (superAdminEmail && email === superAdminEmail) {
      expectedRole = "super_admin";
    } else if (adminEmail && email === adminEmail) {
      expectedRole = "admin";
    }

    // Update role if required
    if (user.role !== expectedRole) {
      user.role = expectedRole;
      await user.save();
    }

    console.log("LOGIN ROLE RESULT:", {
      email: user.email,
      role: user.role,
    });

    // Create authentication token after role update
    const token = createAuthToken(user);
    setAuthCookie(res, token);

    return res.json({
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in. Please try again.",
    });
  }
});

// Forgot Password

/* =========================================
   FORGOT PASSWORD
========================================= */

app.post("/api/auth/forgot-password", async (req, res) => {
  let user = null

  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      })
    }

    user = await User.findOne({ email })

    // Same response for existing and non-existing accounts.
    if (!user) {
      return res.json({
        message:
          "If an account exists for this email, a reset link will be sent.",
      })
    }

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex")

    // Store only the hash in MongoDB.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)

    await user.save()

    const clientUrl = (
      process.env.CLIENT_URL || "https://noire-perfume-store-five.vercel.app/"
    ).replace(/\/+$/, "")

    const resetUrl = `${clientUrl}/reset-password/${resetToken}`

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [user.email],
        subject: "Reset your NOIRÉ password",
        html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
              <h1 style="letter-spacing:5px">NOIRÉ</h1>
              <h2>Reset your password</h2>
              <p>We received a request to reset your NOIRÉ account password.</p>
              <p>
                <a href="${resetUrl}"
                   style="display:inline-block;padding:13px 24px;background:#171717;color:#fff;text-decoration:none">
                  Reset Password
                </a>
              </p>
              <p>This link expires in 15 minutes and can only be used once.</p>
              <p>If you did not request this, you can ignore this email.</p>
            </div>
          `,
      }),
    })

    if (!emailResponse.ok) {
      const providerError = await emailResponse.text()
      console.error("Resend email error:", providerError)

      // Invalidate the unused token if email delivery fails.
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()

      return res.status(502).json({
        message: "Unable to send the reset email. Please try again later.",
      })
    }

    return res.json({
      message:
        "If an account exists for this email, a reset link will be sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error.message)

    return res.status(500).json({
      message: "Unable to process your request right now.",
    })
  }
})

/* =========================================
   RESET PASSWORD
========================================= */

app.post("/api/auth/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params
    const password = req.body?.password

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        message: "Invalid or expired reset link.",
      })
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message: "Password must be between 8 and 128 characters.",
      })
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link.",
      })
    }

    user.password = await bcrypt.hash(password, 12)

    // Make the reset link unusable after a successful reset.
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    return res.json({
      message: "Password reset successfully. Please log in.",
    })
  } catch (error) {
    console.error("Reset password error:", error.message)

    return res.status(500).json({
      message: "Unable to reset your password right now.",
    })
  }
})

// CURRENT USER / RESTORE SESSION
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub)
      .select("name email role")
      .lean()

    if (!user) {
      res.clearCookie(AUTH_COOKIE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })

      return res.status(401).json({
        message: "User account not found.",
      })
    }

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "customer",
      },
    })
  } catch (error) {
    console.error("Current user error:", error.message)
    return res.status(500).json({
      message: "Unable to retrieve your account.",
    })
  }
})

// SIGN OUT
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })

  return res.json({
    message: "Signed out successfully.",
  })
})

// Update the signed-in customer's own profile. Role and password are never editable here.
app.patch("/api/auth/profile", requireAuth, async (req, res) => {
  try {
    await ensureMongoConnected()
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : ""
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : ""
    if (
      name.length < 2 ||
      name.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      return res
        .status(400)
        .json({ message: "Enter a valid name and email address." })
    }
    const duplicate = await User.findOne({ email, _id: { $ne: req.auth.sub } })
      .select("_id")
      .lean()
    if (duplicate)
      return res
        .status(409)
        .json({ message: "That email address is already in use." })
    const user = await User.findByIdAndUpdate(
      req.auth.sub,
      { $set: { name, email } },
      { new: true, runValidators: true },
    )
      .select("name email role")
      .lean()
    if (!user) return res.status(404).json({ message: "Account not found." })
    return res.json({
      message: "Profile updated successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "customer",
      },
    })
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "That email address is already in use." })
    console.error("Profile update error:", error.message)
    return res.status(500).json({ message: "Unable to update your profile." })
  }
})

// Admin APIs: every endpoint is protected on the server, not just by the React route.
app.get("/api/admin/summary", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [users, products, orders, paidRevenue] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ])
    return res.json({
      users,
      products,
      orders,
      revenue: paidRevenue[0]?.total || 0,
    })
  } catch (error) {
    console.error("Admin summary error:", error.message)
    return res.status(500).json({ message: "Unable to load admin summary." })
  }
})

app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ users })
  } catch (error) {
    console.error("Admin users error:", error.message)
    return res.status(500).json({ message: "Unable to load users." })
  }
})

app.get("/api/admin/orders", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ orders })
  } catch (error) {
    console.error("Admin orders error:", error.message)
    return res.status(500).json({ message: "Unable to load all orders." })
  }
})

app.patch(
  "/api/admin/orders/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const allowed = [
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ]
      const orderStatus = req.body?.orderStatus
      if (!allowed.includes(orderStatus))
        return res.status(400).json({ message: "Invalid order status." })
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: { orderStatus } },
        { new: true, runValidators: true },
      )
      if (!order) return res.status(404).json({ message: "Order not found." })
      return res.json({ message: "Order status updated.", order })
    } catch (error) {
      console.error("Admin order status error:", error.message)
      return res.status(500).json({ message: "Unable to update order status." })
    }
  },
)

app.post(
  "/api/admin/uploads/product-image",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const match =
        typeof req.body?.dataUrl === "string"
          ? req.body.dataUrl.match(
            /^data:(image\/(?:jpeg|png|webp|avif));base64,([A-Za-z0-9+/=]+)$/,
          )
          : null
      if (!match)
        return res
          .status(400)
          .json({ message: "Upload a valid JPG, PNG, WEBP or AVIF image." })
      const mimeType = match[1]
      const imageBuffer = Buffer.from(match[2], "base64")
      if (!imageBuffer.length || imageBuffer.length > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ message: "Image must be 5 MB or smaller." })
      }
      const filename = `${crypto.randomUUID()}${allowedImageMimeTypes[mimeType]}`
      await fs.promises.writeFile(
        path.join(uploadsDirectory, filename),
        imageBuffer,
        { flag: "wx" },
      )
      const baseUrl = `${req.protocol}://${req.get("host")}`
      return res.status(201).json({ image: `${baseUrl}/uploads/${filename}` })
    } catch (error) {
      console.error("Admin image upload error:", error.message)
      return res
        .status(500)
        .json({ message: "Unable to save the product image." })
    }
  },
)

app.get("/api/admin/products", requireAuth, requireAdmin, async (_req, res) => {
  try {
    return res.json({
      products: await Product.find().sort({ createdAt: -1 }).lean(),
    })
  } catch (error) {
    console.error("Admin products error:", error.message)
    return res.status(500).json({ message: "Unable to load products." })
  }
})

app.post("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      id,
      name,
      price,
      category,
      collection,
      description,
      image,
      size,
      concentration,
      notes,
      badge,
    } = req.body || {}
    if (
      !String(id || "").trim() ||
      !String(name || "").trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    )
      return res
        .status(400)
        .json({ message: "Product ID, name and a valid price are required." })
    const product = await Product.create({
      id: String(id).trim(),
      name: String(name).trim(),
      price: Number(price),
      category,
      collection,
      description,
      image,
      size,
      concentration,
      notes,
      badge,
    })
    return res.status(201).json({ message: "Product created.", product })
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "A product with this ID already exists." })
    console.error("Admin create product error:", error.message)
    return res.status(500).json({ message: "Unable to create product." })
  }
})

app.patch(
  "/api/admin/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const updates = {}
      for (const key of [
        "name",
        "price",
        "category",
        "collection",
        "description",
        "image",
        "size",
        "concentration",
        "notes",
        "badge",
      ]) {
        if (req.body?.[key] !== undefined)
          updates[key] = key === "price" ? Number(req.body[key]) : req.body[key]
      }
      if (
        updates.price !== undefined &&
        (!Number.isFinite(updates.price) || updates.price < 0)
      )
        return res.status(400).json({ message: "Enter a valid price." })
      const product = await Product.findOneAndUpdate(
        { id: req.params.id },
        { $set: updates },
        { new: true, runValidators: true },
      )
      if (!product)
        return res.status(404).json({ message: "Product not found." })
      return res.json({ message: "Product updated.", product })
    } catch (error) {
      console.error("Admin update product error:", error.message)
      return res.status(500).json({ message: "Unable to update product." })
    }
  },
)

app.delete(
  "/api/admin/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const product = await Product.findOneAndDelete({ id: req.params.id })
      if (!product)
        return res.status(404).json({ message: "Product not found." })
      return res.json({ message: "Product deleted." })
    } catch (error) {
      console.error("Admin delete product error:", error.message)
      return res.status(500).json({ message: "Unable to delete product." })
    }
  },
)

// Products are served exclusively from MongoDB; no local demo catalogue fallback.
app.get("/api/products", async (_req, res) => {
  try {
    const products = await Product.find().lean()
    return res.json(products)
  } catch (error) {
    console.error("Fetch products error:", error.message)
    return res.status(503).json({
      message: "Product database is temporarily unavailable.",
    })
  }
})

// Get collections dynamically from MongoDB products

app.get("/api/collections", async (_req, res) => {
  try {
    await ensureMongoConnected()

    const products = await Product.find({
      collection: { $exists: true, $nin: ["", null] },
    })
      .select("collection image images")
      .lean()

    const collectionMap = new Map()

    for (const product of products) {
      const name = product.collection?.trim()

      if (!name) continue

      const key = name.toLowerCase()

      if (!collectionMap.has(key)) {
        const slug = key
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")

        collectionMap.set(key, {
          id: slug,
          name,
          slug,
          image: product.image || product.images?.[0] || "",
          productCount: 0,
        })
      }

      const collection = collectionMap.get(key)
      collection.productCount += 1

      if (!collection.image) {
        collection.image = product.image || product.images?.[0] || ""
      }
    }

    return res.json(
      [...collectionMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    )
  } catch (error) {
    console.error("Fetch collections error:", error.message)

    return res.status(503).json({
      message: "Unable to load collections.",
    })
  }
})

// Get current cart
app.get("/api/cart", (_req, res) => {
  return res.json(cart)
})

// Add product to cart
app.post("/api/cart", async (req, res) => {
  try {
    const productId = req.body?.productId

    // Compatibility with the existing frontend cart-fetch request.
    if (productId === undefined || productId === null || productId === "") {
      return res.json(cart)
    }

    const product = await findCatalogProduct(productId)

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      })
    }

    const existing = cart.find((item) => String(item.id) === String(product.id))

    if (existing) {
      if (existing.quantity >= 99) {
        return res.status(400).json({
          message: "Maximum quantity is 99.",
        })
      }

      existing.quantity += 1
    } else {
      const { _id, __v, createdAt, updatedAt, ...cartProduct } = product

      cart.push({
        ...cartProduct,
        quantity: 1,
      })
    }

    return res.status(201).json(cart)
  } catch (error) {
    console.error("Add to cart error:", error.message)

    return res.status(500).json({
      message: "Unable to add product to cart.",
    })
  }
})

// Update cart item quantity
app.put("/api/cart/:productId", (req, res) => {
  const item = cart.find(
    (entry) => String(entry.id) === String(req.params.productId),
  )

  if (!item) {
    return res.status(404).json({
      message: "Cart item not found.",
    })
  }

  const quantity = Number(req.body?.quantity)

  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
    return res.status(400).json({
      message: "Quantity must be between 1 and 99.",
    })
  }

  item.quantity = quantity
  return res.json(cart)
})

// Remove one cart item
app.delete("/api/cart/:productId", (req, res) => {
  const previousLength = cart.length

  cart = cart.filter((item) => String(item.id) !== String(req.params.productId))

  if (cart.length === previousLength) {
    return res.status(404).json({
      message: "Cart item not found.",
    })
  }

  return res.json(cart)
})

// Clear cart
app.delete("/api/cart", (_req, res) => {
  cart = []
  return res.json(cart)
})

// Create a Razorpay order and persist a pending order for the authenticated customer.
app.post("/api/payments/create-order", requireAuth, async (req, res) => {
  try {
    await ensureMongoConnected()
    const { items, customer } = req.body || {}

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." })
    }
    if (items.length > 100) {
      return res.status(400).json({ message: "Too many cart items." })
    }

    const name = typeof customer?.name === "string" ? customer.name.trim() : ""
    const email =
      typeof customer?.email === "string"
        ? customer.email.trim().toLowerCase()
        : ""
    const phone =
      typeof customer?.phone === "string" ? customer.phone.trim() : ""
    if (
      !name ||
      name.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\+?[0-9\s()-]{8,20}$/.test(phone)
    ) {
      return res
        .status(400)
        .json({ message: "Please enter valid contact details." })
    }

    const orderItems = []
    let amount = 0
    for (const item of items) {
      const product = await findCatalogProduct(item.id)
      const quantity = Number(item.quantity)
      if (
        !product ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return res
          .status(400)
          .json({ message: "Invalid product or quantity in cart." })
      }
      const price = Number(product.price)
      if (!Number.isFinite(price) || price <= 0) {
        return res
          .status(500)
          .json({ message: "A product has an invalid configured price." })
      }
      const lineAmount = Math.round(price * 100) * quantity
      if (!Number.isSafeInteger(lineAmount)) {
        return res.status(400).json({ message: "Invalid order amount." })
      }
      amount += lineAmount
      orderItems.push({
        productId: String(product.id),
        name: product.name,
        image: product.image || product.images?.[0] || "",
        category: product.category || "Fragrance",
        quantity,
        unitPrice: Math.round(price * 100) / 100,
        lineTotal: (Math.round(price * 100) / 100) * quantity,
      })
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid order total." })
    }

    const client = getRazorpay()
    const orderNumber = `NO-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`
    const razorpayOrder = await client.orders.create({
      amount,
      currency: "INR",
      receipt: `noire_${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`,
      notes: { store: "NOIRE", customerId: String(req.auth.sub), orderNumber },
    })

    const subtotal = amount / 100
    const savedOrder = await Order.create({
      user: req.auth.sub,
      orderNumber,
      items: orderItems,
      customer: { name, email, phone },
      subtotal,
      shipping: 0,
      total: subtotal,
      currency: "INR",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      orderStatus: "placed",
      razorpayOrderId: razorpayOrder.id,
    })

    return res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderNumber: savedOrder.orderNumber,
    })
  } catch (error) {
    console.error("Create order error:", error.message)
    if (mongoose.connection.readyState !== 1 && !isDevelopment) {
      return res
        .status(503)
        .json({ message: "The product database is temporarily unavailable." })
    }
    if (error.message?.includes("Missing Razorpay credentials")) {
      return res.status(503).json({
        message:
          "Payment is not configured yet. Add valid Razorpay test keys to server/.env.",
      })
    }
    return res.status(502).json({
      message:
        "Unable to create payment order. Check the API, database and Razorpay test keys, then try again.",
    })
  }
})

// Authenticated customers can only fetch their own order history.
app.get("/api/orders/my-orders", requireAuth, async (req, res) => {
  try {
    await ensureMongoConnected()
    const orders = await Order.find({ user: req.auth.sub })
      .sort({ createdAt: -1 })
      .select(
        "orderNumber items customer.name subtotal shipping total currency paymentMethod paymentStatus orderStatus razorpayPaymentId createdAt updatedAt",
      )
      .lean()
    return res.json({ orders })
  } catch (error) {
    console.error("Fetch orders error:", error.message)
    return res
      .status(503)
      .json({ message: "Unable to load your orders right now." })
  }
})

// Verify Razorpay payment
app.post("/api/payments/verify", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {}

    if (
      [razorpay_order_id, razorpay_payment_id, razorpay_signature].some(
        (value) => typeof value !== "string" || !value,
      )
    ) {
      return res.status(400).json({
        message: "Missing payment verification details.",
      })
    }

    const client = getRazorpay()
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    const expectedBuffer = Buffer.from(expected)
    const receivedBuffer = Buffer.from(razorpay_signature)

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        message: "Payment signature verification failed.",
      })
    }

    await ensureMongoConnected()
    const savedOrder = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.auth.sub,
    })
    if (!savedOrder) {
      return res
        .status(404)
        .json({ message: "Order not found for this account." })
    }

    const [order, payment] = await Promise.all([
      client.orders.fetch(razorpay_order_id),
      client.payments.fetch(razorpay_payment_id),
    ])

    if (
      order.id !== razorpay_order_id ||
      payment.order_id !== razorpay_order_id ||
      Number(payment.amount) !== Number(order.amount) ||
      payment.currency !== order.currency
    ) {
      return res.status(400).json({
        message: "Payment details do not match the order.",
      })
    }

    if (payment.status !== "captured") {
      return res.status(409).json({
        verified: false,
        message:
          "Payment is not captured yet. Please check your payment status.",
      })
    }

    savedOrder.paymentStatus = "paid"
    savedOrder.razorpayPaymentId = payment.id
    savedOrder.orderStatus = "processing"
    await savedOrder.save()

    return res.json({
      verified: true,
      orderId: savedOrder.orderNumber,
      paymentId: payment.id,
      status: "paid",
    })
  } catch (error) {
    console.error("Payment verification error:", error.message)

    return res.status(500).json({
      message:
        "We could not verify your payment yet. Please contact support before trying to pay again.",
    })
  }
})

// Local development: start the API even if Atlas is temporarily unreachable.
// /api/health stays available; database-backed routes return a useful response.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`NOIRÉ API running at http://localhost:${PORT}`)
  })
}

// Export the Express app for Vercel.
module.exports = app
