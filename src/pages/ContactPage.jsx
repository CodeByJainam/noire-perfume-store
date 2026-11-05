import { Link } from "react-router-dom";

function ContactPage() {
  return (
    <main className="care-page">
      <section className="care-hero container-main">
        <span className="section-eyebrow"><i /> WE'RE HERE TO HELP</span>
        <h1>A little help,<br /><em>when you need it.</em></h1>
        <p>Questions about a fragrance, an order or finding your signature scent? We would love to hear from you.</p>
      </section>
      <section className="care-content container-main">
        <div className="care-card">
          <span className="care-number">01 / GET IN TOUCH</span>
          <h2>Let's talk.</h2>
          <p>For product guidance, order enquiries or anything else, send our team a note.</p>
          <a className="care-link" href="mailto:hello@noire.com">hello@noire.com <span>↗</span></a>
          <small>Replace this address with your official NOIRÉ support email before launch.</small>
        </div>
        <div className="care-card care-card-dark">
          <span className="care-number">02 / THE NOIRÉ STORY</span>
          <h2>Fragrance is personal.</h2>
          <p>We believe the right scent says something about you without saying a word. Discover the thinking behind NOIRÉ.</p>
          <Link className="care-link" to="/about">Discover our story <span>↗</span></Link>
        </div>
      </section>
      <div className="care-back container-main"><Link to="/">← Back to home</Link></div>
    </main>
  );
}

export default ContactPage;
