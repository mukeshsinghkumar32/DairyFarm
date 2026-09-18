import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function SellerManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const [editingProduct, setEditingProduct] = useState({
    id: "",
    name: "",
    slug: "",
    category_id: "",
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
    short_description: "",
    description: "",
    status: true,
    availability: "available",
  });
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const editFileInputRef = useRef(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await api.get(`/sellers/products?search=${encodeURIComponent(search)}`);
      if (data.success) {
        setProducts(data.data?.data || []);
      }
    } catch (err) {
      console.error("Failed to load seller products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for edit dropdown
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data?.data || []);
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  // Open Edit Modal with selected product data
  const handleOpenEditModal = (p) => {
    const pId = p.id || p._id;
    const rawCatId =
      p.category_id?._id ||
      p.category_id?.id ||
      p.category?._id ||
      p.category?.id ||
      (typeof p.category_id === "string" ? p.category_id : "");

    setEditingProduct({
      id: pId,
      name: p.name || "",
      slug: p.slug || "",
      category_id: rawCatId || "",
      price: p.price !== null && p.price !== undefined ? p.price : "",
      weight: p.weight || "",
      gender: p.gender || "Non Selection",
      breed: p.breed || "",
      delivery_time: p.delivery_time || "",
      stock_quantity: p.stock_quantity ?? p.quantity ?? 1,
      color: p.color || "Non Selection",
      milk_capacity_min:
        p.milk_capacity_min !== null && p.milk_capacity_min !== undefined
          ? p.milk_capacity_min
          : "",
      milk_capacity_max:
        p.milk_capacity_max !== null && p.milk_capacity_max !== undefined
          ? p.milk_capacity_max
          : "",
      age: p.age !== null && p.age !== undefined ? p.age : "",
      lactation: p.lactation || "",
      short_description: p.short_description || "",
      description: p.description || "",
      status: p.status !== undefined ? p.status : true,
      availability: p.availability || "available",
    });

    setEditFile(null);
    if (p.featured_image) {
      setEditPreview(
        p.featured_image.startsWith("http")
          ? p.featured_image
          : `${import.meta.env.VITE_Backend_URL}${p.featured_image}`
      );
    } else {
      setEditPreview("");
    }
    setEditMsg("");
    setEditModalOpen(true);
  };

  // Handle Edit Form Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) {
      setEditMsg("❌ Product title is required.");
      return;
    }

    setEditLoading(true);
    setEditMsg("");

    try {
      const formData = new FormData();
      formData.append("name", editingProduct.name.trim());
      formData.append("slug", editingProduct.slug || editingProduct.name);
      formData.append("category_id", editingProduct.category_id);
      formData.append("price", editingProduct.price || "");
      formData.append("weight", editingProduct.weight || "");
      formData.append("gender", editingProduct.gender);
      formData.append("breed", editingProduct.breed || "");
      formData.append("delivery_time", editingProduct.delivery_time || "");
      formData.append("stock_quantity", editingProduct.stock_quantity || "1");
      formData.append("color", editingProduct.color);
      formData.append("milk_capacity_min", editingProduct.milk_capacity_min || "");
      formData.append("milk_capacity_max", editingProduct.milk_capacity_max || "");
      formData.append("age", editingProduct.age || "");
      formData.append("lactation", editingProduct.lactation || "");
      formData.append("short_description", editingProduct.short_description || "");
      formData.append("category_id", editingProduct.category_id);
      formData.append("description", editingProduct.description || "");
      formData.append("status", editingProduct.status ? "true" : "false");
      formData.append("availability", editingProduct.availability);
      if (editFile) {
        formData.append("featured_image", editFile);
      }

      const res = await api.post(`/sellers/products/${editingProduct.id}`, formData);
      if (res.data.success) {
        const updated = res.data.data;
        setProducts((prev) =>
          prev.map((item) => ((item.id || item._id) === editingProduct.id ? updated : item))
        );
        setMsg(`✅ Product "${editingProduct.name}" updated successfully!`);
        setEditModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      setEditMsg(
        "❌ " + (err.response?.data?.message || "Failed to update product. Try again.")
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setEditFile(selected);
      setEditPreview(URL.createObjectURL(selected));
    }
  };

  const insertEditFormatting = (tag) => {
    setEditingProduct((prev) => ({
      ...prev,
      description: `${prev.description} <${tag}>Text</${tag}> `,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/sellers/products/${id}`);
      setProducts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      setMsg("✅ Product deleted successfully!");
    } catch (err) {
      setMsg("❌ Failed to delete product.");
    }
  };

  return (
    <div>
      <div className="seller-page-header">
        <h1 className="seller-page-title">Manage Products</h1>
        <Link to="/seller/products/add" className="btn-seller-primary" style={{ textDecoration: "none" }}>
          ＋ Add New Product
        </Link>
      </div>

      {msg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "4px",
            fontSize: "13.5px",
            marginBottom: "16px",
            background: msg.startsWith("✅") ? "#d1e7dd" : "#f8d7da",
            color: msg.startsWith("✅") ? "#0f5132" : "#842029",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{msg}</span>
          <button
            type="button"
            onClick={() => setMsg("")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "inherit" }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="seller-card">
        <div className="seller-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Product Listing</span>
          <input
            type="text"
            className="seller-input"
            style={{ width: "240px", height: "32px", fontSize: "12.5px" }}
            placeholder="Search by name, breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="seller-table-wrap">
          <table className="seller-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>SrNo</th>
                <th style={{ width: "70px" }}>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Breed</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Added on</th>
                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "28px", color: "#6c757d" }}>
                    {loading ? "Loading products..." : "No products found."}
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => {
                  const pImg = p.featured_image
                    ? p.featured_image.startsWith("http")
                      ? p.featured_image
                      : `${import.meta.env.VITE_Backend_URL}${p.featured_image}`
                    : "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=80&q=80";

                  const addedDate = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "15-09-2026";

                  const pId = p.id || p._id;

                  return (
                    <tr key={pId}>
                      <td>{idx + 1}</td>
                      <td>
                        <img
                          src={pImg}
                          alt={p.name}
                          className="seller-table-thumb"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/50";
                          }}
                        />
                      </td>
                      <td>
                        <strong
                          style={{ cursor: "pointer", color: "#222e3c" }}
                          onClick={() => handleOpenEditModal(p)}
                          title="Click to edit"
                        >
                          {p.name}
                        </strong>
                      </td>
                      <td>{p.category_id?.name || p.category?.name || "General"}</td>
                      <td>{p.breed || "—"}</td>
                      <td>{p.price ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Negotiable"}</td>
                      <td>{p.stock_quantity ?? p.quantity ?? 1}</td>
                      <td>{addedDate}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {/* Quick Modal Edit Button */}
                          <button
                            type="button"
                            className="seller-action-btn seller-action-edit"
                            onClick={() => handleOpenEditModal(p)}
                            title="Quick Edit in Modal"
                          >
                            ✏️
                          </button>

                          {/* Full Page Edit Button */}
                          <Link
                            to={`/seller/products/edit/${pId}`}
                            className="seller-action-btn"
                            title="Full Page Edit"
                            style={{ textDecoration: "none", fontSize: "14px" }}
                          >
                            📝
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            className="seller-action-btn seller-action-delete"
                            onClick={() => handleDelete(pId)}
                            title="Delete"
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
      </div>

      {/* ─── EDIT PRODUCT MODAL ────────────────────────────────────── */}
      {editModalOpen && (
        <div className="seller-modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div
            className="seller-modal-box seller-modal-box-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            {/* Modal Header */}
            <div className="seller-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Edit Product</h3>
                <span style={{ fontSize: "12px", color: "#6c757d" }}>
                  ID: #{editingProduct.id}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Link
                  to={`/seller/products/edit/${editingProduct.id}`}
                  style={{ fontSize: "12.5px", color: "#0d6efd", textDecoration: "none" }}
                  target="_blank"
                  title="Open full edit page"
                >
                  Full Page ↗
                </Link>
                <button
                  type="button"
                  className="seller-modal-close"
                  onClick={() => setEditModalOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="seller-modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {editMsg && (
                <div
                  style={{
                    padding: "8px 14px",
                    borderRadius: "4px",
                    fontSize: "13px",
                    marginBottom: "16px",
                    background: editMsg.startsWith("✅") ? "#d1e7dd" : "#f8d7da",
                    color: editMsg.startsWith("✅") ? "#0f5132" : "#842029",
                  }}
                >
                  {editMsg}
                </div>
              )}

              <form id="edit-product-form" onSubmit={handleSaveEdit}>
                {/* Row 1: Title | Slug */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Product Title *</label>
                    <input
                      type="text"
                      className="seller-input"
                      placeholder="Product Title"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Product Slug</label>
                    <div className="seller-input-group">
                      <span className="seller-input-prefix">Slug/</span>
                      <input
                        type="text"
                        className="seller-input"
                        placeholder="slug"
                        value={editingProduct.slug}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, slug: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Price | Weight */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Price (₹)</label>
                    <input
                      type="number"
                      className="seller-input"
                      placeholder="e.g. 65000"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Weight</label>
                    <input
                      type="text"
                      className="seller-input"
                      placeholder="e.g. 400 kg"
                      value={editingProduct.weight}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, weight: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Row 3: Category | Gender */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Category</label>
                    <select
                      className="seller-input"
                      value={editingProduct.category_id}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, category_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id || c._id} value={c.id || c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <small style={{ color: "#6c757d", marginTop: "4px", display: "block" }}>
                        Loading added categories...
                      </small>
                    )}
                  </div>

                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Gender</label>
                    <select
                      className="seller-input"
                      value={editingProduct.gender}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, gender: e.target.value })
                      }
                    >
                      <option value="Non Selection">Non Selection</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Heifer">Heifer</option>
                      <option value="Milking Cow">Milking Cow</option>
                      <option value="Pregnant Cow">Pregnant Cow</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Breed | Delivery Time */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Breed</label>
                    <input
                      type="text"
                      className="seller-input"
                      placeholder="e.g. Gir, HF, Murrah"
                      value={editingProduct.breed}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, breed: e.target.value })
                      }
                    />
                  </div>

                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Delivery Time</label>
                    <input
                      type="text"
                      className="seller-input"
                      placeholder="e.g. 2-3 Days"
                      value={editingProduct.delivery_time}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          delivery_time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Row 5: Stock Quantity | Color */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="seller-input"
                      placeholder="1"
                      value={editingProduct.stock_quantity}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock_quantity: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Color</label>
                    <select
                      className="seller-input"
                      value={editingProduct.color}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, color: e.target.value })
                      }
                    >
                      <option value="Non Selection">Non Selection</option>
                      <option value="Black">Black</option>
                      <option value="White">White</option>
                      <option value="Brown">Brown</option>
                      <option value="Black & White">Black & White</option>
                      <option value="Red Sindhi">Red Sindhi</option>
                      <option value="Spotted">Spotted</option>
                    </select>
                  </div>
                </div>

                {/* Row 6: Milk Capacity Min | Milk Capacity Max */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Milk Capacity Min (L/day)</label>
                    <input
                      type="number"
                      className="seller-input"
                      placeholder="e.g. 15"
                      value={editingProduct.milk_capacity_min}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          milk_capacity_min: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Milk Capacity Max (L/day)</label>
                    <input
                      type="number"
                      className="seller-input"
                      placeholder="e.g. 25"
                      value={editingProduct.milk_capacity_max}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          milk_capacity_max: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Row 7: Age | Lactation */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Age</label>
                    <input
                      type="text"
                      className="seller-input"
                      placeholder="e.g. 3.5 Years / 3"
                      value={editingProduct.age}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          age: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="seller-form-group" style={{ margin: 0 }}>
                    <label className="seller-form-label">Lactation</label>
                    <input
                      type="text"
                      className="seller-input"
                      placeholder="e.g. 1st Lactation / 2nd"
                      value={editingProduct.lactation}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          lactation: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Row 8: Image Upload & Preview */}
                <div className="seller-form-group" style={{ marginBottom: "14px" }}>
                  <label className="seller-form-label">Product Image</label>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleEditFileChange}
                  />
                  <div
                    className="seller-file-picker"
                    onClick={() => editFileInputRef.current?.click()}
                  >
                    <div className="seller-file-btn">Choose file</div>
                    <div className="seller-file-name">
                      {editFile ? editFile.name : "Select new image or retain current"}
                    </div>
                  </div>

                  {editPreview && (
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={editPreview}
                        alt="Preview"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "4px",
                          objectFit: "cover",
                          border: "1px solid #dee2e6",
                        }}
                      />
                      <span style={{ fontSize: "12px", color: "#6c757d" }}>
                        {editFile ? "New image selected" : "Current product image"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Row 9: Short Description */}
                <div className="seller-form-group" style={{ marginBottom: "14px" }}>
                  <label className="seller-form-label">Short Description</label>
                  <input
                    type="text"
                    className="seller-input"
                    placeholder="Brief one-line summary of cattle or key traits"
                    value={editingProduct.short_description}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        short_description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Row 10: Full Description */}
                <div className="seller-form-group" style={{ marginBottom: "14px" }}>
                  <label className="seller-form-label">Full Description</label>
                  <div className="seller-rich-toolbar">
                    <button
                      type="button"
                      className="seller-tb-btn"
                      onClick={() => insertEditFormatting("h4")}
                    >
                      H4
                    </button>
                    <button
                      type="button"
                      className="seller-tb-btn"
                      onClick={() => insertEditFormatting("b")}
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      className="seller-tb-btn"
                      onClick={() => insertEditFormatting("i")}
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      className="seller-tb-btn"
                      onClick={() => insertEditFormatting("u")}
                    >
                      <u>U</u>
                    </button>
                    <button
                      type="button"
                      className="seller-tb-btn"
                      onClick={() => insertEditFormatting("li")}
                    >
                      • List
                    </button>
                  </div>
                  <textarea
                    className="seller-rich-textarea"
                    rows="4"
                    placeholder="Product details, breed traits, milk yield..."
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 20px",
                background: "#f8f9fa",
                borderTop: "1px solid var(--seller-border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                type="button"
                className="btn-seller-dark"
                onClick={() => setEditModalOpen(false)}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-product-form"
                className="btn-seller-primary"
                disabled={editLoading}
              >
                {editLoading ? "Saving Changes..." : "Update Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
