import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function SellerAddProduct() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Form Fields matching Screenshot 4
  const [productTitle, setProductTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("Non Selection");
  const [breed, setBreed] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
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

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load Categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        const list = res.data?.data || [];
        setCategories(list);
        if (list.length > 0 && !categoryId) {
          setCategoryId(list[0].id || list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Auto-fill slug from title if slug not typed
  const handleTitleChange = (val) => {
    setProductTitle(val);
    if (!slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
      setSlug(generated);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productTitle.trim()) {
      setMsg("❌ Product title is required.");
      return;
    }

    setLoading(true);
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
      if (file) {
        formData.append("featured_image", file);
      }

      const res = await api.post("/sellers/products", formData);
      if (res.data.success) {
        setMsg("✅ Product created successfully!");
        setTimeout(() => {
          navigate("/seller/products/manage");
        }, 1200);
      }
    } catch (err) {
      setMsg(
        "❌ " +
          (err.response?.data?.message || "Failed to create product. Try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const insertFormatting = (tag) => {
    setDescription((prev) => `${prev} <${tag}>Text</${tag}> `);
  };

  return (
    <div>
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
        {/* ─── CARD 1: PRODUCT DETAILS (Screenshot 4) ──────────── */}
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
                  placeholder="Enter here category name"
                  value={productTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Type Product Slug Here</label>
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
                <label className="seller-form-label">Product Price</label>
                <input
                  type="number"
                  className="seller-input"
                  placeholder="Enter here product price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Weight</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="Kilogram / kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Gender (Full width select) */}
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
                  placeholder="Enter here product breed"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>

              <div className="seller-form-group" style={{ margin: 0 }}>
                <label className="seller-form-label">Delivery Time</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="Type here delivery time"
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
                  placeholder="Enter here stock Quantity"
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

            {/* Row 8: Choose file */}
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
                <div className="seller-file-btn">Choose file</div>
                <div className="seller-file-name">
                  {file ? file.name : "No file chosen"}
                </div>
              </div>

              {preview && (
                <div className="seller-preview-box">
                  <img src={preview} alt="Product Preview" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── CARD 2: ASSIGN CATEGORY (Screenshot 4) ──────────── */}
        <div className="seller-card">
          <div className="seller-card-header">Assign Category</div>
          <div className="seller-card-body">
            <div className="seller-form-group" style={{ margin: 0 }}>
              <label className="seller-form-label">Assign Main Category *</label>
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

        {/* ─── CARD 3: PRODUCT DESCRIPTION (Screenshot 4) ──────── */}
        <div className="seller-card">
          <div className="seller-card-header">Product Description</div>
          <div className="seller-card-body">
            {/* Short Description */}
            <div className="seller-form-group">
              <label className="seller-form-label">Short Description</label>
              <input
                type="text"
                className="seller-input"
                placeholder="Brief one-line summary of cattle or key selling point"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Full Description</label>

              {/* Rich Editor Toolbar matching Screenshot 4 */}
              <div className="seller-rich-toolbar">
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Magic Format"
                >
                  🪄 ▾
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  onClick={() => insertFormatting("strong")}
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  onClick={() => insertFormatting("u")}
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  onClick={() => insertFormatting("s")}
                  title="Strikethrough"
                >
                  <s>S</s>
                </button>

                <select className="seller-tb-select" defaultValue="sans-serif">
                  <option value="sans-serif">sans-serif ▾</option>
                  <option value="system-ui">system-ui</option>
                  <option value="Arial">Arial</option>
                </select>

                <button
                  type="button"
                  className="seller-tb-btn"
                  style={{ color: "#e63946", fontWeight: "bold" }}
                  title="Text Color"
                >
                  A ▾
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  onClick={() => insertFormatting("li")}
                  title="Bullet list"
                >
                  •≡
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Numbered list"
                >
                  1≡
                </button>
                <button type="button" className="seller-tb-btn" title="Align">
                  ≡ ▾
                </button>
                <button type="button" className="seller-tb-btn" title="Table">
                  ⊞ ▾
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Insert Link"
                >
                  🔗
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Insert Image"
                >
                  🖼️
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Insert Video"
                >
                  🎥
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Fullscreen"
                >
                  ⛶
                </button>
                <button
                  type="button"
                  className="seller-tb-btn"
                  title="Code View"
                >
                  {"</>"}
                </button>
                <button type="button" className="seller-tb-btn" title="Help">
                  ?
                </button>
              </div>

              <textarea
                className="seller-rich-textarea"
                rows={5}
                placeholder="Enter complete description of the cattle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Blue Submit button matching Screenshot 4 */}
            <div style={{ marginTop: "20px" }}>
              <button
                type="submit"
                className="btn-seller-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
