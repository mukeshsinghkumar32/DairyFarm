import { useEffect, useRef, useState } from "react";
import api from "../../api/client";

export default function SellerAbout() {
  const [aboutList, setAboutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const fileInputRef = useRef(null);

  const fetchAboutEntries = async () => {
    try {
      const { data } = await api.get("/sellers/about");
      if (data.success) {
        setAboutList(data.data || []);
      }
    } catch (err) {
      console.error("Error loading about entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutEntries();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setMsg("❌ Please enter a title.");
      return;
    }

    setSubmitting(true);
    setMsg("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content);
      if (file) {
        formData.append("image", file);
      }

      if (editingId) {
        await api.post(`/sellers/about/${editingId}`, formData);
        setMsg("✅ Entry updated successfully!");
      } else {
        await api.post("/sellers/about", formData);
        setMsg("✅ Entry created successfully!");
      }

      setTitle("");
      setContent("");
      setFile(null);
      setPreview("");
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchAboutEntries();
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Operation failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id || entry._id);
    setTitle(entry.title);
    setContent(entry.content || "");
    setPreview(
      entry.image
        ? entry.image.startsWith("http")
          ? entry.image
          : `${import.meta.env.VITE_Backend_URL}${entry.image}`
        : ""
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await api.delete(`/sellers/about/${id}`);
      setAboutList((prev) => prev.filter((item) => (item.id || item._id) !== id));
      setMsg("✅ Entry deleted successfully!");
    } catch (err) {
      setMsg("❌ Failed to delete entry.");
    }
  };

  // Helper toolbar actions
  const insertFormatting = (tag) => {
    setContent((prev) => `${prev} <${tag}>Formatted text</${tag}> `);
  };

  return (
    <div>
      {msg && (
        <div
          style={{
            padding: "8px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "16px",
            background: msg.startsWith("✅") ? "#d1e7dd" : "#f8d7da",
            color: msg.startsWith("✅") ? "#0f5132" : "#842029",
          }}
        >
          {msg}
        </div>
      )}

      {/* ─── TOP ROW: 2 CARDS SIDE-BY-SIDE (Screenshot 2) ───── */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Left Card: About Us / Company Details */}
          <div className="seller-card" style={{ margin: 0 }}>
            <div className="seller-card-header">
              About Us / Company Details
            </div>
            <div className="seller-card-body">
              <div className="seller-form-group">
                <label className="seller-form-label">Product Title</label>
                <input
                  type="text"
                  className="seller-input"
                  placeholder="Enter here category name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* File picker */}
              <div className="seller-form-group">
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

                {/* Preview Box */}
                <div className="seller-preview-box">
                  {preview ? (
                    <img src={preview} alt="About Preview" />
                  ) : (
                    <div className="seller-preview-placeholder">
                      <span>🖼️</span>
                      <span>No image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: About Us Content / Company Details */}
          <div className="seller-card" style={{ margin: 0 }}>
            <div className="seller-card-header">
              About Us Content / Company Details
            </div>
            <div className="seller-card-body">
              <div className="seller-form-group">
                <label className="seller-form-label">Content</label>

                {/* Rich Editor Toolbar matching Screenshot 2 */}
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

                  <select className="seller-tb-select" defaultValue="system-ui">
                    <option value="system-ui">system-ui ▾</option>
                    <option value="sans-serif">sans-serif</option>
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
                  rows={4}
                  value={content}
                  placeholder="Enter detailed about us / company content here..."
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn-seller-dark"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-seller-dark"
                    style={{ background: "#6c757d" }}
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setContent("");
                      setFile(null);
                      setPreview("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ─── BOTTOM CARD: PRODUCT / ABOUT LISTING (Screenshot 2) ─ */}
      <div className="seller-card">
        <div className="seller-card-header">Product Listing</div>
        <div className="seller-table-wrap">
          <table className="seller-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>SrNo</th>
                <th style={{ width: "160px" }}>Image</th>
                <th>Title</th>
                <th style={{ width: "180px" }}>Added on</th>
                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {aboutList.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "24px" }}>
                    No about entries added yet.
                  </td>
                </tr>
              ) : (
                aboutList.map((item, idx) => {
                  const entryImg = item.image
                    ? item.image.startsWith("http")
                      ? item.image
                      : `${import.meta.env.VITE_Backend_URL}${item.image}`
                    : "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=100&q=80";

                  const addedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "15-09-2026";

                  const itemId = item.id || item._id;

                  return (
                    <tr key={itemId}>
                      <td>{idx + 1}</td>
                      <td>
                        <img
                          src={entryImg}
                          alt={item.title}
                          className="seller-table-thumb"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/50";
                          }}
                        />
                      </td>
                      <td>
                        <strong>{item.title}</strong>
                      </td>
                      <td>{addedDate}</td>
                      <td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            className="seller-action-btn seller-action-edit"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            📝
                          </button>
                          <button
                            type="button"
                            className="seller-action-btn seller-action-delete"
                            onClick={() => handleDelete(itemId)}
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
    </div>
  );
}
