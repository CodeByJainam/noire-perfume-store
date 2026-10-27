import { Link } from "react-router-dom"

function AboutPage() {
  return (
    <main className="story-page">
      <section className="story-hero-main">
        <div className="container-main">
          <div className="story-hero">
            <div className="story-hero-copy">
              <span className="section-eyebrow">
                <i /> The story of NOIRÉ
              </span>
              <h1>
                Presence, without
                <br />
                <em>the noise.</em>
              </h1>
              <p>
                We create fragrance for the feeling that stays long after the
                moment has passed.
              </p>
            </div>
            <div className="story-hero-image">
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=90"
                alt="A perfume bottle in a quiet, warm setting"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="story-statement">
        <div className="container-main">
          <div className="story-statement-grid">
            <span className="section-eyebrow">
              <i /> What we believe
            </span>
            <div>
              <h2>
                Scent is the closest thing to <em>memory you can wear.</em>
              </h2>
              <p>
                NOIRÉ began with a simple thought: fragrance should feel
                personal. Not dictated by a season, a trend or a room full of
                people. It should feel like an extension of you—subtle when you
                want it to be, unforgettable when it matters.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="story-values">
        <div className="story-values-image">
          <img
            src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=90"
            alt="Minimal perfume and botanical ingredients"
            loading="lazy"
          />
        </div>
        <div className="story-values-copy">
          <span className="section-eyebrow">
            <i /> Our point of view
          </span>
          <h2>
            Considered
            <br />
            <em>in every detail.</em>
          </h2>
          <div className="value-row">
            <span>01</span>
            <div>
              <h3>Intention over excess</h3>
              <p>
                Every detail should have a reason to be there, from the first
                impression to the final note.
              </p>
            </div>
          </div>
          <div className="value-row">
            <span>02</span>
            <div>
              <h3>Character over trends</h3>
              <p>
                We look for compositions with a point of view, not a shelf life
                tied to a trend.
              </p>
            </div>
          </div>
          <div className="value-row">
            <span>03</span>
            <div>
              <h3>Your story comes first</h3>
              <p>
                The best fragrance leaves room for the person wearing it to make
                it their own.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="story-bottom">
        <span className="section-eyebrow">
          <i /> A scent to call your own
        </span>
        <h2>
          Meet the fragrance
          <br />
          <em>that feels like you.</em>
        </h2>
        <Link to="/collection" className="button button-dark">
          Explore the collection <span>↗</span>
        </Link>
      </section>
    </main>
  )
}

export default AboutPage
