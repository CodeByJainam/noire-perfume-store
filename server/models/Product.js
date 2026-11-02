const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "" },
    slug: { type: String, unique: true, sparse: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, default: "Fragrance" },
    collection: { type: String, trim: true, default: "" },
    notes: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    size: { type: String, default: "100 ml" },
    concentration: { type: String, default: "Eau De Parfum" },
    badge: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
  },
  { timestamps: true },
)

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema)
