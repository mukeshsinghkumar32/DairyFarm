import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";
import AdminPagination from "../../components/common/AdminPagination";

export default function SupplierInquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
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

        const res = await api.get("/admin/supplier-inquiries", { params });
        const resData = res.data?.data || {};

        setItems(resData.data || (Array.isArray(resData) ? resData : []));
        setPagination({
          page: resData.current_page || page,
          limit: resData.per_page || 10,
          total: resData.total || 0,
          lastPage: resData.last_page || 1,
        });
      } catch (err) {
        console.error("Supplier inquiries load error:", err);
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
      await api.patch(`/admin/supplier-inquiries/${id}`, { status: newStatus });
      fetchData(pagination.page);
    } catch (err) {
      alert(
        "Failed to update status: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this supplier inquiry?")
    )
      return;
    try {
      await api.delete(`/admin/supplier-inquiries/${id}`);
      fetchData(pagination.page);
    } catch (err) {
      alert(
        "Failed to delete supplier inquiry: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const copyLeadText = (item) => {
    const text =
      `📋 *NEW LEAD FOR DAIRY FARM*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Customer Name:* ${item.name}\n` +
      `📞 *Mobile:* ${item.phone}\n` +
      (item.email ? `✉️ *Email:* ${item.email}\n` : "") +
      `📍 *Location:* ${[item.city, item.state].filter(Boolean).join(", ") || "India"}\n` +
      (item.product_name ? `🐄 *Interested Cattle:* ${item.product_name}\n` : "") +
      `💬 *Requirement:* ${item.message}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏢 *Target Supplier:* ${item.supplier_name || "Sohani Dairy Farm Partner"}\n` +
      `Shared via Sohani Dairy Admin Portal`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id || item._id);
    setTimeout(() => setCopiedId(null), 3000);
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
          <h2>🏢 Supplier Inquiries ({pagination.total})</h2>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Inquiries received on verified Supplier / Dairy Farm partner profile pages
          </small>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Search by buyer, farm, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              minWidth: "240px",
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
              <th>Buyer / Customer</th>
              <th>Buyer Location</th>
              <th>Target Supplier / Farm</th>
              <th style={{ width: "25%" }}>Message / Requirement</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Share & Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
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
                  <small style={{ color: "#64748b" }}>Loading supplier inquiries...</small>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty-cell">
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>🏢</div>
                  <div>No supplier inquiries found</div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const targetSupplier = item.supplier_id || {};
                const supplierId =
                  targetSupplier._id ||
                  targetSupplier.id ||
                  (typeof item.supplier_id === "string" ? item.supplier_id : null);

                const supplierName =
                  item.supplier_name ||
                  targetSupplier.business_name ||
                  targetSupplier.name ||
                  "Dairy Farm Supplier";

                const supplierPhone =
                  item.supplier_phone || targetSupplier.phone || "";

                const supplierUrl = supplierId
                  ? `/supplier/${supplierId}`
                  : item.page_url || "/";

                const dateStr = item.createdAt || item.created_at;
                const itemId = item.id || item._id;

                const shareText = encodeURIComponent(
                  `Hello ${supplierName},\nYou have received a new customer lead on Sohani Dairy!\n\n` +
                  `👤 *Customer:* ${item.name}\n` +
                  `📞 *Phone:* ${item.phone}\n` +
                  (item.email ? `✉️ *Email:* ${item.email}\n` : "") +
                  `📍 *Location:* ${[item.city, item.state].filter(Boolean).join(", ") || "India"}\n` +
                  (item.product_name ? `🐄 *Product:* ${item.product_name}\n` : "") +
                  `💬 *Requirement:* ${item.message}\n\n` +
                  `Please follow up with the buyer directly.`
                );

                const supplierCleanPhone = supplierPhone.replace(/[^0-9]/g, "");
                const waShareUrl = supplierCleanPhone
                  ? `https://wa.me/91${supplierCleanPhone}?text=${shareText}`
                  : `https://wa.me/?text=${shareText}`;

                return (
                  <tr key={itemId}>
                    {/* Buyer / Customer Column */}
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
                            {item.name}
                          </b>
                          <a
                            href={`tel:${item.phone}`}
                            style={{
                              color: "#0284c7",
                              fontSize: "12px",
                              fontWeight: 600,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            📞 {item.phone}
                          </a>
                          <div style={{ marginTop: "2px" }}>
                            <a
                              href={`https://wa.me/91${item.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: "11px",
                                color: "#25d366",
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              💬 Chat on WhatsApp
                            </a>
                          </div>
                          {item.email && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                marginTop: "2px",
                              }}
                            >
                              ✉️ {item.email}
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
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
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
                        {[item.city, item.state].filter(Boolean).join(", ") ||
                          "Not provided"}
                      </span>
                    </td>

                    {/* Target Supplier / Farm Column */}
                    <td>
                      <a
                        href={supplierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: "13.5px",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          cursor: "pointer",
                        }}
                        title="Open Supplier Profile in new tab"
                        onMouseOver={(ev) => (ev.currentTarget.style.textDecoration = "underline")}
                        onMouseOut={(ev) => (ev.currentTarget.style.textDecoration = "none")}
                      >
                        <span>🏢 {supplierName}</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>↗</span>
                      </a>

                      {supplierPhone && (
                        <div style={{ marginTop: "4px" }}>
                          <a
                            href={`tel:${supplierPhone}`}
                            style={{
                              fontSize: "12px",
                              color: "#475569",
                              textDecoration: "none",
                              fontWeight: 600,
                            }}
                          >
                            📞 {supplierPhone}
                          </a>
                        </div>
                      )}

                      {item.supplier_location && (
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "#64748b",
                            marginTop: "2px",
                          }}
                        >
                          📍 {item.supplier_location}
                        </div>
                      )}
                    </td>

                    {/* Requirement Message */}
                    <td>
                      {item.product_name && (
                        <div
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 700,
                            color: "#0369a1",
                            marginBottom: "4px",
                          }}
                        >
                          🐄 {item.product_name}
                        </div>
                      )}
                      <div
                        style={{
                          color: "#334155",
                          fontSize: "12.5px",
                          lineHeight: "1.45",
                          maxHeight: "70px",
                          overflowY: "auto",
                          background: "#f8fafc",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {item.message}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td>
                      <select
                        className={`admin-status-select ${item.status || "new"}`}
                        value={item.status || "new"}
                        onChange={(x) =>
                          handleStatusChange(itemId, x.target.value)
                        }
                      >
                        <option value="new">● New</option>
                        <option value="contacted">✓ Contacted</option>
                        <option value="closed">✕ Closed</option>
                      </select>
                    </td>

                    {/* Share & Actions Column */}
                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Share to Supplier via WhatsApp */}
                        <a
                          href={waShareUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: "#25d366",
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title="Share this inquiry with the supplier on WhatsApp"
                        >
                          <span>💬</span>
                          <span>Share to Supplier</span>
                        </a>

                        {/* Copy Lead Text */}
                        <button
                          type="button"
                          onClick={() => copyLeadText(item)}
                          style={{
                            background: copiedId === itemId ? "#dcfce7" : "#f1f5f9",
                            border: `1px solid ${copiedId === itemId ? "#86efac" : "#cbd5e1"}`,
                            color: copiedId === itemId ? "#15803d" : "#334155",
                            padding: "5px 9px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          title="Copy full lead details to clipboard"
                        >
                          {copiedId === itemId ? "✓ Copied!" : "📋 Copy"}
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(itemId)}
                          style={{
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#dc2626",
                            padding: "5px 8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                          title="Delete Inquiry"
                        >
                          🗑️
                        </button>
                      </div>
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
