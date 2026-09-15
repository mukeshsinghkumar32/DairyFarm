import { forwardRef, useImperativeHandle, useState } from "react";
import api from "../../api/client";

const Categories = forwardRef(function Categories({ categories, reload }, ref) {
  const [categoryForm, setCategoryForm] = useState(null);

  // Expose openAdd() so the Dashboard header button can trigger it
  useImperativeHandle(ref, () => ({
    openAdd: (count) =>
      setCategoryForm({
        name: "",
        description: "",
        sort_order: count + 1,
        status: true,
      }),
  }));

  const saveCategory = async (e) => {
    e.preventDefault();
    categoryForm.id
      ? await api.put(`/admin/categories/${categoryForm.id}`, categoryForm)
      : await api.post("/admin/categories", categoryForm);
    setCategoryForm(null);
    reload();
  };

  const removeCategory = async (id) => {
    if (confirm("Delete this category?")) {
      await api.delete(`/admin/categories/${id}`);
      reload();
    }
  };

  return (
    <>
      <div className="category-admin">
        {categories.map((c) => (
          <article key={c.id}>
             <i>🐄</i>
            <div>
             
              <h3>{c.name}</h3>
            
              <p className="product-description">{c.description}</p>
              <button onClick={() => setCategoryForm(c)}>✎</button>
              <button onClick={() => removeCategory(c.id)}>⌫</button>
            </div>
          </article>
        ))}
      </div>

      {categoryForm && (
        <div className="modal">
          <form onSubmit={saveCategory}>
            <header>
              <h2>{categoryForm.id ? "Edit" : "Add"} Category</h2>
              <button type="button" onClick={() => setCategoryForm(null)}>
                ×
              </button>
            </header>
            <label>
              Category name
              <input
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={categoryForm.description || ""}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
              />
            </label>
            <footer>
              <button type="button" onClick={() => setCategoryForm(null)}>
                Cancel
              </button>
              <button className="primary">Save Category</button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
});

export default Categories;
