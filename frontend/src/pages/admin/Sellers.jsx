import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { getImageUrl } from "../../utils/imageUrl";
import { useLocations } from "../../hooks/useLocations";
import AdminPagination from "../../components/common/AdminPagination";
import SellerProductModal from "./SellerProductModal";
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";

const INDIAN_STATES = [
  "Uttar Pradesh",
  "Punjab",
  "Haryana",
  "Rajasthan",
  "Gujarat",
  "Madhya Pradesh",
  "Maharashtra",
  "Bihar",
  "West Bengal",
  "Karnataka",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "Kerala",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Delhi",
  "Jammu & Kashmir",
  "Other",
];

const emptySeller = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  business_name: "",
  gst_number: "",
  state: "Uttar Pradesh",
  city: "",
  pincode: "",
  business_address: "",
  status: "active",
  featured: false,
};

function sellerAvatar(avatar) {
  return getImageUrl(avatar, DEFAULT_AVATAR);
}

const Sellers = forwardRef(function Sellers({}, ref) {
  const [localSellers, setLocalSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = modal closed, object = open
  const [selectedSellerForProducts, setSelectedSellerForProducts] =
    useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { states: dynamicStates, getCitiesForState } = useLocations();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });

  const filterCities =
    filterState && filterState !== "all" ? getCitiesForState(filterState) : [];

  const fetchSellers = useCallback(
    async (
      page = 1,
      search = searchQuery,
      status = filterStatus,
      state = filterState,
      city = filterCity,
    ) => {
      try {
        setLoading(true);
        const params = { page, limit: 10 };
        if (search && search.trim()) params.search = search.trim();
        if (status && status !== "all") params.status = status;
        if (state && state !== "all") params.state = state;
        if (city && city !== "all") params.city = city;

        const res = await api.get("/admin/sellers", { params });
        const resData = res.data?.data || {};

        setLocalSellers(
          resData.data || (Array.isArray(resData) ? resData : []),
        );
        setPagination({
          page: resData.current_page || page,
          limit: resData.per_page || 10,
          total: resData.total || 0,
          lastPage: resData.last_page || 1,
        });
      } catch (err) {
        console.error("Sellers load error:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filterStatus, filterState, filterCity],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSellers(1, searchQuery, filterStatus, filterState, filterCity);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus, filterState, filterCity, fetchSellers]);

  // Expose openAdd() for external triggers
  useImperativeHandle(ref, () => ({
    openAdd: () => openAddModal(),
  }));

  const openAddModal = () => {
    setErrorMsg("");
    setAvatarPreview(null);
    setForm({ ...emptySeller });
  };

  const openEditModal = (seller) => {
    setErrorMsg("");
    setAvatarPreview(sellerAvatar(seller.avatar));
    setForm({
      id: seller.id || seller._id,
      name: seller.name || "",
      username: seller.username || "",
      email: seller.email || "",
      phone: seller.phone || "",
      password: "", // blank unless admin wants to change it
      business_name: seller.business_name || "",
      gst_number: seller.gst_number || "",
      state: seller.state || "",
      city: seller.city || "",
      pincode: seller.pincode || "",
      business_address: seller.business_address || "",
      status: seller.status || "active",
      featured: Boolean(seller.featured),
      avatar: seller.avatar || "",
    });
  };

  const toggleFeatured = async (seller) => {
    const sId = seller.id || seller._id;
    const nextVal = !seller.featured;

    // Optimistically toggle in local state immediately
    setLocalSellers((prev) =>
      prev.map((s) =>
        (s.id || s._id) === sId ? { ...s, featured: nextVal } : s,
      ),
    );

    try {
      await api.put(`/admin/sellers/${sId}`, { featured: nextVal });
    } catch (err) {
      // Revert if request fails
      setLocalSellers((prev) =>
        prev.map((s) =>
          (s.id || s._id) === sId ? { ...s, featured: !nextVal } : s,
        ),
      );
      alert(
        "Error toggling featured status: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, avatarFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSeller = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const fd = new FormData();
      if (form.avatarFile instanceof File) {
        fd.append("avatar", form.avatarFile);
      }

      Object.entries(form).forEach(([k, v]) => {
        if (k === "avatarFile") return;
        // Don't send empty password on edit
        if (k === "password" && form.id && !v) return;
        if (k === "featured") {
          fd.append("featured", v ? "true" : "false");
          return;
        }
        if (v !== undefined && v !== null) {
          fd.append(k, v);
        }
      });

      if (form.id) {
        fd.append("_method", "PUT");
        await api.post(`/admin/sellers/${form.id}`, fd);
      } else {
        await api.post("/admin/sellers", fd);
      }

      setForm(null);
      setAvatarPreview(null);
      fetchSellers(pagination.page);
    } catch (err) {
      console.error("Save seller error:", err);
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to save seller.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeSeller = async (seller) => {
    const sellerId = seller.id || seller._id;
    const confirmText = `Are you sure you want to delete seller "${seller.name}" (@${seller.username})?\n\nThis will permanently remove their profile.`;
    if (window.confirm(confirmText)) {
      try {
        await api.delete(`/admin/sellers/${sellerId}`);
        fetchSellers(pagination.page);
      } catch (err) {
        alert(
          "Error deleting seller: " +
            (err.response?.data?.message || err.message),
        );
      }
    }
  };

  const handlePageChange = (newPage) => {
    fetchSellers(newPage, searchQuery, filterStatus);
  };

  return (
    <>
      <div className="admin-card">
        {/* Card Header: Title & Actions */}
        <div
          className="admin-card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Registered Sellers ({pagination.total})
            </h2>
            <small style={{ color: "#64748b", fontSize: "12px" }}>
              Manage seller accounts, dairy farm profiles, and verification
            </small>
          </div>

          <button
            type="button"
            className="admin-action-btn-primary"
            onClick={openAddModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              fontWeight: 700,
            }}
          >
            <span>＋</span>
            <span>Add Seller</span>
          </button>
        </div>

        {/* Filter Toolbar: All filters in ONE clean horizontal line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 24px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            flexWrap: "nowrap",
            overflowX: "auto",
          }}
        >
          {/* Search Input */}
          <div style={{ flex: "1 1 280px", minWidth: "220px" }}>
            <input
              type="text"
              placeholder="🔍 Search name, username, email, GST, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "13px",
                outline: "none",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
              background: "#ffffff",
              cursor: "pointer",
              minWidth: "130px",
              flexShrink: 0,
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="featured">⭐ Featured Only</option>
          </select>

          {/* State Filter */}
          <select
            value={filterState}
            onChange={(e) => {
              setFilterState(e.target.value);
              setFilterCity("all");
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
              background: "#ffffff",
              cursor: "pointer",
              minWidth: "140px",
              flexShrink: 0,
            }}
          >
            <option value="all">All States</option>
            {dynamicStates.map((st) => (
              <option key={st.state} value={st.state}>
                {st.state}
              </option>
            ))}
          </select>

          {/* City Filter */}
          <select
            value={filterCity}
            disabled={filterState === "all" || filterCities.length === 0}
            onChange={(e) => setFilterCity(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
              background: filterState === "all" ? "#f1f5f9" : "#ffffff",
              cursor: filterState === "all" ? "not-allowed" : "pointer",
              color: filterState === "all" ? "#94a3b8" : "#0f172a",
              minWidth: "140px",
              flexShrink: 0,
            }}
          >
            <option value="all">
              {filterState === "all"
                ? "All Cities"
                : filterCities.length === 0
                  ? "All Cities"
                  : "All Cities"}
            </option>
            {filterCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Reset Filters button */}
          {(searchQuery ||
            filterStatus !== "all" ||
            filterState !== "all" ||
            filterCity !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterState("all");
                setFilterCity("all");
              }}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                background: "#ffffff",
                color: "#dc2626",
                cursor: "pointer",
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Reset all filters"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Sellers Table */}
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Avatar</th>
                <th>Seller Details</th>
                <th>Business / Farm</th>
                <th>Contact Info</th>
                <th>Location & GST</th>
                <th>Listings</th>
                <th>Status</th>
                <th style={{ textAlign: "center", width: "110px" }}>
                  Featured
                </th>
                <th style={{ textAlign: "right", minWidth: "120px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {localSellers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="admin-empty-cell"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                      👥
                    </div>
                    <div style={{ fontWeight: 600, color: "#64748b" }}>
                      No sellers found
                    </div>
                    <small style={{ color: "#94a3b8" }}>
                      {searchQuery || filterStatus !== "all"
                        ? "Try adjusting your search or filters."
                        : "Click 'Add Seller' to register a new dairy farm seller."}
                    </small>
                  </td>
                </tr>
              ) : (
                localSellers.map((seller) => {
                  const sId = seller.id || seller._id;
                  const profileUrl = `/supplier/${slugify(seller.business_name)}`;
                  return (
                    <tr key={sId}>
                      {/* Avatar */}
                      <td>
                        <Link
                          to={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View ${seller.name} profile`}
                        >
                          <img
                            src={sellerAvatar(seller.avatar)}
                            alt={seller.name}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #e2e8f0",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              cursor: "pointer",
                              transition: "transform 0.15s ease",
                            }}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_AVATAR;
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

                      {/* Seller Details */}
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <Link
                            to={profileUrl}
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
                            title={`Open ${seller.name} Profile`}
                          >
                            <span>{seller.name}</span>
                            <span
                              style={{ fontSize: "11px", color: "#94a3b8" }}
                            >
                              ↗
                            </span>
                          </Link>
                          <Link
                            to={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#ff7600",
                              fontSize: "12px",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                            title={`Open @${seller.username || "seller"}`}
                          >
                            @{seller.username || "seller"}
                          </Link>
                          <small
                            style={{
                              color: "#94a3b8",
                              fontSize: "11px",
                              marginTop: "2px",
                            }}
                          >
                            Joined{" "}
                            {new Date(
                              seller.createdAt || Date.now(),
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </small>
                        </div>
                      </td>

                      {/* Business */}
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#1e293b",
                              fontSize: "13px",
                            }}
                          >
                            {seller.business_name || "Dairy Farm"}
                          </span>
                          {seller.business_address && (
                            <small
                              style={{
                                color: "#64748b",
                                fontSize: "11px",
                                maxWidth: "200px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {seller.business_address}
                            </small>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                          }}
                        >
                          <a
                            href={`mailto:${seller.email}`}
                            style={{
                              color: "#2563eb",
                              fontSize: "12px",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>✉️</span> {seller.email}
                          </a>
                          {seller.phone ? (
                            <a
                              href={`tel:${seller.phone}`}
                              style={{
                                color: "#0f172a",
                                fontSize: "12px",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span>📞</span> {seller.phone}
                            </a>
                          ) : (
                            <small
                              style={{ color: "#94a3b8", fontSize: "11px" }}
                            >
                              No phone added
                            </small>
                          )}
                        </div>
                      </td>

                      {/* Location & GST */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#334155" }}>
                            📍{" "}
                            {[seller.city, seller.state]
                              .filter(Boolean)
                              .join(", ") || "India"}
                            {seller.pincode ? ` - ${seller.pincode}` : ""}
                          </span>
                          {seller.gst_number ? (
                            <span
                              style={{
                                display: "inline-block",
                                background: "#f1f5f9",
                                color: "#475569",
                                fontSize: "11px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontFamily: "monospace",
                                fontWeight: 600,
                                width: "fit-content",
                                marginTop: "2px",
                              }}
                            >
                              GST: {seller.gst_number}
                            </span>
                          ) : (
                            <small
                              style={{ color: "#cbd5e1", fontSize: "11px" }}
                            >
                              No GST
                            </small>
                          )}
                        </div>
                      </td>

                      {/* Products Count */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            alignItems: "flex-start",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedSellerForProducts(seller)}
                            title="Click to view and manage products for this seller"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 10px",
                              background: "#fff7ed",
                              color: "#c2410c",
                              border: "1px solid #ffedd5",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.04)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          >
                            🐄 {seller.product_count ?? 0} listings
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSellerForProducts(seller)}
                            style={{
                              fontSize: "11px",
                              color: "#0284c7",
                              background: "none",
                              border: "none",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px",
                            }}
                            title="Add Product for this Seller"
                          >
                            ➕ Add Product
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            background:
                              seller.status === "active"
                                ? "#dcfce7"
                                : seller.status === "pending"
                                  ? "#fef3c7"
                                  : "#f1f5f9",
                            color:
                              seller.status === "active"
                                ? "#15803d"
                                : seller.status === "pending"
                                  ? "#b45309"
                                  : "#64748b",
                          }}
                        >
                          {seller.status || "active"}
                        </span>
                      </td>

                      {/* Featured Column */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => toggleFeatured(seller)}
                          title={
                            seller.featured
                              ? "⭐ Featured on homepage (Click to unfeature)"
                              : "Standard seller (Click to feature)"
                          }
                          style={{
                            background: seller.featured ? "#fef3c7" : "#f8fafc",
                            color: seller.featured ? "#b45309" : "#64748b",
                            border: seller.featured
                              ? "1.5px solid #f59e0b"
                              : "1px solid #cbd5e1",
                            borderRadius: "20px",
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: seller.featured
                              ? "0 2px 6px rgba(245, 158, 11, 0.2)"
                              : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span>
                            {seller.featured ? "⭐ Featured" : "☆ Standard"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div
                          className="admin-table-actions"
                          style={{
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="admin-btn-icon-edit"
                            onClick={() => openEditModal(seller)}
                            title="Edit Seller Profile"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon-del"
                            onClick={() => removeSeller(seller)}
                            title="Delete Seller"
                          >
                            🗑️ Delete
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

        {/* Pagination Controls (10 per page) */}
        <AdminPagination
          currentPage={pagination.page}
          lastPage={pagination.lastPage}
          total={pagination.total}
          perPage={pagination.limit}
          onPageChange={(p) =>
            fetchSellers(p, searchQuery, filterStatus, filterState, filterCity)
          }
        />
      </div>

      {/* ─── ADD / EDIT SELLER MODAL ────────────────────────────────────── */}
      {form && (
        <div
          className="admin-modal-overlay"
          onClick={() => !saving && setForm(null)}
        >
          <div
            className="admin-modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "780px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div className="admin-modal-header" style={{ flexShrink: 0 }}>
              <div>
                <h2>
                  {form.id
                    ? `Edit Seller: ${form.name}`
                    : "Add New Seller Account"}
                </h2>
                <small style={{ color: "#64748b" }}>
                  {form.id
                    ? "Update seller profile details, credentials, and business status"
                    : "Create a verified seller account with complete dairy business profile"}
                </small>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setForm(null)}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={saveSeller}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                margin: 0,
              }}
            >
              <div
                className="admin-modal-body"
                style={{
                  overflowY: "auto",
                  flex: 1,
                  minHeight: 0,
                  padding: "24px 28px",
                }}
              >
                {errorMsg && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Avatar / Profile Image Upload */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "14px 18px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "20px",
                  }}
                >
                  <img
                    src={avatarPreview || DEFAULT_AVATAR}
                    alt="Seller Preview"
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #ff7600",
                    }}
                  />
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1e293b",
                        marginBottom: "4px",
                      }}
                    >
                      Profile Photo / Business Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ fontSize: "12px", color: "#64748b" }}
                    />
                    <small
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        marginTop: "4px",
                        fontSize: "11px",
                      }}
                    >
                      JPG, PNG, WEBP up to 5MB
                    </small>
                  </div>
                </div>

                <div className="admin-form-grid">
                  {/* Full Name */}
                  <div className="admin-form-field">
                    <label>Full Name *</label>
                    <input
                      value={form.name}
                      placeholder="e.g. Ramesh Kumar Yadav"
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="admin-form-field">
                    <label>Username *</label>
                    <input
                      value={form.username}
                      placeholder="e.g. ramesh_dairy"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          username: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_-]/g, ""),
                        })
                      }
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="admin-form-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      placeholder="e.g. ramesh@gmail.com"
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="admin-form-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      placeholder="e.g. 9876543210"
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>

                  {/* Password */}
                  <div className="admin-form-field">
                    <label>
                      Password{" "}
                      {form.id ? "(Leave blank to keep unchanged)" : "*"}
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      placeholder={form.id ? "••••••••" : "Min 6 characters"}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required={!form.id}
                      minLength={form.id ? undefined : 6}
                    />
                  </div>

                  {/* Status */}
                  <div className="admin-form-field">
                    <label>Account Status *</label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="active">Active (Full Access)</option>
                      <option value="pending">Pending Approval</option>
                      <option value="inactive">Inactive / Suspended</option>
                    </select>
                  </div>

                  {/* Featured Status */}
                  <div className="admin-form-field">
                    <label>Featured Seller ⭐</label>
                    <select
                      value={form.featured ? "1" : "0"}
                      onChange={(e) =>
                        setForm({ ...form, featured: e.target.value === "1" })
                      }
                    >
                      <option value="0">No (Standard Directory Listing)</option>
                      <option value="1">
                        ⭐ Yes (Featured on Homepage / Top)
                      </option>
                    </select>
                  </div>

                  {/* Business / Farm Name */}
                  <div className="admin-form-field">
                    <label>Dairy Farm / Business Name</label>
                    <input
                      value={form.business_name}
                      placeholder="e.g. Yadav Dairy Farm"
                      onChange={(e) =>
                        setForm({ ...form, business_name: e.target.value })
                      }
                    />
                  </div>

                  {/* GST Number */}
                  <div className="admin-form-field">
                    <label>GST Number (GSTIN)</label>
                    <input
                      value={form.gst_number}
                      placeholder="e.g. 09ABCDE1234F1Z5"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gst_number: e.target.value.toUpperCase(),
                        })
                      }
                      maxLength={15}
                    />
                  </div>

                  {/* State */}
                  <div className="admin-form-field">
                    <label>State</label>
                    <select
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value, city: "" })
                      }
                    >
                      <option value="">Select State</option>
                      {(dynamicStates && dynamicStates.length > 0
                        ? dynamicStates
                        : INDIAN_STATES.map((s) => ({ state: s }))
                      ).map((st) => (
                        <option key={st.state} value={st.state}>
                          {st.state} {st.state_key ? `(${st.state_key})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div className="admin-form-field">
                    <label>City / District</label>
                    {form.state && getCitiesForState(form.state).length > 0 ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <select
                          value={form.city}
                          onChange={(e) =>
                            setForm({ ...form, city: e.target.value })
                          }
                          style={{ flex: 1 }}
                        >
                          <option value="">Select City in {form.state}</option>
                          {getCitiesForState(form.state).map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </select>
                        <input
                          placeholder="Or type other"
                          value={
                            getCitiesForState(form.state).includes(form.city)
                              ? ""
                              : form.city
                          }
                          onChange={(e) =>
                            setForm({ ...form, city: e.target.value })
                          }
                          style={{ width: "130px" }}
                          title="If city is not in list, type here"
                        />
                      </div>
                    ) : (
                      <input
                        value={form.city}
                        placeholder={
                          form.state
                            ? `Enter city in ${form.state}`
                            : "First select State"
                        }
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                      />
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="admin-form-field">
                    <label>Pincode / Zip Code</label>
                    <input
                      value={form.pincode}
                      placeholder="e.g. 221001"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pincode: e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 6),
                        })
                      }
                      maxLength={6}
                    />
                  </div>

                  {/* Full Business Address */}
                  <div
                    className="admin-form-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label>Full Dairy Address</label>
                    <textarea
                      rows={2}
                      value={form.business_address}
                      placeholder="e.g. Village & Post Sohani, Block Shahganj, Jaunpur..."
                      onChange={(e) =>
                        setForm({ ...form, business_address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div
                className="admin-modal-footer"
                style={{
                  flexShrink: 0,
                  position: "sticky",
                  bottom: 0,
                  zIndex: 10,
                  background: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setForm(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {saving && <span className="admin-spinner-small" />}
                  <span>
                    {form.id ? "Update Seller" : "Create Seller Profile"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Products Modal (Add / Edit / Delete Products for this Seller) */}
      {selectedSellerForProducts && (
        <SellerProductModal
          seller={selectedSellerForProducts}
          onClose={() => setSelectedSellerForProducts(null)}
          onProductCountUpdated={(sId, newCount) => {
            setLocalSellers((prev) =>
              prev.map((s) =>
                (s.id || s._id) === sId ? { ...s, product_count: newCount } : s,
              ),
            );
          }}
        />
      )}
    </>
  );
});

export default Sellers;
