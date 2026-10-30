import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"

export const blogArticles = [
  {
    slug: "the-art-of-perfumery",
    category: "THE ART OF SCENT",
    title: "The Art of Perfumery: Finding a Scent That Feels Like You",
    excerpt:
      "A fragrance is more than a finishing touch. It is a quiet expression of memory, mood, and individuality.",
    author: "NOIRÉ Editorial",
    date: "October 12, 2026",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1800&q=90",
    imageAlt: "Perfume bottle in warm, understated light",
    intro:
      "The most memorable fragrances rarely announce themselves loudly. They unfold slowly, settle close to the skin, and become part of the way a moment is remembered.",
    sections: [
      {
        heading: "Begin with how you want to feel",
        paragraphs: [
          "Before choosing notes, think about the feeling you want your fragrance to leave behind. Do you gravitate towards the calm clarity of fresh citrus, the soft intimacy of musk, or the depth of woods and amber?",
          "There is no single correct way to wear a scent. The right fragrance is the one that feels natural on you, whether it becomes your everyday signature or something reserved for a particular evening.",
        ],
      },
      {
        heading: "Give a fragrance time to unfold",
        paragraphs: [
          "Perfume changes as it wears. The first impression may be bright and sparkling; the heart can become softer, floral, or aromatic; and the base often reveals woods, resins, vanilla, or musk.",
          "When trying a new fragrance, let it rest on your skin before deciding. A few quiet hours can tell you much more than the first spray.",
        ],
      },
      {
        heading: "Make it your own",
        paragraphs: [
          "Apply fragrance to clean, moisturised skin and begin with a light hand. Heat and movement can influence how a scent develops, so notice how it wears through your day.",
          "Ultimately, a signature scent is not about following a rule. It is about finding a composition that feels unmistakably yours.",
        ],
      },
    ],
    quote:
      "A signature scent is a feeling you return to, not a rule you follow.",
  },
  {
    slug: "understanding-fragrance-notes",
    category: "FRAGRANCE GUIDE",
    title: "Understanding Fragrance Notes, From First Spray to Lasting Trail",
    excerpt:
      "Discover how top, heart, and base notes work together to create the character of a perfume.",
    author: "NOIRÉ Editorial",
    date: "October 8, 2026",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1800&q=90",
    imageAlt: "Perfume and botanical ingredients arranged on a neutral surface",
    intro:
      "A perfume is a composition that evolves. Understanding its layers can help you choose a fragrance with confidence and enjoy the way it changes throughout the day.",
    sections: [
      {
        heading: "Top notes: the first impression",
        paragraphs: [
          "Top notes are often the first aromas you notice after spraying. Citrus, light herbs, and bright aromatic notes are common choices because they create an immediate introduction.",
          "They are usually more fleeting, so try not to judge a fragrance by this opening alone.",
        ],
      },
      {
        heading: "Heart notes: the character",
        paragraphs: [
          "As the opening softens, heart notes begin to shape the fragrance. Florals, spices, and aromatic accords can add softness, warmth, or complexity.",
          "This middle stage is often where the personality of a perfume becomes easier to understand.",
        ],
      },
      {
        heading: "Base notes: the lasting impression",
        paragraphs: [
          "Woods, amber, vanilla, and musk are often found in a fragrance's base. These notes can give a composition depth and help create its lingering trail.",
          "The balance between all three layers is what makes a perfume feel complete.",
        ],
      },
    ],
    quote: "A fragrance is not a still image; it is a story unfolding on skin.",
  },
  {
    slug: "building-a-fragrance-wardrobe",
    category: "THE NOIRÉ JOURNAL",
    title: "Building a Fragrance Wardrobe for Every Version of You",
    excerpt:
      "A considered edit of scents can take you from bright mornings to intimate evenings.",
    author: "NOIRÉ Editorial",
    date: "October 3, 2026",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1800&q=90",
    imageAlt:
      "A refined perfume bottle photographed against a warm neutral background",
    intro:
      "A fragrance wardrobe does not need to be large. A few thoughtful compositions can reflect different moods, occasions, and sides of your personality.",
    sections: [
      {
        heading: "One for everyday ease",
        paragraphs: [
          "For daytime, consider scents that feel effortless to wear. Fresh citrus, green notes, airy florals, and clean musks can offer a subtle presence without overwhelming a space.",
          "Choose something you enjoy returning to, especially on ordinary days.",
        ],
      },
      {
        heading: "One for depth and warmth",
        paragraphs: [
          "For evenings or cooler weather, woods, amber, spices, and resins can feel enveloping and expressive. These richer profiles often create a more intimate atmosphere.",
          "Try different concentrations and application amounts to find the balance that suits you.",
        ],
      },
      {
        heading: "One that feels unexpected",
        paragraphs: [
          "The final place in your wardrobe is for curiosity: an unusual note, a bold floral, or a composition you would not normally reach for.",
          "Personal style grows through experimentation. Let your fragrance collection evolve with you.",
        ],
      },
    ],
    quote:
      "A thoughtful fragrance wardrobe reflects your moods, not just your calendar.",
  },
]

const fallbackImage =
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85"

function ArticleImage({ src, alt, className = "" }) {
  return (
    <img
      className={className}
      src={src || fallbackImage}
      alt={alt || "NOIRÉ fragrance editorial"}
      onError={(event) => {
        event.currentTarget.onerror = null
        event.currentTarget.src = fallbackImage
      }}
    />
  )
}

export default function BlogPageDetail() {
  const { slug } = useParams()
  const article = blogArticles.find((item) => item.slug === slug)

  useEffect(() => {
    document.title = article
      ? `${article.title} | NOIRÉ Journal`
      : "Story Not Found | NOIRÉ Journal"
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [article])

  if (!article) {
    return (
      <main className="noire-blog-detail">
        <div className="nbd-not-found">
          <span className="nbd-eyebrow">THE NOIRÉ JOURNAL</span>
          <h1>This story is not on our shelves.</h1>
          <p>
            The article may have moved. Explore the journal to discover another
            story.
          </p>
          <Link className="nbd-text-link" to="/blog">
            Back to the journal <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </main>
    )
  }

  const relatedArticles = blogArticles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2)

  return (
    <main className="noire-blog-detail">
      <div className="container-main">
        <div className="nbd-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/blog">Journal</Link>
          <span>/</span>
          <span>{article.category}</span>
        </div>
      </div>
      <div className="nbd-article-header">
        <div className="container-main">
          <span className="section-eyebrow">{article.category}</span>
          <h1>{article.title}</h1>
          <p className="nbd-article-excerpt">{article.excerpt}</p>
          <div className="nbd-article-meta">
            <span>{article.author}</span>
            <span className="nbd-meta-dot">•</span>
            <time>{article.date}</time>
            <span className="nbd-meta-dot">•</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
      <div className="nbd-hero-image-wrap">
        <ArticleImage
          className="nbd-hero-image"
          src={article.image}
          alt={article.imageAlt}
        />
        <figcaption>
          THE NOIRÉ JOURNAL — A CONSIDERED SCENT FOR EVERY VERSION OF YOU
        </figcaption>
      </div>
      <div className="nbd-article-layout">
        <aside className="nbd-article-aside">
          <span className="nbd-aside-label">IN THIS STORY</span>
          <a href="#story-introduction">Introduction</a>
          {article.sections.map((section, index) => (
            <a href={`#story-section-${index}`} key={section.heading}>
              {section.heading}
            </a>
          ))}
        </aside>
        <article className="nbd-article-body">
          <p id="story-introduction" className="nbd-article-intro">
            {article.intro}
          </p>
          {article.sections.map((section, index) => (
            <section
              className="nbd-copy-section"
              id={`story-section-${index}`}
              key={section.heading}
            >
              <span className="nbd-section-number">0{index + 1}</span>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {index === 0 && (
                <div className="nbd-inline-image">
                  <ArticleImage src={article.image} alt={article.imageAlt} />
                </div>
              )}
            </section>
          ))}
          <blockquote className="nbd-article-quote">
            <span aria-hidden="true">“</span>
            <p>{article.quote}</p>
          </blockquote>
          <div className="nbd-article-end">
            <span>END OF STORY</span>
            <span>NOIRÉ — EST. IN EVERY MOMENT</span>
          </div>
        </article>
      </div>
      <section className="nbd-related-section">
        <div className="nbd-related-heading">
          <div>
            <span className="nbd-eyebrow">CONTINUE READING</span>
            <h2>
              Stories worth <em>staying for.</em>
            </h2>
          </div>
          <Link to="/blog" className="nbd-text-link">
            All stories <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="nbd-related-grid">
          {relatedArticles.map((item, index) => (
            <Link
              to={`/blog/${item.slug}`}
              className="nbd-related-card"
              key={item.slug}
            >
              <div className="nbd-related-image-wrap">
                <ArticleImage
                  src={item.image}
                  alt={item.imageAlt}
                  className="nbd-related-image"
                />
                <span className="nbd-related-index">0{index + 1}</span>
                <span className="nbd-related-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
              <div className="nbd-related-copy">
                <span>
                  {item.category} · {item.readTime}
                </span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <span className="nbd-card-link">Read story ↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
