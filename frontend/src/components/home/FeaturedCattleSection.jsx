import { Link } from "react-router-dom";
import CowCard from "../CowCard";

export const PREMIUM_LISTINGS = [
  {
    id: 1,
    title: "HF Cow — High Yield",
    company: "Dairy Farm",
    location: "India, India",
    ownerName: "User Name",
    img: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80",
  },
  {
    id: 2,
    title: "Pure Gir Cow",
    company: "Gir Farm",
    location: "India, India",
    ownerName: "User Name",
    img: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80",
  },
  {
    id: 3,
    title: "Murrah Buffalo",
    company: "Breeders",
    location: "India India",
    ownerName: "User Name",
    img: "https://images.unsplash.com/photo-1501706362039-c06b2d715385?w=400&q=80",
  },
  {
    id: 4,
    title: "Sahiwal Cow",
    company: "Livestock",
    location: "India, India",
    ownerName: "User Name",
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80",
  },
];

export default function FeaturedCattleSection({ products = [] }) {
  const displayProducts =
    products && products.length > 0 ? products.slice(0, 4) : PREMIUM_LISTINGS;

  return (
    <section className="dm-section premium-section">
      <div className="section-inner">
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span
              className="eyebrow"
              style={{
                display: "block",
                marginBottom: 4,
                color: "#ff7602",
                fontWeight: 600,
              }}
            >
              Featured Cattle
            </span>
            <h2 style={{ margin: 0 }}>
              Grow Your Dairy Business with High-Quality Cattle
            </h2>
          </div>
          <Link to="/pashu" className="view-all-link">
            View All Listings →
          </Link>
        </div>

        <div className="products-grid">
          {displayProducts.map((p) => (
            <CowCard key={p._id || p.id} cow={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
