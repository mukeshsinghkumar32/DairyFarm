import { Link } from "react-router-dom";

export default function HowWeWorkSection() {
  const points = [
    "Verified and trusted sellers across India",
    "Wide range of healthy dairy animals and products",
    "Competitive prices and secure transactions",
    "Expert advice and customer support",
    "Easy listing and fast communication",
  ];

  return (
    <section className="pd-why-sec">
      <div className="pashu-container">
        <div className="pd-why-card">
          {/* Left Column: Bullet Points & CTA */}
          <div className="pd-why-left">
            <span className="pd-why-tag">WHY PASHUDAIRY</span>
            <h2 className="pd-why-title">How We Help Farmers Grow</h2>
            <ul className="pd-why-list">
              {points.map((point, index) => (
                <li key={index} className="pd-why-item">
                  <span className="pd-why-check">&#10003;</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link to="/seller/register" className="pd-btn-community">
              Join Our Community &rarr;
            </Link>
          </div>

          {/* Right Column: 2x2 Stats Grid */}
          <div className="pd-why-stats-grid">
            <div className="pd-stat-box">
              <span className="pd-stat-icon">🏆</span>
              <div className="pd-stat-box-num">15000+</div>
              <div className="pd-stat-box-label">Happy Farmers</div>
            </div>
            <div className="pd-stat-box">
              <span className="pd-stat-icon">🤝</span>
              <div className="pd-stat-box-num">2,500+</div>
              <div className="pd-stat-box-label">Verified Sellers</div>
            </div>
            <div className="pd-stat-box">
              <span className="pd-stat-icon">📦</span>
              <div className="pd-stat-box-num">2,000+</div>
              <div className="pd-stat-box-label">Products Listed</div>
            </div>
            <div className="pd-stat-box">
              <span className="pd-stat-icon">👍</span>
              <div className="pd-stat-box-num">98%</div>
              <div className="pd-stat-box-label">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
