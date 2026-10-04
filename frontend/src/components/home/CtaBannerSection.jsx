import { Link } from "react-router-dom";

export default function CtaBannerSection() {
  return (
    <div className="pashu-container">
      <div className="pd-callout-banner">
        <div className="pd-callout-inner">
          <div className="pd-callout-left">
            <div className="pd-callout-icon">🐄</div>
            <div>
              <h3 className="pd-callout-title">
                Your Trusted Partner in Dairy Farming
              </h3>
              <p className="pd-callout-desc">
                Quality animals, genuine sellers, fair prices and complete support.
              </p>
            </div>
          </div>
          <Link to="/seller/register" className="pd-btn-callout">
            Get Started Free &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
