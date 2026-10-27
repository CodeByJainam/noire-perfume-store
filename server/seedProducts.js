const path = require("path")

require("dotenv").config({
  path: path.join(__dirname, ".env"),
})

const mongoose = require("mongoose")
const Product = require("./models/Product")
const products = require("./data/Products")

async function seedProducts() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing in server/.env")
  }

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("No products found in server/data/products.js")
  }

  await mongoose.connect(process.env.MONGO_URI)

  for (const product of products) {
    await Product.updateOne(
      { id: String(product.id) },
      {
        $set: {
          ...product,
          id: String(product.id),
        },
      },
      { upsert: true },
    )
  }

  console.log(`Successfully saved ${products.length} products to Atlas.`)
  await mongoose.disconnect()
}

seedProducts().catch(async (error) => {
  console.error("Product migration failed:", error.message)

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }

  process.exitCode = 1
})
