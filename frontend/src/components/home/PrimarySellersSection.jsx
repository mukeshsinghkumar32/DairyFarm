import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { getImageUrl } from "../../utils/imageUrl";
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
export const PRIMARY_SELLERS = [];

const PALETTE = [
  "#ff7600",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#059669",
  "#d97706",
  "#0891b2",
  "#4f46e5",
  "#ea580c",
  "#0d9488",
  "#e11d48",
];

function getInitials(name = "") {
  if (!name) return "DF";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function PrimarySellersSection({ sellers = [] }) {
  const [data, setData] = useState(sellers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sellers && sellers.length > 0) {
      setData(sellers.slice(0, 12));
    } else {
      setLoading(true);
      api
        .get("/sellers?status=active&per_page=12")
        .then((res) => {
          const list = res.data?.data?.data || res.data?.data || [];
          setData(list.slice(0, 12));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [sellers]);

  const displaySellers = data && data.length > 0 ? data : [];

  return (
    <section className="dm-section sellers-section-pro">
      <div className="section-inner">
        <div className="section-head">
          <span className="eyebrow">Our Network</span>
          <h2>Meet Our Trusted Dairy Sellers</h2>
          <p>
            Connect with reliable farmers, breeders, and dairy businesses
            offering quality animals across India.
          </p>
        </div>

        {loading && displaySellers.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#64748b",
            }}
          >
            Loading trusted dairy sellers...
          </div>
        ) : (
          <div className="sellers-grid-pro">
            {displaySellers.map((seller, idx) => {
              const displayName =
                seller.business_name || seller.name || "Verified Dairy Farm";
              const locationText =
                [seller.city, seller.state].filter(Boolean).join(", ") ||
                seller.location ||
                "India";
              const profileLink = `/supplier/${slugify(
                seller.business_name ||
                  seller._id ||
                  seller.id ||
                  encodeURIComponent(displayName),
              )}`;
              const initials = seller.initials || getInitials(displayName);
              const bgColor = seller.color || PALETTE[idx % PALETTE.length];
              const avatarImg =
                seller.business_image || seller.avatar
                  ? getImageUrl(seller.business_image || seller.avatar)
                  : null;

              return (
                <Link
                  key={seller.id || seller._id || seller.username || idx}
                  to={profileLink}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <div className="seller-card-pro">
                    <div
                      className="seller-avatar-pro"
                      style={{ background: bgColor }}
                    >
                      {avatarImg ? (
                        <img
                          src={avatarImg}
                          alt={displayName}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerText = initials;
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="seller-card-info">
                      <h4>{displayName}</h4>
                      <span>📍 {locationText}</span>
                      <div className="seller-verified">
                        <span>✓ Verified Seller</span>
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
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link
            to="/state-wise-company/All"
            className="btn-orange"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Explore All Dairy Farms Across India ➔
          </Link>
        </div>
      </div>
    </section>
  );
}
