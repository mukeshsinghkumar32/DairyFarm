import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";
import AdminPagination from "../../components/common/AdminPagination";

export default function Enquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });

  const fetchData = useCallback(
    async (page = 1, search = searchTerm, status = statusFilter) => {
      try {
        setLoading(true);
        const params = { page, limit: 10 };
        if (search && search.trim()) params.search = search.trim();
        if (status && status !== "all") params.status = status;

        const res = await api.get("/admin/enquiries", { params });
        const resData = res.data?.data || {};

        setItems(resData.data || (Array.isArray(resData) ? resData : []));
        setPagination({
          page: resData.current_page || page,
          limit: resData.per_page || 10,
          total: resData.total || 0,
          lastPage: resData.last_page || 1,
        });
      } catch (err) {
        console.error("Enquiries load error:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, searchTerm, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/enquiries/${id}`, { status: newStatus });
      fetchData(pagination.page);
    } catch (err) {
      alert(
        "Failed to update status: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this price inquiry?"))
      return;
    try {
      await api.delete(`/admin/enquiries/${id}`);
      fetchData(pagination.page);
    } catch (err) {
      alert(
        "Failed to delete enquiry: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, searchTerm, statusFilter);
  };

  return (
    <div className="admin-card">
      <div
        className="admin-card-header"
        style={{ flexWrap: "wrap", gap: "14px" }}
      >
        <div>
          <h2>⚡ Price Inquiries & Product Leads ({pagination.total})</h2>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Direct buyer inquiries with Product & Dairy Farm details
          </small>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Search by buyer, cattle, farm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              minWidth: "220px",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              background: "#fff",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="new">● New Inquiries</option>
            <option value="contacted">✓ Contacted</option>
            <option value="closed">✕ Closed</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Seller</th>
              <th>Buyer Location</th>
              <th style={{ width: "25%" }}>Inquiry Message</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: "3px solid #e2e8f0",
                      borderTopColor: "#ff7600",
                      borderRadius: "50%",
                      margin: "0 auto 10px",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <small style={{ color: "#64748b" }}>Loading price inquiries...</small>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-empty-cell">
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>✉️</div>
                  <div>No price inquiries found</div>
                </td>
              </tr>
            ) : (
              items.map((e) => {
                const targetProd = e.product_id || {};
                const prodName =
                  e.product_name || targetProd.name || "Dairy Cattle";
                const prodPrice = e.product_price || targetProd.price;
                const farmName =
                  e.farm_name ||
                  e.seller_id?.business_name ||
                  e.seller_name ||
                  "Sohani Dairy Farm";
                const dateStr = e.createdAt || e.created_at;

                const prodSlug =
                  targetProd.slug ||
                  (typeof e.product_id === "object"
                    ? e.product_id?.slug || e.product_id?._id
                    : e.product_id);
                const prodUrl = prodSlug
                  ? `/pashu/${prodSlug}`
                  : e.page_url || "/pashu";

                const sellerId =
                  e.seller_id?._id ||
                  e.seller_id?.id ||
                  (typeof e.seller_id === "string" ? e.seller_id : null);
                const sellerUrl = sellerId ? `/supplier/${sellerId}` : null;

                const itemId = e.id || e._id;

                return (
                  <tr key={itemId}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <b
                            style={{
                              color: "#0f172a",
                              fontSize: "14px",
                              display: "block",
                            }}
                          >
                            {e.name}
                          </b>
                          <a
                            href={`tel:${e.phone}`}
                            style={{
                              color: "#2563eb",
                              fontSize: "12px",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            📞 {e.phone}
                          </a>
                          {e.email && (
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              ✉️ {e.email}
                            </div>
                          )}
                          {dateStr && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                marginTop: "2px",
                              }}
                            >
                              📅{" "}
                              {new Date(dateStr).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Product Column */}
                    <td>
                      <a
                        href={prodUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontWeight: 700,
                          color: "#1d4ed8",
                          fontSize: "13.5px",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          cursor: "pointer",
                        }}
                        title="Open cattle product page in new tab"
                        onMouseOver={(ev) =>
                          (ev.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseOut={(ev) =>
                          (ev.currentTarget.style.textDecoration = "none")
                        }
                      >
                        <span>🐄 {prodName}</span>
                        <span style={{ fontSize: "11px", opacity: 0.75 }}>↗</span>
                      </a>
                      {prodPrice ? (
                        <div
                          style={{
                            color: "#166534",
                            fontWeight: 800,
                            fontSize: "12.5px",
                            marginTop: "3px",
                          }}
                        >
                          ₹{Number(prodPrice).toLocaleString("en-IN")}
                        </div>
                      ) : (
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "11.5px",
                            marginTop: "3px",
                          }}
                        >
                          Price on request
                        </div>
                      )}
                    </td>

                    {/* Farm / Seller Column */}
                    <td>
                      {sellerUrl ? (
                        <a
                          href={sellerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "13px",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                          onMouseOver={(ev) =>
                            (ev.currentTarget.style.textDecoration = "underline")
                          }
                          onMouseOut={(ev) =>
                            (ev.currentTarget.style.textDecoration = "none")
                          }
                        >
                          <span>🏢 {farmName}</span>
                          <span style={{ fontSize: "10px", color: "#64748b" }}>
                            ↗
                          </span>
                        </a>
                      ) : (
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "13px",
                          }}
                        >
                          🏢 {farmName}
                        </div>
                      )}
                      {e.seller_name && e.seller_name !== farmName && (
                        <div style={{ fontSize: "11.5px", color: "#475569" }}>
                          👤 {e.seller_name}
                        </div>
                      )}
                      {e.seller_phone && (
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                          📞 {e.seller_phone}
                        </div>
                      )}
                    </td>

                    {/* Buyer Location */}
                    <td>
                      <span
                        style={{
                          color: "#334155",
                          fontWeight: 600,
                          fontSize: "12.5px",
                        }}
                      >
                        📍{" "}
                        {[e.city, e.state].filter(Boolean).join(", ") ||
                          "Not provided"}
                      </span>
                    </td>

                    {/* Message */}
                    <td>
                      <div
                        style={{
                          color: "#334155",
                          fontSize: "12.5px",
                          lineHeight: "1.45",
                          maxHeight: "65px",
                          overflowY: "auto",
                          background: "#f8fafc",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        {e.message || "Best Price quote requested."}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td>
                      <select
                        className={`admin-status-select ${e.status || "new"}`}
                        value={e.status || "new"}
                        onChange={(x) =>
                          handleStatusChange(itemId, x.target.value)
                        }
                      >
                        <option value="new">● New</option>
                        <option value="contacted">✓ Contacted</option>
                        <option value="closed">✕ Closed</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(itemId)}
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#dc2626",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        title="Delete Enquiry"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={pagination.page}
        lastPage={pagination.lastPage}
        total={pagination.total}
        perPage={pagination.limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
