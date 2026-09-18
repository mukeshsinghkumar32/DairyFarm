import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function SellerEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Form fields
  const [productTitle, setProductTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("Non Selection");
  const [breed, setBreed] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [color, setColor] = useState("Non Selection");
  const [milkCapacityMin, setMilkCapacityMin] = useState("");
  const [milkCapacityMax, setMilkCapacityMax] = useState("");
  const [age, setAge] = useState("");
  const [lactation, setLactation] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [availability, setAvailability] = useState("available");

  // Load Categories & Product Details
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // 1. Fetch categories
        const catRes = await api.get("/categories");
        setCategories(catRes.data?.data || []);

        // 2. Fetch product by ID
        const prodRes = await api.get(`/sellers/products/${id}`);
        if (prodRes.data.success && prodRes.data.data) {
          const p = prodRes.data.data;
          setProductTitle(p.name || "");
          setSlug(p.slug || "");
          setPrice(p.price !== null && p.price !== undefined ? p.price : "");
          setWeight(p.weight || "");
          setGender(p.gender || "Non Selection");
          setBreed(p.breed || "");
          setDeliveryTime(p.delivery_time || "");
          setStockQuantity(p.stock_quantity ?? p.quantity ?? 1);
          setColor(p.color || "Non Selection");
          setMilkCapacityMin(p.milk_capacity_min !== null && p.milk_capacity_min !== undefined ? p.milk_capacity_min : "");
          setMilkCapacityMax(p.milk_capacity_max !== null && p.milk_capacity_max !== undefined ? p.milk_capacity_max : "");
          setAge(p.age !== null && p.age !== undefined ? p.age : "");
          setLactation(p.lactation || "");
          setShortDescription(p.short_description || "");
          const rawCatId = p.category_id?._id || p.category_id?.id || p.category?._id || p.category?.id || (typeof p.category_id === "string" ? p.category_id : "");
          setCategoryId(rawCatId || "");
          setDescription(p.description || "");
          setStatus(p.status !== undefined ? p.status : true);
          setAvailability(p.availability || "available");

          if (p.featured_image) {
            const imgUrl = p.featured_image.startsWith("http")
              ? p.featured_image
              : `${import.meta.env.VITE_Backend_URL}${p.featured_image}`;
            setPreview(imgUrl);
          }
        }
      } catch (err) {
        console.error("Failed to load product for editing:", err);
        setMsg("❌ Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initData();
    }
  }, [id]);

  const handleTitleChange = (val) => {
    setProductTitle(val);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const insertFormatting = (tag) => {
    setDescription((prev) => `${prev} <${tag}>Text</${tag}> `);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productTitle.trim()) {
      setMsg("❌ Product title is required.");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      const formData = new FormData();
      formData.append("name", productTitle.trim());
      formData.append("slug", slug || productTitle);
      formData.append("price", price || "");
      formData.append("weight", weight || "");
      formData.append("gender", gender);
      formData.append("breed", breed || "");
      formData.append("delivery_time", deliveryTime || "");
      formData.append("stock_quantity", stockQuantity || "1");
      formData.append("color", color);
      formData.append("milk_capacity_min", milkCapacityMin || "");
      formData.append("milk_capacity_max", milkCapacityMax || "");
      formData.append("age", age || "");
      formData.append("lactation", lactation || "");
      formData.append("short_description", shortDescription || "");
      formData.append("category_id", categoryId);
      formData.append("description", description || "");
      formData.append("status", status ? "true" : "false");
      formData.append("availability", availability);
      if (file) {
        formData.append("featured_image", file);
      }

      const res = await api.post(`/sellers/products/${id}`, formData);
      if (res.data.success) {
        setMsg("✅ Product updated successfully!");
        setTimeout(() => {
          navigate("/seller/products/manage");
        }, 1200);
      }
    } catch (err) {
      setMsg(
        "❌ " +
          (err.response?.data?.message || "Failed to update product. Try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
        Loading product details...
      </div>
    );
  }

  return (
    <div>
      <div className="seller-page-header">
        <div>
          <h1 className="seller-page-title">Edit Product</h1>
          <div style={{ fontSize: "12.5px", color: "#6c757d", marginTop: "4px" }}>
            <Link to="/seller/products/manage" style={{ color: "#0d6efd", textDecoration: "none" }}>
              Products
            </Link>{" "}
            / Edit #{id}
          </div>
        </div>
        <Link
          to="/seller/products/manage"
          className="btn-seller-dark"
          style={{ textDecoration: "none", fontSize: "12.5px" }}
        >
          ← Back to Product Listing
        </Link>
      </div>

      {msg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "4px",
            fontSize: "13.5px",
            marginBottom: "18px",
            background: msg.startsWith("✅") ? "#d1e7dd" : "#f8d7da",
            color: msg.startsWith("✅") ? "#0f5132" : "#842029",
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ─── CARD 1: PRODUCT DETAILS ──────────────────────────── */}
        <div className="seller-card">
          <div className="seller-card-header">Product Details</div>
          <div className="seller-card-body">
            {/* Row 1: Title | Slug */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "16px",
              }}
            >
              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Product Title</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="Enter product title"
                  value={productTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
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
                    placeholder="Slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Price | Weight */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "16px",
              }}
            >
              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Product Price (₹)</label>
                <input
                  type="number"
                  className="seller-input"
                  placeholder="Enter product price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Weight</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="e.g. 450 kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Gender */}
            <div className="seller-form-group">
              <label className="seller-form-label">Gender</label>
              <select
                className="seller-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Non Selection">Non Selection</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Heifer">Heifer</option>
                <option value="Milking Cow">Milking Cow</option>
                <option value="Pregnant Cow">Pregnant Cow</option>
              </select>
            </div>

            {/* Row 4: Breed | Delivery Time */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "16px",
              }}
            >
              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Breed</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="e.g. Gir, Murrah, Sahiwal..."
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>

              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Delivery Time</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="e.g. 2-3 Days"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>
            </div>

            {/* Row 5: Stock Quantity | Color */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "16px",
              }}
            >
              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Stock Quantity</label>
                <input
                  type="number"
                  className="seller-input"
                  placeholder="Enter stock quantity"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>

              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Color</label>
                <select
                  className="seller-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
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
                gap: "20px",
                marginBottom: "16px",
              }}
            >
              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Milk Capacity Min (L/day)</label>
                <input
                  type="number"
                  className="seller-input"
                  placeholder="e.g. 15"
                  value={milkCapacityMin}
                  onChange={(e) => setMilkCapacityMin(e.target.value)}
                />
              </div>

              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Milk Capacity Max (L/day)</label>
                <input
                  type="number"
                  className="seller-input"
                  placeholder="e.g. 25"
                  value={milkCapacityMax}
                  onChange={(e) => setMilkCapacityMax(e.target.value)}
                />
              </div>
            </div>

            {/* Row 7: Age | Lactation */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "16px",
              }}
            >
              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Age</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="e.g. 3.5 Years / 3"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Lactation</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="e.g. 1st Lactation / 2nd"
                  value={lactation}
                  onChange={(e) => setLactation(e.target.value)}
                />
              </div>
            </div>

            {/* Row 8: Image Upload & Preview */}
            <div className="seller-form-group" style={{ margin: 0 }}>
              <label className="seller-form-label">Product Image</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <div
                className="seller-file-picker"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="seller-file-btn">Choose new file</div>
                <div className="seller-file-name">
                  {file ? file.name : "Select new image or keep existing"}
                </div>
              </div>

              {preview && (
                <div className="seller-preview-box" style={{ marginTop: "12px" }}>
                  <img
                    src={preview}
                    alt="Product Preview"
                    style={{ maxHeight: "160px", borderRadius: "4px", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── CARD 2: ASSIGN CATEGORY ─────────────────────────── */}
        <div className="seller-card">
          <div className="seller-card-header">Assign Category</div>
          <div className="seller-card-body">
            <div className="seller-form-group" style={{ margin: 0 }}>
              <label className="seller-form-label">Main Category *</label>
              <select
                className="seller-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
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
              {categories.length === 0 && (
                <small style={{ color: "#6c757d", marginTop: "4px", display: "block" }}>
                  Loading added categories...
                </small>
              )}
            </div>
          </div>
        </div>

        {/* ─── CARD 3: PRODUCT DESCRIPTION ─────────────────────── */}
        <div className="seller-card">
          <div className="seller-card-header">Product Description</div>
          <div className="seller-card-body">
            {/* Short Description */}
            <div className="seller-form-group">
              <label className="seller-form-label">Short Description</label>
              <input
                type="text"
                className="seller-input"
                placeholder="Brief one-line summary of cattle or key traits"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Full Description</label>

              <div className="seller-rich-toolbar">
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Heading"
                  onClick={() => insertFormatting("h4")}
                >
                  H4
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Bold"
                  onClick={() => insertFormatting("b")}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Italic"
                  onClick={() => insertFormatting("i")}
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Underline"
                  onClick={() => insertFormatting("u")}
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Bullet List"
                  onClick={() => insertFormatting("li")}
                >
                  • List
                </button>
              </div>

              <textarea
                className="seller-rich-textarea"
                rows="6"
                placeholder="Type here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                type="submit"
                className="btn-seller-primary"
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Update Product"}
              </button>
              <Link
                to="/seller/products/manage"
                className="btn-seller-dark"
                style={{ textDecoration: "none" }}
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
