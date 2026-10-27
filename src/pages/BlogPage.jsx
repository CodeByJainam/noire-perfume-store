import { Link } from "react-router-dom"

const articles = [
  {
    number: "01",
    slug: "the-art-of-perfumery",
    category: "Fragrance notes",
    title: "The art of finding your signature scent",
    excerpt:
      "A little curiosity goes a long way. Start with what draws you in, then follow the notes that feel like you.",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85",
    read: "4 min read",
  },
  {
    number: "02",
    slug: "building-a-fragrance-wardrobe",
    category: "The ritual",
    title: "How to make fragrance last longer",
    excerpt:
      "From where you apply it to how you store it, small rituals can make a difference to your scent experience.",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
    read: "3 min read",
  },
  {
    number: "03",
    slug: "understanding-fragrance-notes",
    category: "A closer look",
    title: "Why the same perfume smells different on everyone",
    excerpt:
      "Fragrance is a conversation between the composition, your skin and the world around you.",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=85",
    read: "5 min read",
  },
]

function BlogPage() {
  const featuredArticle = articles[0]

  return (
    <main className="journal-page">
      {/* HERO */}
      <section className="journal-hero">
        <div className="container-main">
          <span className="section-eyebrow">
            <i /> The NOIRÉ journal
          </span>

          <h1>
            Notes on the
            <br />
            <em>art of scent.</em>
          </h1>

          <p>
            Thoughts, rituals and little discoveries for a more personal
            relationship with fragrance.
          </p>

          <div className="journal-hero-mark">N.</div>
        </div>
      </section>

      {/* JOURNAL CONTENT */}
      <section className="journal-content">
        <div className="container-main">
          {/* FEATURED ARTICLE */}
          <div className="journal-featured">
            <div className="journal-featured-image">
              <img
                src={featuredArticle.image}
                alt="A perfume bottle in soft natural light"
              />
            </div>

            <div className="journal-featured-copy">
              <span className="section-eyebrow">
                <i /> Featured story · {featuredArticle.read}
              </span>

              <h2>{featuredArticle.title}</h2>

              <p>{featuredArticle.excerpt}</p>

              <Link
                to={`/blog/${featuredArticle.slug}`}
                className="coming-soon-blog"
              >
                Read story
              </Link>
            </div>
          </div>

          {/* MORE ARTICLES HEADING */}
          <div className="journal-list-heading">
            <span className="section-eyebrow">
              <i /> More to explore
            </span>

            <span>Ideas for your daily ritual</span>
          </div>

          {/* ARTICLE GRID */}
          <div className="journal-grid">
            {articles.slice(1).map((article) => (
              <article className="journal-card" key={article.number}>
                <div className="journal-card-image">
                  <Link
                    to={`/blog/${article.slug}`}
                    aria-label={`Read ${article.title}`}
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                    />

                    <span>{article.number}</span>
                  </Link>
                </div>

                <div className="journal-card-meta">
                  <span>{article.category}</span>
                  <span>{article.read}</span>
                </div>

                <h2>{article.title}</h2>

                <p>{article.excerpt}</p>

                <Link to={`/blog/${article.slug}`} className="coming-soon-blog">
                  Read story
                </Link>
              </article>
            ))}
          </div>

          {/* JOURNAL NOTE */}
          <div className="journal-note">
            The NOIRÉ Journal is a preview of upcoming editorial stories.
            Articles will be published here soon.
          </div>

          {/* COLLECTION CTA */}
          <div className="journal-cta">
            <div>
              <span className="section-eyebrow">
                <i /> Take it with you
              </span>

              <h2>
                Find a scent for
                <br />
                <em>your own story.</em>
              </h2>
            </div>

            <Link to="/collection" className="button button-dark">
              Explore fragrances <span>↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default BlogPage
