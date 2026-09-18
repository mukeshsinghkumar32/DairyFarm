import { Link } from "react-router-dom";
export const REGIONS = [
  {
    name: "Rajasthan",
    cattle: "Gir, Tharparkar",
    img: "https://images.unsplash.com/photo-1477587458883-47145ed31bdc?w=350&q=85",
  },
  {
    name: "Punjab",
    cattle: "Murrah, HF Cow",
    img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=350&q=85",
  },
  {
    name: "Haryana",
    cattle: "HF, Jersey, Murrah",
    img: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=350&q=85",
  },
  {
    name: "Uttar Pradesh",
    cattle: "Sahiwal, HF Cow",
    img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=350&q=85",
  },
  {
    name: "Gujarat",
    cattle: "Gir, Kankrej",
    img: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=350&q=85",
  },
  {
    name: "Bihar",
    cattle: "Tharparkar, HF",
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=350&q=85",
  },
  {
    name: "Madhya Pradesh",
    cattle: "Sahiwal, Gir",
    img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=350&q=85",
  },
  {
    name: "Maharashtra",
    cattle: "HF, Jersey",
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=350&q=85",
  },
  // {
  //   name: "West Bengal",
  //   cattle: "Murrah, HF",
  //   img: "https://images.unsplash.com/photo-1501706362039-c06b2d715385?w=350&q=85",
  // },
  // {
  //   name: "Himachal Pradesh",
  //   cattle: "Jersey, HF",
  //   img: "https://images.unsplash.com/photo-1527153818091-1a9638521e2a?w=350&q=85",
  // },
];

export default function RegionsSection({ regions = REGIONS }) {
  const displayRegions = regions && regions.length > 0 ? regions : REGIONS;

  return (
    <section className="dm-section regions-section">
      <div className="section-inner">
        <div className="section-head">
          <span className="eyebrow">Pan-India Network</span>
          <h2>Fresh Milk. Trusted Quality to Every Home</h2>
          <p>
            Discover trusted dairy animals from leading breeds and connect with
            buyers and sellers across major states.
          </p>
        </div>
        <div className="sellers-grid-pro">
          {displayRegions.map((regions) => (
            <Link
              key={regions.name}
              to={`/state-wise-company/${regions.name}`}
              className="supplier-card-link"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
            >
              <div className="seller-card-pro">
                <div className="seller-card-info">
                  <div className="supplier-name-link">
                    <h4>{regions.name}</h4>
                  </div>
                  <span>{regions.cattle}</span>
                  <div className="seller-verified">
                    <span>✓ Top-Rated State</span>
                  </div>
                </div>
                <div className="seller-card-action">
                  <span
                    className="btn-view-profile"
                    style={{
                      padding: "6px 14px",
                      fontSize: 12,
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
