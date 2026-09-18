import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { useSellerAuth } from "../../context/SellerAuthContext";
import { getImageUrl } from "../../utils/imageUrl";
import StateCitySelect from "../../components/common/StateCitySelect";

export default function SellerDashboard() {
  const { seller, updateSeller } = useSellerAuth();
  const [profile, setProfile] = useState(seller || {});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    business_name: "",
    business_address: "",
    gst_number: "",
    state: "",
    city: "",
    pincode: "",
    banner_image: "",
    avatar: "",
    password: "",
  });

  // Image upload states
  const [businessImageFile, setBusinessImageFile] = useState(null);
  const [businessImagePreview, setBusinessImagePreview] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/sellers/profile");
      if (data.success && data.data) {
        setProfile(data.data);
        updateSeller(data.data);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditModal = () => {
    const currentAv =
      profile?.business_image ||
      profile?.avatar ||
      seller?.business_image ||
      seller?.avatar ||
      "";

    const currentBan = profile?.banner_image || seller?.banner_image || "";

    setForm({
      name: profile?.name || seller?.name,
      phone: profile?.phone || seller?.phone,
      email: profile?.email || seller?.email,
      business_name: profile?.business_name || seller?.business_name,
      business_address: profile?.business_address || seller?.business_address,
      gst_number: profile?.gst_number || seller?.gst_number,
      state: profile?.state || seller?.state,
      city: profile?.city || seller?.city,
      pincode: profile?.pincode || seller?.pincode,
      banner_image: currentBan,
      avatar: currentAv,
      password: "",
    });

    setBusinessImageFile(null);
    setBusinessImagePreview(
      getImageUrl(
        currentAv,
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
      )
    );

    setBannerFile(null);
    setBannerPreview(getImageUrl(currentBan, ""));

    setMsg("");
    setModalOpen(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBusinessImageFile(file);
      setBusinessImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone || "");
      formData.append("email", form.email);
      formData.append("business_name", form.business_name || "");
      formData.append("business_address", form.business_address || "");
      formData.append("gst_number", form.gst_number || "");
      formData.append("state", form.state || "");
      formData.append("city", form.city || "");
      formData.append("pincode", form.pincode || "");
      if (form.password && form.password.trim().length >= 6) {
        formData.append("password", form.password.trim());
      }

      // Profile image (avatar / business image)
      if (businessImageFile) {
        formData.append("avatar", businessImageFile);
        formData.append("business_image", businessImageFile);
      } else if (form.avatar) {
        formData.append("avatar", form.avatar);
        formData.append("business_image", form.avatar);
      }

      // Banner image
      if (bannerFile) {
        formData.append("banner_image", bannerFile);
      } else if (form.banner_image) {
        formData.append("banner_image", form.banner_image);
      }

      const { data } = await api.post("/sellers/profile", formData);
      if (data.success) {
        setProfile(data.user);
        updateSeller(data.user);
        setMsg("✅ Business profile and image updated successfully!");
        setTimeout(() => setModalOpen(false), 1200);
      }
    } catch (err) {
      setMsg(
        "❌ " + (err.response?.data?.message || "Failed to update profile."),
      );
    } finally {
      setSaving(false);
    }
  };

  const currentName = profile?.name || seller?.name;
  const currentPhone = profile?.phone || seller?.phone;
  const currentEmail = profile?.email || seller?.email;
  const currentBusiness = profile?.business_name || seller?.business_name;
  const currentAddress = profile?.business_address || seller?.business_address;
  const currentBanner = profile?.banner_image || seller?.banner_image;

  const rawAvatar =
    profile?.business_image ||
    profile?.avatar ||
    seller?.business_image ||
    seller?.avatar ||
    "";

  const currentAvatar = getImageUrl(
    rawAvatar,
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
  );
  const bannerSrc = getImageUrl(currentBanner, "");

  return (
    <div>
      {/* Top Header */}
      <div className="seller-page-header">
        <h1 className="seller-page-title">Dashboard</h1>
        <button className="seller-btn-edit-profile" onClick={openEditModal}>
          <span>✏️</span>
          <span>Edit Profile & Photo</span>
        </button>
      </div>

      {/* Banner Strip with Business Profile Avatar */}
      <div style={{ position: "relative", marginBottom: "36px" }}>
        <div
          className="seller-dashboard-banner-bar"
          style={{ height: "170px", borderRadius: "6px", overflow: "hidden" }}
        >
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt="Dashboard Banner"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                color: "#adb5bd",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                background: "#e9ecef",
              }}
            >
              No Banner Set
            </div>
          )}
        </div>

        {/* Floating Business Profile Badge */}
        <div
          style={{
            position: "absolute",
            bottom: "-28px",
            left: "24px",
            display: "flex",
            alignItems: "flex-end",
            gap: "16px",
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={currentAvatar}
              alt="Business Profile"
              style={{
                width: "86px",
                height: "86px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #ffffff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                background: "#ffffff",
              }}
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";
              }}
            />
            <button
              type="button"
              onClick={openEditModal}
              title="Change Business Profile Image"
              style={{
                position: "absolute",
                bottom: "2px",
                right: "0",
                background: "#0d6efd",
                color: "#ffffff",
                border: "2px solid #ffffff",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "13px",
                padding: 0,
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              📷
            </button>
          </div>

          <div style={{ paddingBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: "700",
                  color: "#212529",
                }}
              >
                {currentBusiness || currentName || "Dairy Farm Store"}
              </h2>
              <span
                style={{
                  background: "#d1e7dd",
                  color: "#0f5132",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                Verified Seller ✓
              </span>
            </div>
            <div
              style={{ fontSize: "12.5px", color: "#6c757d", marginTop: "2px" }}
            >
              Managed by {currentName || "Owner"}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Link
          to="/seller/products"
          style={{
            background: "#ffffff",
            border: "1px solid var(--seller-border, #e9ecef)",
            borderRadius: "6px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textDecoration: "none",
            color: "inherit",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#6c757d", fontWeight: "600", textTransform: "uppercase" }}>
              Total Cattle / Products
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#198754", marginTop: "4px" }}>
              {profile?.stats?.products ?? 0}
            </div>
          </div>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            🐄
          </div>
        </Link>

        <Link
          to="/seller/banners"
          style={{
            background: "#ffffff",
            border: "1px solid var(--seller-border, #e9ecef)",
            borderRadius: "6px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textDecoration: "none",
            color: "inherit",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#6c757d", fontWeight: "600", textTransform: "uppercase" }}>
              Store Banners
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0d6efd", marginTop: "4px" }}>
              {profile?.stats?.banners ?? 0}
            </div>
          </div>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#e7f1ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            🖼️
          </div>
        </Link>

        <Link
          to="/seller/about"
          style={{
            background: "#ffffff",
            border: "1px solid var(--seller-border, #e9ecef)",
            borderRadius: "6px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textDecoration: "none",
            color: "inherit",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#6c757d", fontWeight: "600", textTransform: "uppercase" }}>
              Company About Sections
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#6f42c1", marginTop: "4px" }}>
              {profile?.stats?.aboutSections ?? 0}
            </div>
          </div>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#f3e8fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            📖
          </div>
        </Link>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--seller-border, #e9ecef)",
            borderRadius: "6px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#6c757d", fontWeight: "600", textTransform: "uppercase" }}>
              Account Status
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f5132", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#198754" }}></span>
              Active & Verified
            </div>
          </div>
          <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#d1e7dd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            🛡️
          </div>
        </div>
      </div>

      {/* 2-Column Info Cards (Matching Screenshot 3) */}
      <div className="seller-dashboard-grid">
        {/* Personal Information */}
        <div className="seller-info-card">
          <h3 className="seller-info-card-title">Personal Information</h3>
          <div className="seller-info-list">
            <div className="seller-info-item">
              <span className="seller-info-icon">👥</span>
              <span className="seller-info-text">{currentName || "—"}</span>
            </div>
            <div className="seller-info-item">
              <span className="seller-info-icon">📞</span>
              <span className="seller-info-text">{currentPhone || "—"}</span>
            </div>
            <div className="seller-info-item">
              <span className="seller-info-icon">💬</span>
              <span className="seller-info-text">{currentEmail || "—"}</span>
            </div>
            <div className="seller-info-item">
              <span className="seller-info-icon">📄</span>
              <span className="seller-info-text">
                Seller ID: #{profile?._id || profile?.id || seller?._id || seller?.id || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="seller-info-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 className="seller-info-card-title" style={{ margin: 0 }}>
              Business Information
            </h3>
            <button
              type="button"
              onClick={openEditModal}
              style={{
                background: "none",
                border: "none",
                color: "#0d6efd",
                fontSize: "12.5px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ✏️ Edit
            </button>
          </div>
          <div className="seller-info-list">
            {/* Business Profile Image row */}
            <div className="seller-info-item">
              <span className="seller-info-icon">🖼️</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <img
                  src={currentAvatar}
                  alt="Business Profile"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #dee2e6",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "13px",
                      color: "#212529",
                    }}
                  >
                    Business Profile Image
                  </div>
                  <button
                    type="button"
                    onClick={openEditModal}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0d6efd",
                      fontSize: "12px",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Change image
                  </button>
                </div>
              </div>
            </div>

            <div className="seller-info-item">
              <span className="seller-info-icon">🧳</span>
              <span className="seller-info-text">{currentBusiness || "—"}</span>
            </div>
            <div className="seller-info-item">
              <span className="seller-info-icon">🏠</span>
              <span className="seller-info-text">{currentAddress || "—"}</span>
            </div>
            <div className="seller-info-item">
              <span className="seller-info-icon">📍</span>
              <span className="seller-info-text">
                {[
                  profile?.city || seller?.city,
                  profile?.state || seller?.state,
                ]
                  .filter(Boolean)
                  .join(", ") || "Location: India"}
                {profile?.pincode || seller?.pincode
                  ? ` — ${profile?.pincode || seller?.pincode}`
                  : ""}
              </span>
            </div>
            <div className="seller-info-item">
              <span className="seller-info-icon">🧾</span>
              <span className="seller-info-text">
                GSTIN:{" "}
                <strong>
                  {profile?.gst_number || seller?.gst_number || "Not Provided"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {modalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-box seller-modal-box-lg">
            <div className="seller-modal-header">
              <h3>Edit Business Profile Details</h3>
              <button
                className="seller-modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="seller-modal-body">
              {msg && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "13px",
                    marginBottom: "14px",
                    background: msg.startsWith("✅") ? "#d1e7dd" : "#f8d7da",
                    color: msg.startsWith("✅") ? "#0f5132" : "#842029",
                  }}
                >
                  {msg}
                </div>
              )}

              {/* Business Profile Image Upload Section */}
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                  marginBottom: "18px",
                }}
              >
                <label
                  className="seller-form-label"
                  style={{ fontWeight: "700", marginBottom: "8px" }}
                >
                  Business Profile Image / Logo
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <img
                    src={
                      businessImagePreview ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
                    }
                    alt="Profile Preview"
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #0d6efd",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                    />
                    <button
                      type="button"
                      className="btn-seller-dark"
                      style={{ fontSize: "12.5px", padding: "6px 14px" }}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      📷 Choose New Business Photo
                    </button>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "#6c757d",
                        marginTop: "4px",
                      }}
                    >
                      {businessImageFile
                        ? businessImageFile.name
                        : "Recommended: square PNG, JPG, or WEBP"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Banner Image Upload Section */}
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                  marginBottom: "18px",
                }}
              >
                <label
                  className="seller-form-label"
                  style={{ fontWeight: "700", marginBottom: "8px" }}
                >
                  Dashboard Banner Image
                </label>
                {bannerPreview && (
                  <div
                    style={{
                      height: "80px",
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginBottom: "8px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <input
                    type="file"
                    ref={bannerInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleBannerFileChange}
                  />
                  <button
                    type="button"
                    className="btn-seller-dark"
                    style={{ fontSize: "12.5px", padding: "6px 14px" }}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    🖼️ Choose Banner File
                  </button>
                  <span style={{ fontSize: "12px", color: "#6c757d" }}>
                    {bannerFile ? bannerFile.name : "Or paste image URL below"}
                  </span>
                </div>
                <input
                  type="url"
                  className="seller-input"
                  style={{ marginTop: "8px" }}
                  placeholder="https://... (Optional banner URL)"
                  value={form.banner_image}
                  onChange={(e) => {
                    setForm({ ...form, banner_image: e.target.value });
                    setBannerPreview(e.target.value);
                  }}
                />
              </div>

              {/* Row 1: Name & Phone */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div className="seller-form-group">
                  <label className="seller-form-label">Full Name</label>
                  <input
                    type="text"
                    className="seller-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">Phone Number</label>
                  <input
                    type="text"
                    className="seller-input"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Row 2: Email & Business Name */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div className="seller-form-group">
                  <label className="seller-form-label">Email Address</label>
                  <input
                    type="email"
                    className="seller-input"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">
                    Business / Farm Name
                  </label>
                  <input
                    type="text"
                    className="seller-input"
                    value={form.business_name}
                    onChange={(e) =>
                      setForm({ ...form, business_name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* GST Number */}
              <div className="seller-form-group">
                <label className="seller-form-label">GST Number</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  value={form.gst_number}
                  onChange={(e) =>
                    setForm({ ...form, gst_number: e.target.value })
                  }
                />
              </div>

              {/* Location: State | City | Pincode */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                }}
              >
                <StateCitySelect
                  selectedState={form.state}
                  selectedCity={form.city}
                  onStateChange={(val) =>
                    setForm((prev) => ({ ...prev, state: val, city: "" }))
                  }
                  onCityChange={(val) =>
                    setForm((prev) => ({ ...prev, city: val }))
                  }
                  stateLabel="State"
                  cityLabel="City"
                  stateClassName="seller-input"
                  cityClassName="seller-input"
                  stateWrapClassName="seller-form-group"
                  cityWrapClassName="seller-form-group"
                  labelClassName="seller-form-label"
                />
                <div className="seller-form-group">
                  <label className="seller-form-label">Pincode</label>
                  <input
                    type="text"
                    className="seller-input"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({ ...form, pincode: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Business Address */}
              <div className="seller-form-group">
                <label className="seller-form-label">Business Address</label>
                <textarea
                  className="seller-input"
                  style={{ height: "65px", paddingTop: "8px" }}
                  value={form.business_address}
                  onChange={(e) =>
                    setForm({ ...form, business_address: e.target.value })
                  }
                />
              </div>

              {/* Password */}
              <div className="seller-form-group">
                <label className="seller-form-label">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  className="seller-input"
                  placeholder="Leave blank to keep unchanged"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  className="btn-seller-dark"
                  style={{ background: "#6c757d" }}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-seller-primary"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
