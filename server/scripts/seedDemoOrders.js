// Creates clearly marked DEMO orders for existing users/products.
// These are NOT real payments: paymentStatus stays "pending" and Razorpay IDs are blank.
const dns = require("dns")
dns.setServers(["8.8.8.8", "1.1.1.1"])
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
const mongoose = require("mongoose")
const User = require("../models/User")
const Product = require("../models/Product")
const Order = require("../models/Order")

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from your backend .env file.")
  }

  await mongoose.connect(process.env.MONGO_URI)
  const users = await User.find().select("name email").limit(10).lean()
  const products = await Product.find().lean()

  if (!users.length)
    throw new Error("No users found. Create/register a customer account first.")
  if (!products.length)
    throw new Error(
      "No products found. Add products before generating demo orders.",
    )

  const demoOrders = []
  const statuses = ["placed", "processing", "shipped", "delivered", "cancelled"]

  for (let i = 0; i < Math.min(8, users.length * 2); i++) {
    const user = users[i % users.length]
    const productA = products[i % products.length]
    const productB = products[(i + 1) % products.length]
    const quantityA = (i % 2) + 1
    const items = [
      {
        productId: String(productA.id || productA._id),
        name: productA.name,
        image: productA.image || productA.images?.[0] || "",
        category: productA.category || "Fragrance",
        quantity: quantityA,
        unitPrice: Number(productA.price),
        lineTotal: Number(productA.price) * quantityA,
      },
    ]

    if (
      productB &&
      String(productB._id) !== String(productA._id) &&
      i % 2 === 0
    ) {
      items.push({
        productId: String(productB.id || productB._id),
        name: productB.name,
        image: productB.image || productB.images?.[0] || "",
        category: productB.category || "Fragrance",
        quantity: 1,
        unitPrice: Number(productB.price),
        lineTotal: Number(productB.price),
      })
    }

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    demoOrders.push({
      user: user._id,
      orderNumber: `DEMO-${Date.now().toString(36).toUpperCase()}-${String(i + 1).padStart(2, "0")}`,
      items,
      customer: {
        name: user.name || "Demo Customer",
        email: user.email,
        phone: "9999999999",
      },
      subtotal,
      shipping: 0,
      total: subtotal,
      currency: "INR",
      paymentMethod: "demo",
      paymentStatus: "pending",
      orderStatus: statuses[i % statuses.length],
      razorpayOrderId: `DEMO-${Date.now()}-${i + 1}`,
      razorpayPaymentId: "",
    })
  }

  const inserted = await Order.insertMany(demoOrders)
  console.log(
    `Inserted ${inserted.length} DEMO orders. All are marked pending (not real payments).`,
  )
}

main()
  .catch((error) => {
    console.error("Demo order seed failed:", error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {})
  })
