import { useState } from "react";
import { Link } from "react-router-dom";

const questions = [
  { q: "How do I choose the right fragrance?", a: "Start with the scent families and notes you naturally enjoy. Explore our collections and product descriptions to find a fragrance that feels like you." },
  { q: "How can I place an order?", a: "Browse Shop All or Collections, choose a fragrance and add it to Your Bag. When you are ready, continue to checkout to complete your order." },
  { q: "Where can I find my order details?", a: "Your order confirmation contains the details of your purchase. Keep it available when contacting customer care about an order." },
  { q: "Can I return or exchange a fragrance?", a: "Return and exchange eligibility depends on the item's condition and the applicable policy. Please contact customer care before sending an item back." },
  { q: "How should I store my perfume?", a: "Keep fragrance away from direct sunlight, heat and humidity. A cool, dry place helps preserve its character." },
];

function FAQsPage() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <main className="care-page">
      <section className="care-hero container-main">
        <span className="section-eyebrow"><i /> CUSTOMER CARE</span>
        <h1>Good to<br /><em>know.</em></h1>
        <p>A few answers to help make your NOIRÉ experience feel effortless.</p>
      </section>
      <section className="faq-list container-main" aria-label="Frequently asked questions">
        {questions.map((item, index) => (
          <div className={`faq-item ${openIndex === index ? "is-open" : ""}`} key={item.q}>
            <button type="button" aria-expanded={openIndex === index} onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
              <span>{item.q}</span><span className="faq-toggle">{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && <p>{item.a}</p>}
          </div>
        ))}
        <div className="faq-contact"><p>Still have a question?</p><a href="mailto:hello@noire.com">Talk to our team ↗</a></div>
      </section>
      <div className="care-back container-main"><Link to="/">← Back to home</Link></div>
    </main>
  );
}

export default FAQsPage;
