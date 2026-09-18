import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { getImageUrl } from "../../utils/imageUrl";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";

const initialForm = {
  id: null,
  name: "",
  slug: "",
  price: "",
  weight: "",
  gender: "Non Selection",
  breed: "",
  delivery_time: "",
  stock_quantity: "1",
  color: "Non Selection",
  milk_capacity_min: "",
  milk_capacity_max: "",
  age: "",
  lactation: "",
  category_id: "",
  short_description: "",
  description: "",
  featured_image: null,
  previewImage: "",
};

export default function SellerProductModal({
  seller,
  onClose,
  onProductCountUpdated,
}) {
  const [view, setView] = useState("list"); // "list" | "form"
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const [formData, setFormData] = useState({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef(null);

  const sellerId = seller?.id || seller?._id;
  const sellerDisplayName =
    seller?.business_name || seller?.name || "Seller";

  // Load Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/categories");
        const list = res.data?.data || [];
        setCategories(list);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Load Seller's Products
  const loadSellerProducts = async () => {
    if (!sellerId) return;
    try {
      setLoading(true);
      const res = await api.get("/admin/products", {
        params: { seller_id: sellerId, limit: 100 },
      });
      const items = res.data?.data?.data || (Array.isArray(res.data?.data) ? res.data.data : []);
      setProducts(items);
      if (onProductCountUpdated) {
        onProductCountUpdated(sellerId, items.length);
      }
    } catch (err) {
      console.error("Failed to fetch seller products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerProducts();
  }, [sellerId]);

  // Handle Slug generation on title change
  const handleTitleChange = (val) => {
    setFormData((prev) => {
      const updates = { ...prev, name: val };
      if (!prev.id) {
        // Auto-generate slug if creating new
        updates.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updates;
    });
  };

  // Open Add Form
  const handleOpenAdd = () => {
    setMsg("");
    setFormData({
      ...initialForm,
      category_id: categories.length > 0 ? (categories[0].id || categories[0]._id) : "",
    });
    setView("form");
  };

  // Open Edit Form
  const handleOpenEdit = (p) => {
    setMsg("");
    setFormData({
      id: p.id || p._id,
      name: p.name || "",
      slug: p.slug || "",
      price: p.price ?? "",
      weight: p.weight || "",
      gender: p.gender || "Non Selection",
      breed: p.breed || "",
      delivery_time: p.delivery_time || "",
      stock_quantity: p.stock_quantity ?? p.quantity ?? "1",
      color: p.color || "Non Selection",
      milk_capacity_min: p.milk_capacity_min ?? "",
      milk_capacity_max: p.milk_capacity_max ?? "",
      age: p.age ?? "",
      lactation: p.lactation || "",
      category_id: p.category_id?._id || p.category_id || (categories[0]?.id || categories[0]?._id || ""),
      short_description: p.short_description || "",
      description: p.description || "",
      featured_image: null,
      previewImage: p.featured_image ? getImageUrl(p.featured_image) : "",
    });
    setView("form");
  };

  // Delete product
  const handleDeleteProduct = async (p) => {
    const pId = p.id || p._id;
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    try {
      await api.delete(`/admin/products/${pId}`);
      await loadSellerProducts();
    } catch (err) {
      alert("Error deleting product: " + (err.response?.data?.message || err.message));
    }
  };

  // File Picker
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        featured_image: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  // Form Submit (Add or Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMsg("❌ Product title is required.");
      return;
    }
    if (!formData.category_id) {
      setMsg("❌ Please assign a main category.");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("slug", formData.slug.trim() || formData.name.trim());
      fd.append("seller_id", sellerId);
      fd.append("category_id", formData.category_id);
      fd.append("price", formData.price || "");
      fd.append("weight", formData.weight || "");
      fd.append("gender", formData.gender || "Non Selection");
      fd.append("breed", formData.breed || "");
      fd.append("delivery_time", formData.delivery_time || "");
      fd.append("stock_quantity", formData.stock_quantity || "1");
      fd.append("color", formData.color || "Non Selection");
      fd.append("milk_capacity_min", formData.milk_capacity_min || "");
      fd.append("milk_capacity_max", formData.milk_capacity_max || "");
      fd.append("age", formData.age || "");
      fd.append("lactation", formData.lactation || "");
      fd.append("short_description", formData.short_description || "");
      fd.append("description", formData.description || "");

      if (formData.featured_image instanceof File) {
        fd.append("featured_image", formData.featured_image);
      }

      if (formData.id) {
        fd.append("_method", "PUT");
        await api.post(`/admin/products/${formData.id}`, fd);
        setMsg("✅ Product updated successfully!");
      } else {
        await api.post("/admin/products", fd);
        setMsg("✅ Product added successfully!");
      }

      await loadSellerProducts();
      setTimeout(() => {
        setView("list");
        setMsg("");
      }, 900);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || err.message || "Failed to save product."));
    } finally {
      setSaving(false);
    }
  };

  // Filter products in list view
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const catId = p.category_id?._id || p.category_id;
    const matchCat = filterCat === "all" || catId === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#f4f6f9",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "1080px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* ─── MODAL TOP HEADER ────────────────────────────────────── */}
        <div
          style={{
            background: "#1e293b",
            color: "#ffffff",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #334155",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              src={getImageUrl(seller?.avatar, DEFAULT_AVATAR)}
              alt={sellerDisplayName}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ff7600",
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#ffffff" }}>
                  {sellerDisplayName}
                </h3>
                <span
                  style={{
                    background: "#0f766e",
                    color: "#ccfbf1",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  Seller Products
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                👤 {seller?.name} • 📞 {seller?.phone || "No phone"} • 📍 {[seller?.city, seller?.state].filter(Boolean).join(", ") || "India"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {view === "form" ? (
              <button
                type="button"
                onClick={() => setView("list")}
                style={{
                  background: "#334155",
                  color: "#f8fafc",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ← Back to Products List
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{
                  background: "#ff7600",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 4px rgba(255, 118, 0, 0.3)",
                }}
              >
                ➕ Add New Product
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                color: "#94a3b8",
                border: "none",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
                padding: "4px 8px",
                lineHeight: 1,
              }}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ─── MODAL BODY CONTAINER (Scrollable) ──────────────────── */}
        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
          {msg && (
            <div
              style={{
                padding: "12px 18px",
                borderRadius: "6px",
                fontSize: "13.5px",
                fontWeight: 600,
                marginBottom: "16px",
                background: msg.startsWith("✅") ? "#d1e7dd" : "#f8d7da",
                color: msg.startsWith("✅") ? "#0f5132" : "#842029",
                border: `1px solid ${msg.startsWith("✅") ? "#badbcc" : "#f5c2c7"}`,
              }}
            >
              {msg}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 1: PRODUCTS LIST TABLE
             ══════════════════════════════════════════════════════════════ */}
          {view === "list" && (
            <div>
              {/* Search & Filter Bar */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: "260px" }}>
                  <input
                    type="text"
                    placeholder="🔍 Search products by name, breed, or slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  />
                  <select
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      background: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => {
                      const cId = c.id || c._id;
                      return (
                        <option key={cId} value={cId}>
                          {c.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
                  Total: {products.length} Products
                </div>
              </div>

              {/* Table */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
                    <div>Loading seller products...</div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "8px" }}>🐄</div>
                    <h4 style={{ color: "#0f172a", margin: "0 0 6px" }}>No Products Found</h4>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 16px" }}>
                      {searchQuery || filterCat !== "all"
                        ? "No listings match your search or filter."
                        : `No products have been added for ${sellerDisplayName} yet.`}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      style={{
                        background: "#0d6efd",
                        color: "#fff",
                        border: "none",
                        padding: "8px 18px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ➕ Add First Product for This Seller
                    </button>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "12px 14px", width: "60px" }}>Image</th>
                        <th style={{ padding: "12px 14px" }}>Product Title & Breed</th>
                        <th style={{ padding: "12px 14px" }}>Category</th>
                        <th style={{ padding: "12px 14px" }}>Price</th>
                        <th style={{ padding: "12px 14px" }}>Milk Yield</th>
                        <th style={{ padding: "12px 14px" }}>Stock</th>
                        <th style={{ padding: "12px 14px", textAlign: "right", minWidth: "150px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => {
                        const pId = p.id || p._id;
                        const pImg = p.featured_image
                          ? getImageUrl(p.featured_image)
                          : "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=100&q=80";
                        const liveUrl = `/pashu/${p.slug || pId}`;

                        return (
                          <tr
                            key={pId}
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td style={{ padding: "10px 14px" }}>
                              <img
                                src={pImg}
                                alt={p.name}
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "6px",
                                  objectFit: "cover",
                                  border: "1px solid #cbd5e1",
                                }}
                              />
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ fontWeight: 700, color: "#0f172a" }}>{p.name}</div>
                              <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                                Breed: {p.breed || "Pure Breed"} {p.gender ? `• ${p.gender}` : ""}
                              </div>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <span
                                style={{
                                  background: "#f1f5f9",
                                  color: "#334155",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                }}
                              >
                                {p.category?.name || p.category_id?.name || "Dairy Cattle"}
                              </span>
                            </td>
                            <td style={{ padding: "10px 14px", fontWeight: 700, color: "#059669" }}>
                              {p.price ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Direct Quote"}
                            </td>
                            <td style={{ padding: "10px 14px", color: "#334155" }}>
                              {p.milk_capacity_min || p.milk_capacity_max
                                ? `${p.milk_capacity_min || 0} - ${p.milk_capacity_max || 0} L/Day`
                                : "N/A"}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <span
                                style={{
                                  background: p.availability === "sold" ? "#fee2e2" : "#dcfce7",
                                  color: p.availability === "sold" ? "#991b1b" : "#166534",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                              >
                                {p.availability === "sold" ? "Sold" : "In Stock"} ({p.stock_quantity ?? p.quantity ?? 1})
                              </span>
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                <Link
                                  to={liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    background: "#f1f5f9",
                                    color: "#0f172a",
                                    textDecoration: "none",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}
                                  title="View on Live Website"
                                >
                                  👁️ View
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(p)}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    background: "#eff6ff",
                                    color: "#1d4ed8",
                                    border: "1px solid #bfdbfe",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                  title="Edit Product"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p)}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    background: "#fef2f2",
                                    color: "#dc2626",
                                    border: "1px solid #fecaca",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                  title="Delete Product"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 2: ADD / EDIT PRODUCT FORM (Matching Screenshot Exactly)
             ══════════════════════════════════════════════════════════════ */}
          {view === "form" && (
            <form onSubmit={handleSubmitForm}>
              {/* CARD 1: PRODUCT DETAILS */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 18px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#0f172a",
                  }}
                >
                  Product Details
                </div>

                <div style={{ padding: "18px 20px" }}>
                  {/* Row 1: Product Title | Type Product Slug Here */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "18px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Product Title *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter here category name"
                        value={formData.name}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Type Product Slug Here
                      </label>
                      <div style={{ display: "flex" }}>
                        <span
                          style={{
                            background: "#e2e8f0",
                            color: "#475569",
                            padding: "8px 12px",
                            fontSize: "13px",
                            fontWeight: 600,
                            border: "1px solid #cbd5e1",
                            borderRight: "none",
                            borderRadius: "4px 0 0 4px",
                          }}
                        >
                          Slug/
                        </span>
                        <input
                          type="text"
                          placeholder="Slug"
                          value={formData.slug}
                          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "0 4px 4px 0",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Product Price | Weight */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "18px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Product Price
                      </label>
                      <input
                        type="number"
                        placeholder="Enter here product price"
                        value={formData.price}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Weight
                      </label>
                      <input
                        type="text"
                        placeholder="Kilogram / kg"
                        value={formData.weight}
                        onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Gender */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        fontSize: "13.5px",
                        background: "#fff",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="Non Selection">Non Selection</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Heifer">Heifer</option>
                      <option value="Milking Cow">Milking Cow</option>
                      <option value="Pregnant Cow">Pregnant Cow</option>
                      <option value="Bull">Bull</option>
                      <option value="Calf">Calf</option>
                    </select>
                  </div>

                  {/* Row 4: Breed | Delivery Time */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "18px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Breed
                      </label>
                      <input
                        type="text"
                        placeholder="Enter here product breed"
                        value={formData.breed}
                        onChange={(e) => setFormData((prev) => ({ ...prev, breed: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Delivery Time
                      </label>
                      <input
                        type="text"
                        placeholder="Type here delivery time"
                        value={formData.delivery_time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, delivery_time: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 5: Stock Quantity | Color */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "18px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="Enter here stock Quantity"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Color
                      </label>
                      <select
                        value={formData.color}
                        onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          background: "#fff",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="Non Selection">Non Selection</option>
                        <option value="Black">Black</option>
                        <option value="White">White</option>
                        <option value="Brown">Brown</option>
                        <option value="Black & White">Black & White</option>
                        <option value="Reddish Brown">Reddish Brown</option>
                        <option value="Red Sindhi">Red Sindhi</option>
                        <option value="Spotted">Spotted</option>
                        <option value="Grey">Grey</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 6: Milk Capacity Min | Max */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "18px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Milk Capacity Min (L/day)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={formData.milk_capacity_min}
                        onChange={(e) => setFormData((prev) => ({ ...prev, milk_capacity_min: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Milk Capacity Max (L/day)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        value={formData.milk_capacity_max}
                        onChange={(e) => setFormData((prev) => ({ ...prev, milk_capacity_max: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 7: Age | Lactation */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "18px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Age
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3.5 Years / 3"
                        value={formData.age}
                        onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Lactation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1st Lactation / 2nd"
                        value={formData.lactation}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lactation: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 8: Product Image */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Product Image
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        background: "#fff",
                        cursor: "pointer",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background: "#e2e8f0",
                          padding: "8px 14px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                          borderRight: "1px solid #cbd5e1",
                        }}
                      >
                        Choose file
                      </div>
                      <div style={{ padding: "8px 14px", fontSize: "13px", color: "#64748b" }}>
                        {formData.featured_image ? formData.featured_image.name : "No file chosen"}
                      </div>
                    </div>

                    {formData.previewImage && (
                      <div style={{ marginTop: "10px" }}>
                        <img
                          src={formData.previewImage}
                          alt="Preview"
                          style={{
                            width: "90px",
                            height: "90px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            border: "1px solid #cbd5e1",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 2: ASSIGN CATEGORY */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 18px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#0f172a",
                  }}
                >
                  Assign Category
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Assign Main Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      fontSize: "13.5px",
                      background: "#fff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => {
                      const cId = c.id || c._id;
                      return (
                        <option key={cId} value={cId}>
                          {c.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* CARD 3: PRODUCT DESCRIPTION */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 18px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#0f172a",
                  }}
                >
                  Product Description
                </div>
                <div style={{ padding: "18px 20px" }}>
                  {/* Short Description */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Short Description
                    </label>
                    <input
                      type="text"
                      placeholder="Brief one-line summary of cattle or key selling point"
                      value={formData.short_description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, short_description: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Full Description
                    </label>

                    {/* Toolbar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 10px",
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderBottom: "none",
                        borderRadius: "4px 4px 0 0",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, description: `${prev.description} <b>Text</b>` }))}
                        style={{ padding: "4px 8px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "3px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, description: `${prev.description} <u>Text</u>` }))}
                        style={{ padding: "4px 8px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "3px", textDecoration: "underline", cursor: "pointer" }}
                      >
                        U
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, description: `${prev.description} <s>Text</s>` }))}
                        style={{ padding: "4px 8px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "3px", textDecoration: "line-through", cursor: "pointer" }}
                      >
                        S
                      </button>
                      <span style={{ color: "#cbd5e1" }}>|</span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, description: `${prev.description}\n• Point 1\n• Point 2` }))}
                        style={{ padding: "4px 8px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, description: `${prev.description}\n1. Step 1\n2. Step 2` }))}
                        style={{ padding: "4px 8px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}
                      >
                        1. Numbered
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      placeholder="Enter complete description of the cattle..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "0 0 4px 4px",
                        fontSize: "13.5px",
                        lineHeight: "1.6",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: "#0d6efd",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 4px rgba(13, 110, 253, 0.3)",
                  }}
                >
                  {saving ? "Saving..." : formData.id ? "Update Product" : "Submit"}
                </button>

                <button
                  type="button"
                  onClick={() => setView("list")}
                  style={{
                    background: "#e2e8f0",
                    color: "#334155",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
