import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

const API_URL = "http://localhost:5000/api/products"

const fallbackImage =
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90"

function getProductImages(product) {
  if (!product) return [fallbackImage]

  const productImages = Array.isArray(product.images) ? product.images : []

  const images = [
    ...productImages,
    product.image,
    product.imageUrl,
    product.image_url,
  ].filter((image) => typeof image === "string" && image.trim())

  return [...new Set(images)].length ? [...new Set(images)] : [fallbackImage]
}

function getProductImage(product) {
  if (!product) return fallbackImage

  const firstGalleryImage = Array.isArray(product.images)
    ? product.images.find((image) => typeof image === "string" && image.trim())
    : null

  return (
    product.image ||
    product.imageUrl ||
    product.image_url ||
    firstGalleryImage ||
    fallbackImage
  )
}

function formatPrice(price) {
  const amount = Number(price)

  if (!Number.isFinite(amount)) return "Price unavailable"

  return `₹${amount.toLocaleString("en-IN")}`
}

function ProductDetails({ products = [], addToCart }) {
  const { id } = useParams()

  const [fetchedProducts, setFetchedProducts] = useState([])
  const [loading, setLoading] = useState(products.length === 0)
  const [loadError, setLoadError] = useState("")
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [cartError, setCartError] = useState("")

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false)
      return
    }

    let cancelled = false

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          setLoading(true)

          const response = await fetch("http://localhost:5000/api/products")

          if (!response.ok) {
            throw new Error("Failed to fetch products")
          }

          const data = await response.json()

          setProducts(Array.isArray(data) ? data : data.products || [])
        } catch (error) {
          console.error("Error fetching products:", error)
          setError(error.message)
        } finally {
          setLoading(false)
        }
      }

      fetchProducts()
    }, [])

    return () => {
      cancelled = true
    }
  }, [products])

  const allProducts = products.length > 0 ? products : fetchedProducts

  const product = useMemo(
    () => allProducts.find((item) => String(item.id) === String(id)),
    [allProducts, id],
  )

  const images = useMemo(() => getProductImages(product), [product])
  const unitPrice = Number(product?.price)
  const totalPrice = Number.isFinite(unitPrice) ? unitPrice * quantity : null

  const relatedProducts = useMemo(() => {
    if (!product) return []

    return allProducts
      .filter(
        (item) =>
          String(item.id) !== String(product.id) &&
          (!product.category || item.category === product.category),
      )
      .slice(0, 3)
  }, [allProducts, product])

  useEffect(() => {
    setActiveImage(0)
    setQuantity(1)
    setAdded(false)
    setCartError("")
  }, [id])

  const isOutOfStock =
    product?.inStock === false ||
    (product?.stock !== undefined &&
      product?.stock !== null &&
      Number(product.stock) <= 0)

  async function handleAddToCart() {
    if (!product || !addToCart || adding || isOutOfStock) return

    setAdding(true)
    setAdded(false)
    setCartError("")

    try {
      for (let index = 0; index < quantity; index += 1) {
        const result = await addToCart(product)

        // Supports cart helpers that return false on failure.
        if (result === false) {
          throw new Error("Unable to add this fragrance to your bag.")
        }
      }

      setAdded(true)
    } catch (error) {
      setCartError(error?.message || "Something went wrong. Please try again.")
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="pdp-state">
        <span className="pdp-state-label">NOIRÉ / FRAGRANCE HOUSE</span>
        <p>Preparing your fragrance...</p>
      </div>
    )
  }

  if (loadError && !product) {
    return (
      <div className="pdp-state">
        <span className="pdp-state-label">A MOMENT, PLEASE</span>
        <h1>We couldn't find your fragrance.</h1>
        <p>{loadError}</p>
        <Link to="/products" className="pdp-text-link">
          Explore all fragrances <span aria-hidden="true">↗</span>
        </Link>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pdp-state">
        <span className="pdp-state-label">NOIRÉ / FRAGRANCE HOUSE</span>
        <h1>This fragrance has left the shelf.</h1>
        <p>The product may no longer be available in our collection.</p>
        <Link to="/products" className="pdp-text-link">
          Discover the collection <span aria-hidden="true">↗</span>
        </Link>
      </div>
    )
  }

  return (
    <main className="pdp-main">
      <div className="pdp-topline">
        <div className="pdp-topline-inner">
          <Link to="/" className="pdp-breadcrumb">
            Home
          </Link>
          <span className="pdp-breadcrumb-separator">/</span>
          <Link to="/products" className="pdp-breadcrumb">
            Fragrances
          </Link>
          <span className="pdp-breadcrumb-separator">/</span>
          <span className="pdp-breadcrumb-current">{product.name}</span>
        </div>
      </div>

      <section className="pdp-product-section">
        <div className="pdp-product-grid">
          <div className="pdp-gallery">
            <div className="pdp-gallery-heading">
              <span>THE FRAGRANCE</span>
            </div>

            <div className="pdp-gallery-layout">
              <div className="pdp-thumbnails" aria-label="Product images">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={`pdp-thumbnail ${
                      activeImage === index ? "is-active" : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImage === index}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = fallbackImage
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="pdp-image-stage">
                <div className="pdp-image-stage-small-image">
                  <img
                    className="pdp-main-image"
                    src={images[activeImage] || getProductImage(product)}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = fallbackImage
                    }}
                  />

                  {product.badge && (
                    <span className="pdp-image-badge">{product.badge}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pdp-product-info">
            <div className="pdp-product-intro">
              <span className="pdp-eyebrow">
                {product.category || "THE NOIRÉ COLLECTION"}
              </span>

              <h1 className="pdp-product-title">{product.name}</h1>

              <div className="pdp-title-rule">
                <span />
                <span />
              </div>

              <div className="pdp-price-row">
                <span className="pdp-price">{formatPrice(product.price)}</span>
                <span className="pdp-price-note">Inclusive of all taxes</span>
              </div>

              <p className="pdp-description">
                {product.description ||
                  "A distinctive fragrance composed to become part of your signature."}
              </p>
            </div>

            <div className="pdp-product-divider" />

            <div className="pdp-scent-summary">
              <div className="pdp-scent-summary-item">
                <span className="pdp-detail-label">FRAGRANCE FAMILY</span>
                <span className="pdp-detail-value">
                  {product.fragranceFamily ||
                    product.fragrance_family ||
                    product.scentType ||
                    product.scent_type ||
                    product.category ||
                    "Signature scent"}
                </span>
              </div>

              <div className="pdp-scent-summary-item">
                <span className="pdp-detail-label">SCENT NOTES</span>
                <span className="pdp-detail-value">
                  {Array.isArray(product.notes)
                    ? product.notes.join(" · ")
                    : product.notes || "Discover your signature"}
                </span>
              </div>
            </div>

            <div className="pdp-quantity-row">
              <span className="pdp-detail-label">QUANTITY</span>

              <div className="pdp-quantity-control">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1 || adding}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span aria-live="polite">{quantity}</span>

                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  disabled={adding}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <span className="pdp-quantity-total">
                {totalPrice === null ? "" : `TOTAL ${formatPrice(totalPrice)}`}
              </span>
            </div>

            <button
              type="button"
              className={`pdp-add-button${added ? " is-added" : ""}`}
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock || !addToCart}
            >
              <span>
                {isOutOfStock
                  ? "Currently unavailable"
                  : adding
                    ? "Adding to bag..."
                    : added
                      ? "Added to your bag"
                      : "Add to bag"}
              </span>

              <span className="pdp-add-button-icon" aria-hidden="true">
                {added ? "✓" : "↗"}
              </span>
            </button>

            {cartError && (
              <p className="pdp-cart-message is-error" role="alert">
                {cartError}
              </p>
            )}

            {added && (
              <p className="pdp-cart-message" role="status">
                Your selection has been added to your bag.
                <Link to="/cart"> View bag ↗</Link>
              </p>
            )}

            <div className="pdp-purchase-notes">
              <div>
                <span className="pdp-purchase-icon" aria-hidden="true">
                  ✳
                </span>
                <p>Thoughtfully selected fragrances</p>
              </div>
              <div>
                <span className="pdp-purchase-icon" aria-hidden="true">
                  ↗
                </span>
                <p>Made to leave a lasting impression</p>
              </div>
            </div>

            <div className="pdp-product-footnote">
              <span>THE ART OF SCENT</span>
              <span>NOIRÉ — EST. IN EVERY MOMENT</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pdp-story-section">
        <div className="container-main">
          <div className="pdp-story-inner">
            <div className="pdp-story-aside">
              <span className="pdp-eyebrow">BEYOND THE BOTTLE</span>
            </div>

            <div className="pdp-story-content">
              <h2>
                More than a fragrance.
                <br />
                <em>A feeling that stays.</em>
              </h2>

              <p>
                {product.description ||
                  "Every NOIRÉ fragrance is an invitation to express your individuality. Discover a scent that feels unmistakably yours."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pdp-details-section">
        <div className="container-main">
          <div className="pdp-details-heading">
            <div>
              <span className="pdp-eyebrow">THE SCENT PROFILE</span>
              <h2>Get to know your fragrance.</h2>
            </div>

            <span className="pdp-details-index">NOIRÉ / DETAILS</span>
          </div>

          <div className="pdp-details-list">
            <div className="pdp-detail-row">
              <span className="pdp-detail-row-number">01</span>
              <span className="pdp-detail-row-title">Fragrance family</span>
              <span className="pdp-detail-row-value">
                {product.fragranceFamily ||
                  product.fragrance_family ||
                  product.scentType ||
                  product.scent_type ||
                  product.category ||
                  "Signature scent"}
              </span>
            </div>

            <div className="pdp-detail-row">
              <span className="pdp-detail-row-number">02</span>
              <span className="pdp-detail-row-title">Notes</span>
              <span className="pdp-detail-row-value">
                {Array.isArray(product.notes)
                  ? product.notes.join(" · ")
                  : product.notes || "Explore the character of this fragrance"}
              </span>
            </div>

            <div className="pdp-detail-row">
              <span className="pdp-detail-row-number">03</span>
              <span className="pdp-detail-row-title">Availability</span>
              <span className="pdp-detail-row-value">
                {isOutOfStock ? "Currently unavailable" : "Available to order"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="pdp-related-section">
          <div className="container-main">
            <div className="pdp-related-heading">
              <div>
                <span className="pdp-eyebrow">CONTINUE EXPLORING</span>
                <h2>
                  Another kind of <em>presence.</em>
                </h2>
              </div>

              <Link to="/products" className="pdp-text-link">
                View all fragrances <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="pdp-related-grid">
              {relatedProducts.map((item, index) => (
                <Link
                  to={`/product/${item.id}`}
                  className="pdp-related-card"
                  key={item.id}
                >
                  <div className="pdp-related-image">
                    <span className="pdp-related-number">0{index + 1}</span>

                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = fallbackImage
                      }}
                    />

                    <span className="pdp-related-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </div>

                  <div className="pdp-related-copy">
                    <span>{item.category || "NOIRÉ COLLECTION"}</span>
                    <h3>{item.name}</h3>
                    <strong>{formatPrice(item.price)}</strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default ProductDetails
