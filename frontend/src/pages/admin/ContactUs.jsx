import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";
import AdminPagination from "../../components/common/AdminPagination";

export default function ContactUs() {
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

        const res = await api.get("/admin/contacts", { params });
        const resData = res.data?.data || {};

        setItems(resData.data || (Array.isArray(resData) ? resData : []));
        setPagination({
          page: resData.current_page || page,
          limit: resData.per_page || 10,
          total: resData.total || 0,
          lastPage: resData.last_page || 1,
        });
      } catch (err) {
        console.error("Contacts load error:", err);
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
      await api.patch(`/admin/contacts/${id}`, { status: newStatus });
      fetchData(pagination.page);
    } catch (err) {
      alert(
        "Failed to update status: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact enquiry?"))
      return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      fetchData(pagination.page);
    } catch (err) {
      alert(
        "Failed to delete contact: " +
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
          <h2>📞 Contact Us Enquiries ({pagination.total})</h2>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Messages received from the website Contact Us page
          </small>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Search by name, phone, city, breed..."
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
            <option value="new">● New</option>
            <option value="contacted">✓ Contacted</option>
            <option value="closed">✕ Closed</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Location (State / City)</th>
              <th>Preferred Breed</th>
              <th style={{ width: "30%" }}>Message / Requirement</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
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
                  <small style={{ color: "#64748b" }}>Loading contact enquiries...</small>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-empty-cell">
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>✉️</div>
                  <div>No contact enquiries found</div>
                </td>
              </tr>
            ) : (
              items.map((c) => {
                const dateStr = c.createdAt || c.created_at;
                const locStr = [c.city, c.state].filter(Boolean).join(", ");
                const itemId = c.id || c._id;

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
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#fef3c7",
                            color: "#b45309",
                            fontWeight: 700,
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #fde68a",
                            flexShrink: 0,
                          }}
                        >
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <b
                            style={{
                              color: "#0f172a",
                              fontSize: "14px",
                              display: "block",
                            }}
                          >
                            {c.name}
                          </b>
                          {dateStr && (
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                              📅{" "}
                              {new Date(dateStr).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <a
                        href={`tel:${c.phone}`}
                        style={{
                          color: "#166534",
                          fontWeight: 700,
                          fontSize: "13.5px",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        📞 {c.phone}
                      </a>
                      <div style={{ marginTop: "3px" }}>
                        <a
                          href={`https://wa.me/91${c.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "11px",
                            color: "#25d366",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    </td>

                    <td>
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          style={{
                            color: "#475569",
                            fontSize: "12px",
                            textDecoration: "none",
                          }}
                        >
                          ✉️ {c.email}
                        </a>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                          —
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        style={{
                          color: "#334155",
                          fontWeight: 600,
                          fontSize: "12.5px",
                        }}
                      >
                        📍 {locStr || "—"}
                      </span>
                    </td>

                    <td>
                      {c.breed ? (
                        <span
                          style={{
                            background: "#f1f5f9",
                            color: "#334155",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          🐄 {c.breed}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                          —
                        </span>
                      )}
                    </td>

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
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {c.message}
                      </div>
                    </td>

                    <td>
                      <select
                        className={`admin-status-select ${c.status || "new"}`}
                        value={c.status || "new"}
                        onChange={(x) =>
                          handleStatusChange(itemId, x.target.value)
                        }
                      >
                        <option value="new">● New</option>
                        <option value="contacted">✓ Contacted</option>
                        <option value="closed">✕ Closed</option>
                      </select>
                    </td>

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
                        title="Delete Contact"
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
