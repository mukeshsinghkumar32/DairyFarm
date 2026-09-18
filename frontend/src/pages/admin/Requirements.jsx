import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";
import AdminPagination from "../../components/common/AdminPagination";

export default function Requirements() {
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

        const res = await api.get("/admin/requirements", { params });
        const resData = res.data?.data || {};

        setItems(resData.data || (Array.isArray(resData) ? resData : []));
        setPagination({
          page: resData.current_page || page,
          limit: resData.per_page || 10,
          total: resData.total || 0,
          lastPage: resData.last_page || 1,
        });
      } catch (err) {
        console.error("Requirements load error:", err);
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
      await api.patch(`/admin/requirements/${id}`, { status: newStatus });
      fetchData(pagination.page);
    } catch (err) {
      alert(
        "Failed to update status: " +
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
          <h2>📋 Dairy Requirements ({pagination.total})</h2>
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Leads captured from the auto-popup modal "Tell us about your requirement for Dairy"
          </small>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Search by name, phone, requirement..."
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
              <th>Lead Name</th>
              <th>Mobile Number</th>
              <th>Email</th>
              <th style={{ width: "35%" }}>Requirement Details</th>
              <th>Submitted Date</th>
              <th style={{ textAlign: "right" }}>Follow-up Status</th>
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
                  <small style={{ color: "#64748b" }}>Loading requirements...</small>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty-cell">
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>📋</div>
                  <div>No requirements found</div>
                </td>
              </tr>
            ) : (
              items.map((r) => {
                const dateStr = r.createdAt || r.created_at;
                const itemId = r.id || r._id;
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
                            background: "#f0fdf4",
                            color: "#166534",
                            fontWeight: 700,
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #bbf7d0",
                            flexShrink: 0,
                          }}
                        >
                          {r.name ? r.name.charAt(0).toUpperCase() : "R"}
                        </div>
                        <div>
                          <b
                            style={{
                              color: "#0f172a",
                              fontSize: "14px",
                              display: "block",
                            }}
                          >
                            {r.name}
                          </b>
                          {r.page_url && (
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                              🔗 From:{" "}
                              {r.page_url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <a
                        href={`tel:${r.phone}`}
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
                        📞 {r.phone}
                      </a>
                      <div style={{ marginTop: "4px" }}>
                        <a
                          href={`https://wa.me/91${r.phone.replace(/[^0-9]/g, "")}`}
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
                    </td>

                    <td>
                      {r.email ? (
                        <a
                          href={`mailto:${r.email}`}
                          style={{
                            color: "#475569",
                            fontSize: "12.5px",
                            textDecoration: "none",
                          }}
                        >
                          ✉️ {r.email}
                        </a>
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
                          fontSize: "13px",
                          lineHeight: "1.5",
                          maxHeight: "70px",
                          overflowY: "auto",
                          background: "#f8fafc",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {r.requirement}
                      </div>
                    </td>

                    <td>
                      {dateStr ? (
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {new Date(dateStr).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                          —
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <select
                        className={`admin-status-select ${r.status || "new"}`}
                        value={r.status || "new"}
                        onChange={(x) =>
                          handleStatusChange(itemId, x.target.value)
                        }
                      >
                        <option value="new">● New</option>
                        <option value="contacted">✓ Contacted</option>
                        <option value="closed">✕ Closed</option>
                      </select>
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
