import { Link } from "react-router-dom";

export default function CtaBannerSection() {
  return (
    <div className="green-cta-banner">
      <div className="green-cta-inner">
        <div>
          <h2>Run a successful Dairy Farm Business with Sohani Mitra</h2>
          <p
            style={{
              color: "rgba(255,255,255,.8)",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            Connect with verified buyers, grow your customer base and increase
            profits.
          </p>
        </div>
        <Link className="btn-orange" to="/free-listing">
          Get Started Free →
        </Link>
      </div>
    </div>
  );
}
