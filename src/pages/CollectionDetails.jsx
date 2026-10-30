import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import ProductCard from "../components/ProductsCard"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

function CollectionDetails({ products = [], addToCart }) {
  const { slug } = useParams()

  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function fetchCollections() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/collections`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("Unable to load collections.")
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error("Invalid collections response.")
        }

        setCollections(data)
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.")
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchCollections()

    return () => controller.abort()
  }, [])

  const collection = collections.find((item) => item.slug === slug)

  const collectionProducts = products.filter(
    (product) =>
      product.collection?.trim().toLowerCase() ===
      collection?.name?.trim().toLowerCase(),
  )

  if (loading) {
    return (
      <div className="collection-not-found">
        <p>Loading collection...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="collection-not-found">
        <h1>Unable to load collection</h1>
        <p>{error}</p>
        <Link to="/collections">Explore Collections</Link>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="collection-not-found">
        <h1>Collection not found</h1>
        <Link to="/collections">Explore Collections</Link>
      </div>
    )
  }

  return (
    <div className="collection-detail-page">
      <div className="container-main">
        <div className="collection-detail-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/collections">Collections</Link>
          <span>/</span>
          <span>{collection.name}</span>
        </div>
      </div>

      <section className="collection-detail-hero">
        <div className="collection-detail-hero-image">
          {collection.image && (
            <img src={collection.image} alt={`${collection.name} collection`} />
          )}
        </div>

        <div className="collection-detail-hero-overlay" />

        <div className="collection-detail-hero-content">
          <p className="collection-detail-eyebrow">THE NOIRÉ COLLECTION</p>
          <h1>{collection.name}</h1>
          <p>Discover fragrances curated for your signature scent.</p>
        </div>
      </section>

      <section className="collection-products-section" id="collection-products">
        <div className="container-main">
          <div className="collection-products-heading">
            <div>
              <p className="collection-detail-eyebrow">CURATED FOR YOU</p>
              <h2>Explore {collection.name}</h2>
            </div>

            <p className="collection-products-count">
              {collectionProducts.length}{" "}
              {collectionProducts.length === 1 ? "fragrance" : "fragrances"}
            </p>
          </div>

          {collectionProducts.length > 0 ? (
            <div className="products-grid collection-detail-products-grid">
              {collectionProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="collection-empty-state">
              <h3>New fragrances are on their way.</h3>
              <p>There are no products in this collection yet.</p>
              <Link to="/products">Explore all fragrances</Link>
            </div>
          )}

          <div className="collection-back-link">
            <Link to="/collections">← Back to All Collections</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CollectionDetails
