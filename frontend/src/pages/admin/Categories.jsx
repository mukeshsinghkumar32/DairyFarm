import { forwardRef, useImperativeHandle, useState } from "react";
import api from "../../api/client";
import { getImageUrl } from "../../utils/imageUrl";

const Categories = forwardRef(function Categories({ categories, reload }, ref) {
  const [categoryForm, setCategoryForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  // Expose openAdd() so the Dashboard header button can trigger it
  useImperativeHandle(ref, () => ({
    openAdd: (count) => {
      setImageFile(null);
      setPreviewUrl(null);
      setCategoryForm({
        name: "",
        description: "",
        sort_order: count + 1,
        status: true,
      });
    },
  }));

  const saveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryForm.name.trim());
      formData.append("description", categoryForm.description || "");
      formData.append(
        "sort_order",
        categoryForm.sort_order !== undefined ? categoryForm.sort_order : 0
      );
      formData.append("status", categoryForm.status ? "1" : "0");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (categoryForm.id) {
        await api.post(`/admin/categories/${categoryForm.id}`, formData, config);
      } else {
        await api.post("/admin/categories", formData, config);
      }
      setCategoryForm(null);
      setImageFile(null);
      setPreviewUrl(null);
      reload();
    } catch (err) {
      alert("Error saving category: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/admin/categories/${id}`);
        reload();
      } catch (err) {
        alert("Error deleting category: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const list = Array.isArray(categories)
    ? categories
    : Array.isArray(categories?.data)
    ? categories.data
    : [];

  return (
    <>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
            Breed Categories ({list.length})
          </h2>
          <small style={{ color: "#64748b" }}>
            Organize cattle into recognized breeds and categories
          </small>
        </div>
        <button
          type="button"
          className="admin-action-btn-primary"
          onClick={() => {
            setImageFile(null);
            setPreviewUrl(null);
            setCategoryForm({
              name: "",
              description: "",
              sort_order: list.length + 1,
              status: true,
            });
          }}
        >
          <span>＋</span>
          <span>Add Category</span>
        </button>
      </div>

      <div className="admin-categories-grid">
        {list.map((c) => (
          <div key={c.id} className="admin-category-card">
            <div className="admin-category-top">
              <div
                className="admin-category-icon"
                style={{
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  flexShrink: 0,
                }}
              >
                {c.image ? (
                  <img
                    src={getImageUrl(c.image)}
                    alt={c.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) e.target.nextSibling.style.display = "inline";
                    }}
                  />
                ) : null}
                <span style={{ display: c.image ? "none" : "inline", fontSize: "24px" }}>🐄</span>
              </div>
              <div className="admin-category-details">
                <h3>{c.name}</h3>
                <p>
                  {c.description || "High milk yielding indigenous cattle breed."}
                </p>
              </div>
            </div>

            <div className="admin-category-actions">
              <button
                type="button"
                className="admin-btn-icon-edit"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(c.image ? getImageUrl(c.image) : null);
                  setCategoryForm({ ...c });
                }}
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="admin-btn-icon-del"
                onClick={() => removeCategory(c.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {categoryForm && (
        <div className="admin-modal-overlay" onClick={() => !saving && setCategoryForm(null)}>
          <div
            className="admin-modal-window"
            style={{ maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>{categoryForm.id ? "Edit Category" : "Add Category"}</h2>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setCategoryForm(null)}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveCategory}>
              <div className="admin-modal-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="admin-form-field">
                    <label>Category / Breed Name *</label>
                    <input
                      value={categoryForm.name}
                      placeholder="e.g. Gir Cow or Murrah Buffalo"
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Image upload section */}
                  <div className="admin-form-field">
                    <label>Category / Breed Image</label>
                    {(previewUrl || categoryForm.image) && (
                      <div
                        style={{
                          marginBottom: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={previewUrl || getImageUrl(categoryForm.image)}
                          alt="Category Preview"
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1.5px solid #cbd5e1",
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          {imageFile ? "New Image Selected" : "Current Image"}
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setImageFile(file);
                          setPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>

                  <div className="admin-form-field">
                    <label>Description</label>
                    <textarea
                      placeholder="Brief overview of breed characteristics, native region, etc."
                      value={categoryForm.description || ""}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setCategoryForm(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
});

export default Categories;
