import { Link, useParams } from "react-router-dom"
import ProductCard from "../components/ProductsCard"

function slugify(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function CollectionDetails({ products = [], addToCart }) {
  const { slug } = useParams()

  // Find products belonging to this collection
  const collectionProducts = products.filter(
    (product) =>
      product.collection && slugify(product.collection) === slugify(slug),
  )

  // Build collection details from actual products
  const collectionName = collectionProducts[0]?.collection

  const collection = collectionName
    ? {
        name: collectionName,
        image: collectionProducts.find((product) => product.image)?.image || "",
      }
    : null

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
                  key={product._id || product.id}
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
            <Link to="/collections">Back to All Collections</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CollectionDetails
