import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
export const SUPPLIERS = [
  {
    id: 1,
    name: "Dairy Farm",
    location: "India",
    memberSince: "2022",
    ownerName: "User Name",
    logo: "https://www.dairymitra.com/uploads/businessprofile/16741277974580.jpg",
  },
  {
    id: 2,
    name: "Dairy Farm",
    location: "India",
    memberSince: "2022",
    ownerName: "User Name",
    logo: "https://www.dairymitra.com/uploads/businessprofile/16741270577765.png",
  },
  {
    id: 3,
    name: "Dairy Farm",
    location: "India",
    memberSince: "2022",
    ownerName: "User Name",
    logo: "https://www.dairymitra.com/uploads/businessprofile/16741272917369.png",
  },
  {
    id: 4,
    name: "Dairy Farm",
    location: "India",
    memberSince: "2023",
    ownerName: "User Name",
    logo: "https://www.dairymitra.com/uploads/businessprofile/16741272345017.png",
  },
  {
    id: 5,
    name: "Marwah Dairy Farm",
    location: "Karnal",
    memberSince: "2023",
    ownerName: "Jaspreet",
    logo: "https://www.dairymitra.com/uploads/businessprofile/16741271727069.png",
  },
  {
    id: 6,
    name: "Dharamvir Dairy Farm",
    location: "Karnal",
    memberSince: "2023",
    ownerName: "Dharamvir",
    logo: "https://www.dairymitra.com/uploads/businessprofile/16741271562255.png",
  },
];

export default function SuppliersSection({ suppliers, sellers }) {
  const dynamicSuppliers =
    sellers && sellers.length > 0
      ? sellers.map((s) => ({
          id: s.id || s._id,
          name: s.business_name || s.name || "Dairy Farm",
          location: [s.city, s.state].filter(Boolean).join(", ") || "India",
          memberSince: s.createdAt
            ? new Date(s.createdAt).getFullYear()
            : "2023",
          ownerName: s.name || "Verified Seller",
          logo: getImageUrl(
            s.business_image || s.avatar,
            "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=150&q=80",
          ),
        }))
      : suppliers || SUPPLIERS;

  const displaySuppliers = dynamicSuppliers;

  return (
    <section className="dm-section suppliers-section">
      <div className="section-inner">
        <div className="section-head">
          <span className="eyebrow">Verified Partners</span>
          <h2>Meet Trusted Suppliers Network Across India</h2>
          <p>
            Connect with India's top-rated dairy animal suppliers — verified,
            reviewed, and ready to serve.
          </p>
        </div>
        <div className="supplier-grid-pro">
          {displaySuppliers.map((s) => (
            <div className="supplier-card-pro" key={s.id}>
              {/* Featured badge top-right */}
              <div className="supplier-card-badge">⭐ FEATURED</div>

              {/* Left: Farm Circular/Emblem Logo */}
              <div className="supplier-logo-side">
                <img
                  src={s.logo}
                  alt={s.business_name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=150&q=80";
                  }}
                />
              </div>

              {/* Right: Farm Info & Actions */}
              <div className="supplier-info-side">
                <Link
                  to={`/supplier/${slugify(s.name)}`}
                  className="supplier-name-link"
                >
                  {s.name}
                </Link>
                <div className="supplier-meta-list">
                  <div className="supplier-meta-item">
                    <b>📍 {s.location}</b>
                  </div>
                  <div className="supplier-meta-item">
                    <span>Member Since :</span>
                    <b>{s.memberSince}</b>
                  </div>
                  <div className="supplier-meta-item">
                    <span>Owner Name :</span>
                    <b>{s.ownerName}</b>
                  </div>
                </div>
                <Link
                  to={`/supplier/${slugify(s.name)}`}
                  className="supplier-catalogue-btn"
                >
                  View Catalogue ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link className="btn-orange" to="/pashu">
            View All Suppliers →
          </Link>
        </div>
      </div>
    </section>
  );
}
