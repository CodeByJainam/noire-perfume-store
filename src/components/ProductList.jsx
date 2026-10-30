import { useMemo, useState } from "react"
import ProductCard from "./ProductsCard"

function ProductList({ products, addToCart }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All scents")
  const [sortBy, setSortBy] = useState("featured")
  const categories = [
    "All scents",
    ...new Set(products.map((product) => product.category)),
  ]

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const result = products.filter((product) => {
      const matchesSearch = [product.name, product.category, product.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
      return (
        matchesSearch &&
        (selectedCategory === "All scents" ||
          product.category === selectedCategory)
      )
    })
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price)
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price)
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [products, searchTerm, selectedCategory, sortBy])

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All scents")
    setSortBy("featured")
  }

  return (
    <section className="products-section" aria-labelledby="products-title">
      <div className="collection-hero">
        <div className="collection-hero-copy">
          <span className="section-eyebrow">
            <i /> The NOIRÉ fragrance wardrobe
          </span>
          <h1 id="products-title">
            Find your <em>signature.</em>
          </h1>
          <p>
            Intimate, expressive and impossible to mistake for anyone else. Meet
            the scents that stay with you.
          </p>
        </div>
        <div className="collection-hero-art">
          <img
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=90"
            alt="Minimal fragrance bottle in warm light"
          />
          <span>
            SCENT IS A<br />
            FORM OF MEMORY.
          </span>
        </div>
      </div>
      
      <div className="collection-toolbar">
        <div className="collection-result-count">
          <strong>{String(filteredProducts.length).padStart(2, "0")}</strong>
          <span>fragrances</span>
        </div>
        <div className="collection-controls">
          <label className="product-search">
            <span className="search-glyph" aria-hidden="true" />
            <span className="sr-only">Search fragrances</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search scents or notes"
            />
          </label>
          <label className="sort-control">
            <span className="sr-only">Sort fragrances</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </label>
        </div>
      </div>
      <div
        className="category-filters"
        role="group"
        aria-label="Filter fragrances by category"
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category ? "active" : ""}
            aria-pressed={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      {filteredProducts.length ? (
        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="no-products">
          <span className="section-eyebrow">A different direction</span>
          <h2>No scents found.</h2>
          <p>Try another name or note, or return to the full collection.</p>
          <button
            type="button"
            className="button button-dark"
            onClick={resetFilters}
          >
            Reset filters <span>↗</span>
          </button>
        </div>
      )}
    </section>
  )
}

export default ProductList
