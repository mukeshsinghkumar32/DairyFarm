import { useState } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";

const DEFAULT_COW_IMG =
  "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80";

export default function CowCard({ cow }) {
  const [showNumber, setShowNumber] = useState(false);

  const img = getImageUrl(cow.featured_image || cow.img, DEFAULT_COW_IMG);

  const title = cow.name || cow.title || "HF Cow";
  const company =
    cow.company ||
    (cow.category?.name ? `${cow.category.name} Farm` : "Vansh Dairy Farm");
  const location = cow.location || "Karnal";
  const ownerName = cow.owner_name || cow.ownerName || "Pritam";

  // Build slug for detail page link
  const detailSlug = cow.slug || cow._id || cow.id;

  return (
    <article className="cattle-card-dm">
      {/* Left: Cattle photo — clickable to detail */}
      <Link
        to={detailSlug ? `/pashu/${detailSlug}` : "#"}
        className="cattle-img-wrap"
      >
        {/* FEATURED badge overlays the image */}
        <div className="cattle-badge-featured">⭐ FEATURED</div>
        <img
          src={img}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80";
          }}
        />
      </Link>

      {/* Right: Info & Actions */}
      <div className="cattle-info-wrap">
        <Link
          to={detailSlug ? `/pashu/${detailSlug}` : "#"}
          className="cattle-title-link"
        >
          <h3 className="cattle-title">{title}</h3>
        </Link>

        <div className="cattle-meta-list">
          <div className="cattle-meta-row">
            <span className="cattle-label">Company :</span>
            <b className="cattle-val">{company}</b>
          </div>
          <div className="cattle-meta-row">
            <span className="cattle-label">Location :</span>
            <b className="cattle-val">{location}</b>
          </div>
          <div className="cattle-meta-row">
            <span className="cattle-label">Owner Name :</span>
            <b className="cattle-val">{ownerName}</b>
          </div>
        </div>

        <div className="cattle-card-buttons">
          <Link
            to={
              detailSlug
                ? `/pashu/${detailSlug}`
                : `/contact-us?cattle=${encodeURIComponent(title)}`
            }
            className="btn-view-number"
          >
            <span>📞 View Number</span>
          </Link>
          <Link
            to={
              detailSlug
                ? `/pashu/${detailSlug}`
                : `/contact-us?cattle=${encodeURIComponent(title)}`
            }
            className="btn-send-inquiry"
          >
            <span>✈</span> <span>Send Inquiry</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
