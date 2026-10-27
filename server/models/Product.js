const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "Fragrance" },
    notes: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    size: { type: String, default: "100 ml" },
    concentration: {
      type: String,
      default: "Eau De Parfum",
    },
    badge: { type: String, default: "" },
  },
  { timestamps: true },
)

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema)
