import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";

const slugify = (text) =>
  text
    ? text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
    : "";

export default function CowCardList({
  cow,
  seller,
  item,
  product,
  displaySuppliers,
  suppliers,
  sellers,
  items,
  products,
}) {
  // If single item passed (e.g. <CowCardList key={p._id || p.id} cow={p} />)
  const single = cow || seller || item || product;
  if (single) {
    const isCowProduct = Boolean(
      cow ||
      product ||
      single.price ||
      single.breed ||
      single.milk_capacity_min ||
      single.milk_yield,
    );
    const id = single.id || single._id;
    const name =
      single.name || single.title || single.business_name || "Dairy Cattle";
    const logo = getImageUrl(
      single.featured_image ||
        single.img ||
        single.image ||
        single.business_image ||
        single.avatar ||
        single.logo,
      "/assets/suppliers/shree_krishna.jpg",
    );
    const location =
      single.location ||
      [single.city, single.state].filter(Boolean).join(", ") ||
      single.state ||
      "India";
    const memberSince =
      single.memberSince ||
      (single.createdAt ? new Date(single.createdAt).getFullYear() : "2023");
    const ownerName =
      single.ownerName ||
      single.owner_name ||
      single.seller?.name ||
      single.company ||
      "Verified Seller";

    const targetLink = isCowProduct
      ? `/pashu/${single.slug || id}`
      : `/supplier/${slugify(name)}`;

    return (
      <Link to={targetLink} className="pd-seller-card">
        {/* Left: Avatar with green border ring and mini verified check badge */}
        <div className="pd-seller-avatar-wrap">
          <img
            src={logo}
            alt={name}
            className="pd-seller-avatar"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/assets/suppliers/shree_krishna.jpg";
            }}
          />
          <span className="pd-avatar-mini-badge" title="Verified Seller">
            ✓
          </span>
        </div>

        {/* Right: Details */}
        <div className="pd-seller-info">
          <div className="pd-seller-badge-verified">
            <span className="pd-seller-verfiedv1">✓</span> VERIFIED
          </div>
          <div className="supplier-card-badge">⭐ FEATURED</div>
          <h3 className="pd-seller-name" title={name}>
            {name}
          </h3>
          <div className="pd-seller-location">{location}</div>
          <div className="pd-seller-tags">
            <span className="pd-member">
              {isCowProduct ? "Breed " : "Member Since "}
            </span>
            <b>{isCowProduct ? single.breed || "Dairy Cattle" : memberSince}</b>
          </div>
          <div className="pd-seller-tags">
            <span className="pd-member">
              {isCowProduct ? "Farm / Owner " : "Owner Name "}
            </span>
            <b>{ownerName}</b>
          </div>
          <span className="supplier-catalogue-btn">
            {isCowProduct ? "View Details ➔" : "View Catalogue ➔"}
          </span>
        </div>
      </Link>
    );
  }

  // Normalize incoming props so it accepts displaySuppliers, suppliers, sellers, items, or products
  let rawList = displaySuppliers || suppliers || sellers || items || products;

  let list = [];
  if (Array.isArray(rawList) && rawList.length > 0) {
    list = rawList.map((item, idx) => {
      // If already formatted
      if (item.logo && item.ownerName && item.memberSince) {
        return {
          id: item.id || item._id || `s-${idx}`,
          name: item.name || item.business_name || "Dairy Farm",
          location: item.location || item.state || "India",
          memberSince: item.memberSince || "2023",
          ownerName: item.ownerName || item.name || "Verified Seller",
          logo: item.logo,
        };
      }

      // If raw seller object from API
      return {
        id: item.id || item._id || `s-${idx}`,
        name: item.business_name || item.name || "Dairy Farm",
        location:
          item.location ||
          [item.city, item.state].filter(Boolean).join(", ") ||
          item.state ||
          "India",
        memberSince: item.createdAt
          ? new Date(item.createdAt).getFullYear()
          : item.memberSince || "2023",
        ownerName: item.name || item.ownerName || "Verified Seller",
        logo:
          item.logo ||
          getImageUrl(
            item.business_image || item.avatar,
            "/assets/suppliers/shree_krishna.jpg",
          ),
      };
    });
  } else {
    list = [];
  }

  return (
    <div className="pd-sellers-grid">
      {list.map((seller) => (
        <Link
          key={seller.id}
          to={`/supplier/${slugify(seller.name)}`}
          className="pd-seller-card"
        >
          {/* Left: Avatar with green border ring and mini verified check badge */}
          <div className="pd-seller-avatar-wrap">
            <img
              src={seller.logo}
              alt={seller.name}
              className="pd-seller-avatar"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/assets/suppliers/shree_krishna.jpg";
              }}
            />
            <span className="pd-avatar-mini-badge" title="Verified Seller">
              ✓
            </span>
          </div>

          {/* Right: Seller details */}
          <div className="pd-seller-info">
            <div className="pd-seller-badge-verified">
              <span className="pd-seller-verfiedv1">✓</span> VERIFIED
            </div>
            <div className="supplier-card-badge">⭐ FEATURED</div>
            <h3 className="pd-seller-name" title={seller.name}>
              {seller.name}
            </h3>
            <div className="pd-seller-location">{seller.location}</div>
            <div className="pd-seller-tags">
              <span className="pd-member">Member Since </span>
              <b>{seller.memberSince}</b>
            </div>
            <div className="pd-seller-tags">
              <span className="pd-member">Owner Name </span>
              <b style={{ color: "#ff7602" }}>{seller.ownerName}</b>
            </div>
            <span className="supplier-catalogue-btn">View Catalogue ➔</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
