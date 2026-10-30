import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { apiUrl } from "../lib/api"


function Collections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function fetchCollections() {
      try {
        const response = await fetch(apiUrl("/api/collections"), {
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

  if (loading) {
    return (
      <main className="collections-page-main">
        <div className="container-main">
          <div className="collections-container">
            <p className="collections-status">Discovering your fragrances...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="collections-page-main">
        <div className="container-main">
          <div className="collections-container">
            <p className="collections-status">{error}</p>
            <button
              className="collections-retry"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="collections-page-main">
      <section className="collections-hero">
        <div className="collections-container">
          <span className="collections-eyebrow">THE WORLD OF NOIRÉ</span>

          <h1>Find Your Signature Scent.</h1>

          <p>
            Explore fragrances crafted for every mood, moment and unforgettable
            impression.
          </p>

          <span className="collections-hero-line" />
        </div>
      </section>

      <section className="collections-contain">
        <div className="container-main">
          <div className="collections-heading">
            <div>
              <span className="collections-eyebrow">CURATED FOR YOU</span>
              <h2>Explore Collections</h2>
            </div>

            <span className="collections-total">
              {collections.length} COLLECTIONS
            </span>
          </div>

          {collections.length === 0 ? (
            <div className="collections-empty">
              <h3>Your fragrance story starts here.</h3>
              <p>
                Collections will appear once products are assigned to a
                collection in the database.
              </p>
            </div>
          ) : (
            <div className="collections-grid">
              {collections.map((collection, index) => (
                <Link
                  to={`/collections/${collection.slug}`}
                  className="collection-card"
                  key={collection.id}
                >
                  <div className="collection-image">
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.name}
                        loading={index < 2 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="collection-image-placeholder">NOIRÉ</div>
                    )}

                    <div className="collection-overlay" />

                    <div className="collection-card-content">
                      <span className="collection-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="collection-card-bottom">
                        <div>
                          <h3>{collection.name}</h3>
                          <p>
                            {collection.productCount}{" "}
                            {collection.productCount === 1
                              ? "FRAGRANCE"
                              : "FRAGRANCES"}
                          </p>
                        </div>

                        <span className="collection-arrow">↗</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Collections
