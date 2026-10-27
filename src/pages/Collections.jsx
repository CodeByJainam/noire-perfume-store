import { Link } from "react-router-dom"
const collections = [
  {
    id: 1,
    name: "Woody",
    slug: "woody",
    image: "/images/collections/woody-collection.jpg",
  },
  {
    id: 2,
    name: "Amber",
    slug: "amber",
    image: "/images/collections/amber-collection.jpg",
  },
  {
    id: 3,
    name: "Floral",
    slug: "floral",
    image: "/images/collections/floral-collection.jpg",
  },
  {
    id: 4,
    name: "Fresh",
    slug: "fresh",
    image: "/images/collections/fresh-collection.jpg",
  },
  {
    id: 5,
    name: "Eau De Parfum",
    slug: "eau-de-parfum",
    image: "/images/collections/eau-de-parfum-collection.jpg",
  },
  {
    id: 6,
    name: "Extrait DP",
    slug: "extrait-dp",
    image: "/images/collections/extrait-dp-collection.jpg",
  },
  {
    id: 7,
    name: "Parfum",
    slug: "parfum",
    image: "/images/collections/parfum-collection.jpg",
  },
]

function Collections() {
  return (
    <div className="collections-page-main">
      <div className="container-main">
        <div className="collections-grid">
          {collections.map((collection) => (
            <div className="collection-card" key={collection.id}>
              <Link
                to={`/collections/${collection.slug}`}
                className="collection-link"
              >
                <div className="collection-image">
                  <img src={collection.image} alt={collection.name} /> 
                </div>

                <h2 className="collection-name">{collection.name}</h2>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Collections
