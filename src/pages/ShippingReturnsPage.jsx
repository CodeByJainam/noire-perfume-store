import { Link } from "react-router-dom";

function ShippingReturnsPage() {
  return (
    <main className="care-page">
      <section className="care-hero container-main">
        <span className="section-eyebrow"><i /> CUSTOMER CARE</span>
        <h1>From our hands<br /><em>to yours.</em></h1>
        <p>Everything you need to know about receiving your NOIRÉ order and getting help if something is not quite right.</p>
      </section>
      <section className="care-policy container-main">
        <article><span>01</span><div><h2>Shipping</h2><p>Once your order is placed, our team will prepare it for dispatch. Available delivery options, charges and estimated timelines will be shown during checkout or shared in your order confirmation.</p></div></article>
        <article><span>02</span><div><h2>Order updates</h2><p>Keep your order confirmation handy. If you have a question about dispatch or delivery, contact our team with your order number.</p></div></article>
        <article><span>03</span><div><h2>Returns & exchanges</h2><p>For hygiene and product-safety reasons, fragrance return eligibility can depend on the condition of the item and applicable policy. Please contact us before sending an item back so we can guide you through the next steps.</p></div></article>
        <article><span>04</span><div><h2>Need a hand?</h2><p>Our team can help with delivery concerns, damaged parcels and order questions.</p><a className="care-inline-link" href="mailto:hello@noire.com">Contact customer care ↗</a></div></article>
      </section>
      <div className="care-back container-main"><Link to="/">← Back to home</Link></div>
    </main>
  );
}

export default ShippingReturnsPage;
