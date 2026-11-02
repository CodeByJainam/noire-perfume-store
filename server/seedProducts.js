// REPLACES the existing product catalogue. Run only when you intend to remove all old products.
// Existing order line items are snapshots and are not modified by this script.
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env") })
const mongoose = require("mongoose")
const Product = require("./models/Product")
const products = require("./data/Products")

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in server/.env")
  if (process.argv.includes("--replace") !== true) {
    throw new Error("Safety stop: run with --replace to delete the old catalogue and insert the new 25 products.")
  }
  if (!Array.isArray(products) || products.length !== 25) {
    throw new Error(`Expected exactly 25 products; found ${products?.length || 0}.`)
  }
  const ids = new Set(products.map((p) => p.id))
  if (ids.size !== products.length) throw new Error("Duplicate product IDs in catalogue.")

  await mongoose.connect(process.env.MONGO_URI)
  const result = await Product.deleteMany({})
  await Product.insertMany(products)
  console.log(`Removed ${result.deletedCount} old products and inserted ${products.length} catalogue products.`)
  console.log("Stock is set to 0 intentionally. Update real stock quantities in Admin > Inventory.")
}

main()
  .catch((error) => {
    console.error("Product catalogue replacement failed:", error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  })
