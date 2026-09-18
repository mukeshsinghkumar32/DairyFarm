import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";

const COW_PLACEHOLDER =
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80";

function productImg(featured_image) {
  return getImageUrl(featured_image, COW_PLACEHOLDER);
}

export default function AdminTable({
  products,
  edit,
  remove,
  readOnly = false,
}) {
  const list = Array.isArray(products)
    ? products
    : Array.isArray(products?.data)
      ? products.data
      : [];

  return (
    <div className="admin-table-container">
      <table className="admin-data-table">
        <thead>
          <tr>
            <th style={{ width: "70px" }}>Photo</th>
            <th>Cattle Details</th>
            <th>Category</th>
            <th>Milk Yield</th>
            <th>Price</th>
            <th>Status</th>
            {!readOnly && <th style={{ textAlign: "right" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {!list || list.length === 0 ? (
            <tr>
              <td colSpan={readOnly ? 6 : 7} className="admin-empty-cell">
                <div style={{ fontSize: "28px", marginBottom: "6px" }}>🐄</div>
                <div>No cattle listings available yet</div>
              </td>
            </tr>
          ) : (
            list.map((p) => {
              const productUrl = `/pashu/${p.slug || p.id || p._id}`;
              return (
                <tr key={p.id || p._id}>
                  <td>
                    <Link
                      to={productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`View ${p.name} live details`}
                    >
                      <img
                        className="admin-cow-thumb"
                        src={productImg(p.featured_image)}
                        alt={p.name}
                        loading="lazy"
                        style={{
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = COW_PLACEHOLDER;
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      />
                    </Link>
                  </td>
                  <td>
                    <div className="admin-cattle-info">
                      <Link
                        to={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#0f172a",
                          fontSize: "14px",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#ff7600")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#0f172a")
                        }
                        title={`View ${p.name} live page`}
                      >
                        <span>{p.name}</span>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                          ↗
                        </span>
                      </Link>
                      <small>
                        <span>📍</span> {p.location || "Sohani Dairy"}
                      </small>
                      {p.seller_id && (
                        <small
                          style={{
                            color: "#0369a1",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            marginTop: "2px",
                          }}
                        >
                          <span>🏢</span>{" "}
                          {p.seller_id?.business_name ||
                            p.seller_id?.name ||
                            "Assigned Seller"}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge-cat">
                      {p.category?.name || "General"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                      {p.milk_capacity_min && p.milk_capacity_max
                        ? `${p.milk_capacity_min}–${p.milk_capacity_max} L`
                        : p.milk_capacity_max
                          ? `${p.milk_capacity_max} L`
                          : "—"}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge-price">
                      {p.price
                        ? `₹${Number(p.price).toLocaleString("en-IN")}`
                        : "On Request"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge-status ${p.availability || "available"}`}
                    >
                      {p.availability === "available" && "● "}
                      {p.availability || "Available"}
                    </span>
                  </td>
                  {!readOnly && (
                    <td style={{ textAlign: "right" }}>
                      <div
                        className="admin-table-actions"
                        style={{ justifyContent: "flex-end" }}
                      >
                        <button
                          type="button"
                          className="admin-btn-icon-edit"
                          onClick={() => edit(p)}
                          title="Edit Listing"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn-icon-del"
                          onClick={() => remove(p.id)}
                          title="Delete Listing"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
