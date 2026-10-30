import { useState } from "react"
import { Link } from "react-router-dom"

function ProductsCard({ product, addToCart, index = 0 }) {
  const [added, setAdded] = useState(false)

  const handleAdd = async () => {
    const wasAdded = await addToCart(product)

    if (wasAdded) {
      setAdded(true)
      window.setTimeout(() => setAdded(false), 1400)
    }
  }

  return (
    <article className="product-card" style={{ "--card-index": index }}>
      <div className="product-image-wrap">
        <Link
          to={`/product/${product.id}`}
          className="product-image-link"
          aria-label={`View ${product.name} details`}
        >
          <img
            src={product.image}
            alt={`${product.name} fragrance`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src =
                "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85"
            }}
          />
        </Link>

        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}

        <button
          type="button"
          className={`product-quick-add${added ? " is-added" : ""}`}
          onClick={handleAdd}
          aria-label={`Add ${product.name} to bag`}
        >
          <span>{added ? "Added" : "Add to bag"}</span>
          <span>{added ? "✓" : "+"}</span>
        </button>
      </div>

      <div className="product-card-body">
        <div className="product-card-copy">
          <span className="product-category">{product.category}</span>

          <h2>
            <Link to={`/product/${product.id}`} className="product-title-link">
              {product.name}
            </Link>
          </h2>

          <p>
            {product.notes ||
              "A distinctive fragrance, made to leave an impression."}
          </p>
        </div>

        <strong className="product-price">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </strong>
      </div>
    </article>
  )
}

export default ProductsCard
