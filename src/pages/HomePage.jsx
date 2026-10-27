import { Link } from "react-router-dom"
import ProductCard from "../components/ProductsCard"

const rituals = [
  {
    number: "01",
    title: "Find your notes",
    text: "Warm woods, quiet florals or something with a little edge.",
  },
  {
    number: "02",
    title: "Make it personal",
    text: "Choose a fragrance that feels like you, not a passing trend.",
  },
  {
    number: "03",
    title: "Leave a trace",
    text: "A small, unforgettable detail that becomes part of your story.",
  },
]

function HomePage({ products, addToCart }) {
  const featuredProducts = products.slice(0, 4)
  return (
    <main className="home-page">
      <section className="home-hero">
        <div
          className="home-hero-image"
          role="img"
          aria-label="Sculptural perfume bottle surrounded by warm shadows"
        />
        <div className="home-hero-overlay" />
        <div className="home-hero-content container-main">
          <span className="hero-kicker">
            <i /> Eau de parfum · Made to be remembered
          </span>
          <h1>
            Wear the
            <br />
            <em>unspoken.</em>
          </h1>
          <p>
            Fragrance is the invisible part of your presence. Discover a scent
            that says what words never could.
          </p>
          <div className="home-hero-actions">
            <Link to="/collection" className="button button-light">
              Explore the collection <span>↗</span>
            </Link>
            
          </div>
        </div>
      </section>

      <section className="home-intro">
        <div className="container-main home-intro-grid">
          <div className="home-intro-label">
            <span className="section-eyebrow">
              <i /> Our point of view
            </span>
            <span className="intro-mark">N.</span>
          </div>
          <div className="home-intro-copy">
            <h2>
              Not just a fragrance.
              <br />
              <em>A feeling, bottled.</em>
            </h2>
            <p>
              NOIRÉ is an invitation to slow down and choose with intention.
              Thoughtful compositions, considered details and scents that become
              part of your own signature.
            </p>
            <Link to="/about" className="text-link">
              Get to know us <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-featured">
        <div className="container-main">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow">
                <i /> The fragrance wardrobe
              </span>
              <h2>
                Meet your next
                <br />
                <em>signature scent.</em>
              </h2>
            </div>
            <Link to="/collection" className="text-link">
              Shop all fragrances <span>↗</span>
            </Link>
          </div>
          {featuredProducts.length ? (
            <div className="products-grid home-products-grid">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="inline-notice">
              Our collection is being prepared. Please check back shortly.
            </p>
          )}
        </div>
      </section>

      <section className="home-note-section">
        <div className="home-note-image">
          <img
            src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1300&q=90"
            alt="Perfume bottle and soft light"
            loading="lazy"
          />
        </div>
        <div className="home-note-content">
          <span className="section-eyebrow">
            <i /> The NOIRÉ philosophy
          </span>
          <h2>
            Quiet luxury.
            <br />
            <em>Lasting presence.</em>
          </h2>
          <p>
            We believe the most memorable things don't need to be loud. They are
            felt in the details: a beautiful first note, a lingering warmth, the
            way a room remembers you.
          </p>
          <Link to="/blog" className="text-link">
            Read the scent journal <span>↗</span>
          </Link>
          <span className="note-watermark">NOIRÉ</span>
        </div>
      </section>

      <section className="home-rituals">
        <div className="container-main">
          <div className="section-heading-row ritual-heading">
            <div>
              <span className="section-eyebrow">
                <i /> Your ritual, reimagined
              </span>
              <h2>
                Make scent
                <br />
                <em>your own.</em>
              </h2>
            </div>
            <p>
              A few small choices can turn a fragrance into something
              unmistakably personal.
            </p>
          </div>
          <div className="ritual-grid">
            {rituals.map((ritual) => (
              <article key={ritual.number} className="ritual-item">
                <span>{ritual.number}</span>
                <h3>{ritual.title}</h3>
                <p>{ritual.text}</p>
                <div className="ritual-line" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-cta-backdrop" />
        <div className="home-cta-content">
          <span className="section-eyebrow">
            <i /> Your next chapter
          </span>
          <h2>
            Some things are
            <br />
            <em>better felt.</em>
          </h2>
          <p>Find the fragrance that feels like it was always yours.</p>
          <Link to="/collection" className="button button-light">
            Find your fragrance <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  )
}

export default HomePage
