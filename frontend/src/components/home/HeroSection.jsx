import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="dm-hero">
      <div className="dm-hero-inner">
        <div className="dm-hero-content animate-fade-in">
          <div className="dm-hero-eyebrow">
            🏆 India's No. 1 B2B Dairy Animal Marketplace
          </div>
          <h1>
            Buy and Sell
            <br />
            <em>High-Quality Breeding Cattle</em>
            <br />
            Contact us Today!
          </h1>
          <p className="dm-hero-sub">
            Connect buyers and sellers across India. Find verified dairy animals
            with detailed breed info, health records, and competitive pricing —
            all in one platform.
          </p>
          <div className="dm-hero-actions">
            <Link className="btn-orange" to="/pashu">
              🐄 Browse Pashu
            </Link>
            <Link className="btn-outline-white" to="/free-listing">
              📋 List for Free
            </Link>
            <a className="btn-outline-white" href="tel:+918208127243">
              ☎ Talk to Expert
            </a>
          </div>
        </div>
        <div className="dm-hero-stats animate-fade-in-2">
          <div className="stat-bubble orange">
            <strong>1500+</strong>
            <span>Buyers &amp; Sellers Served</span>
          </div>
          <div className="stat-bubble">
            <strong>2500+</strong>
            <span>Customers Satisfied</span>
          </div>
          <div className="stat-bubble">
            <strong>2000+</strong>
            <span>Businesses Listed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
