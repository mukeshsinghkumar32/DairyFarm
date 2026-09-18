import { useEffect, useRef, useState } from "react";
import api from "../../api/client";

export default function SellerBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get("/sellers/banners");
      if (data.success) {
        setBanners(data.data || []);
      }
    } catch (err) {
      console.error("Error loading banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
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
      setMsg("❌ Please enter a banner title.");
      return;
    }

    setSubmitting(true);
    setMsg("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (file) {
        formData.append("image", file);
      }

      if (editingId) {
        await api.post(`/sellers/banners/${editingId}`, formData);
        setMsg("✅ Banner updated successfully!");
      } else {
        await api.post("/sellers/banners", formData);
        setMsg("✅ Banner added successfully!");
      }

      // Reset form
      setTitle("");
      setFile(null);
      setPreview("");
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchBanners();
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Operation failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id || banner._id);
    setTitle(banner.title);
    setPreview(
      banner.image
        ? banner.image.startsWith("http")
          ? banner.image
          : `${import.meta.env.VITE_Backend_URL}${banner.image}`
        : ""
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await api.delete(`/sellers/banners/${id}`);
      setBanners((prev) => prev.filter((b) => (b.id || b._id) !== id));
      setMsg("✅ Banner deleted successfully!");
    } catch (err) {
      setMsg("❌ Failed to delete banner.");
    }
  };

  return (
    <div>
      {/* ─── CARD 1: ADD BANNER (Screenshot 1) ────────────────── */}
      <div className="seller-card">
        <div className="seller-card-header">
          {editingId ? "Edit Banner" : "Add Banner"}
        </div>
        <div className="seller-card-body">
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

          <form onSubmit={handleSubmit}>
            <div className="seller-form-group">
              <label className="seller-form-label">Banner Title</label>
              <input
                type="text"
                className="seller-input"
                placeholder="Enter here category name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Custom file picker matching Screenshot 1 */}
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
                  <img src={preview} alt="Banner Preview" />
                ) : (
                  <div className="seller-preview-placeholder">
                    <span>🖼️</span>
                    <span>No image</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
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
                    setFile(null);
                    setPreview("");
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ─── CARD 2: BANNER LISTING (Screenshot 1) ───────────── */}
      <div className="seller-card">
        <div className="seller-card-header">Banner Listing</div>
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
              {banners.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "24px" }}>
                    No banners added yet.
                  </td>
                </tr>
              ) : (
                banners.map((b, idx) => {
                  const bannerImg = b.image
                    ? b.image.startsWith("http")
                      ? b.image
                      : `${import.meta.env.VITE_Backend_URL}${b.image}`
                    : "https://via.placeholder.com/60";

                  const addedDate = b.createdAt
                    ? new Date(b.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "15-09-2026";

                  const bId = b.id || b._id;

                  return (
                    <tr key={bId}>
                      <td>{idx + 1}</td>
                      <td>
                        <img
                          src={bannerImg}
                          alt={b.title}
                          className="seller-table-thumb"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/50";
                          }}
                        />
                      </td>
                      <td>
                        <strong>{b.title}</strong>
                      </td>
                      <td>{addedDate}</td>
                      <td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            className="seller-action-btn seller-action-edit"
                            onClick={() => handleEdit(b)}
                            title="Edit"
                          >
                            📝
                          </button>
                          <button
                            type="button"
                            className="seller-action-btn seller-action-delete"
                            onClick={() => handleDelete(bId)}
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
