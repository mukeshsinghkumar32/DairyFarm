import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="pd-hero-banner">
      <div className="pashu-container pd-hero-inner">
        {/* Left Column: Headline & 3 CTAs */}
        <div className="pd-hero-left">
          <h1 className="pd-hero-title">
            Buy and Sell
            <span className="pd-hero-highlight">High-Quality Dairy Animals</span>
            with Confidence
          </h1>
          <p className="pd-hero-desc">
            Connect directly with verified farmers and dairy sellers across India.
            Find healthy cows, buffaloes, milk products, feed, fodder and dairy
            equipment &mdash; all in one place.
          </p>
          <div className="pd-hero-buttons">
            <Link className="pd-hero-btn-primary" to="/pashu">
              Browse Dairy Animals
            </Link>
            <Link className="pd-hero-btn-glass" to="/seller/register">
              List Your Dairy Product
            </Link>
            <Link className="pd-hero-btn-glass" to="/consultancy">
              Talk to Expert
            </Link>
          </div>
        </div>

        {/* Right Column: 3 Stacked Stat Badges */}
        <div className="pd-hero-stats">
          <div className="pd-hero-stat-box pd-stat-orange">
            <span className="pd-stat-val">15000+</span>
            <span className="pd-stat-lbl">Happy Farmers</span>
          </div>
          <div className="pd-hero-stat-box pd-stat-green-bright">
            <span className="pd-stat-val">2500+</span>
            <span className="pd-stat-lbl">Verified Sellers</span>
          </div>
          <div className="pd-hero-stat-box pd-stat-green-dark">
            <span className="pd-stat-val">2000+</span>
            <span className="pd-stat-lbl">Products Listed</span>
          </div>
        </div>
      </div>
    </section>
  );
}

