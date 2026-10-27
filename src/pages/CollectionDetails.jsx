import { Link, useParams } from "react-router-dom"
import ProductCard from "../components/ProductsCard"

const collectionData = {
  woody: {
    name: "Woody",
    subtitle: "Grounded in nature. Defined by character.",
    image: "/images/collections/woody-collection.jpg",
    category: "Woody",
  },
  amber: {
    name: "Amber",
    subtitle: "Warm, rich and unforgettable.",
    image: "/images/collections/amber-collection.jpg",
    category: "Amber",
  },
  floral: {
    name: "Floral",
    subtitle: "A delicate expression of modern elegance.",
    image: "/images/collections/floral-collection.jpg",
    category: "Floral",
  },
  fresh: {
    name: "Fresh",
    subtitle: "Clean notes. A fresh perspective.",
    image: "/images/collections/fresh-collection.jpg",
    category: "Fresh",
  },
  "eau-de-parfum": {
    name: "Eau De Parfum",
    subtitle: "Distinctive fragrance for every occasion.",
    image: "/images/collections/eau-de-parfum-collection.jpg",
    category: "Eau De Parfum",
  },
  "extrait-dp": {
    name: "Extrait DP",
    subtitle: "An intense fragrance experience.",
    image: "/images/collections/extrait-dp-collection.jpg",
    category: "Extrait DP",
  },
  parfum: {
    name: "Parfum",
    subtitle: "An enduring signature, crafted to stand apart.",
    image: "/images/collections/parfum-collection.jpg",
    category: "Parfum",
  },
}

function CollectionDetails({ products = [], addToCart }) {
  const { slug } = useParams()
  const collection = collectionData[slug]

  if (!collection) {
    return (
      <div className="collection-not-found">
        <h1>Collection not found</h1>
        <Link to="/collections">Explore Collections</Link>
      </div>
    )
  }

  const collectionProducts = products.filter(
    (product) =>
      product.category?.trim().toLowerCase() ===
      collection.category.toLowerCase(),
  )

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
          <img src={collection.image} alt={`${collection.name} collection`} />
        </div>
        <div className="collection-detail-hero-overlay" />
        <div className="collection-detail-hero-content">
          <p className="collection-detail-eyebrow">THE NOIRÉ COLLECTION</p>
          <h1>{collection.name}</h1>
          <p>{collection.subtitle}</p>
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
