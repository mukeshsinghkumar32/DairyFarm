import { forwardRef, useImperativeHandle, useState } from "react";
import api from "../../api/client";
import AdminTable from "./AdminTable";

const empty = {
  name: "",
  category_id: "",
  price: "",
  milk_capacity_min: "",
  milk_capacity_max: "",
  age: "",
  lactation: "",
  pregnancy_status: "Not pregnant",
  location: "Sohani, Jaunpur",
  availability: "available",
  show_price: true,
  featured: false,
  status: true,
  short_description: "",
  description: "",
  quantity: 1,
};

const Products = forwardRef(function Products(
  { products, categories, reload },
  ref,
) {
  const [form, setForm] = useState(null);

  // Expose openAdd() so the Dashboard header button can trigger it
  useImperativeHandle(ref, () => ({
    openAdd: () => setForm(empty),
  }));

  const saveProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    if (form.featured_image instanceof File) {
      fd.append("featured_image", form.featured_image);
    }
    Object.entries(form).forEach(([k, v]) => {
      if (k === "featured_image" && v instanceof File) return; // already appended
      fd.append(k, v === true ? "1" : v === false ? "0" : (v ?? ""));
    });
    if (form.id) {
      fd.append("_method", "PUT");
      await api.post(`/admin/products/${form.id}`, fd);
    } else {
      await api.post("/admin/products", fd);
    }
    setForm(null);
    reload();
  };

  const remove = async (id) => {
    if (confirm("Delete this listing?")) {
      await api.delete(`/admin/products/${id}`);
      reload();
    }
  };

  return (
    <>
      <AdminTable products={products} edit={setForm} remove={remove} />

      {form && (
        <div className="modal">
          <form onSubmit={saveProduct}>
            <header>
              <h2>{form.id ? "Edit" : "Add"} Cow Listing</h2>
              <button type="button" onClick={() => setForm(null)}>
                ×
              </button>
            </header>
            <div className="form-grid">
              <label>
                Cow name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Category
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Price
                <input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label>
                Milk min
                <input
                  type="number"
                  value={form.milk_capacity_min || ""}
                  onChange={(e) =>
                    setForm({ ...form, milk_capacity_min: e.target.value })
                  }
                />
              </label>
              <label>
                Milk max
                <input
                  type="number"
                  value={form.milk_capacity_max || ""}
                  onChange={(e) =>
                    setForm({ ...form, milk_capacity_max: e.target.value })
                  }
                />
              </label>
              <label>
                Age
                <input
                  type="number"
                  step=".1"
                  value={form.age || ""}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </label>
              <label>
                Lactation
                <input
                  value={form.lactation || ""}
                  onChange={(e) =>
                    setForm({ ...form, lactation: e.target.value })
                  }
                />
              </label>
              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </label>
              <label>
                Availability
                <select
                  value={form.availability}
                  onChange={(e) =>
                    setForm({ ...form, availability: e.target.value })
                  }
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </label>
              <label>
                Featured image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, featured_image: e.target.files[0] })
                  }
                />
              </label>
              <label className="wide">
                Description
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
            </div>
            <footer>
              <button type="button" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button className="primary">Save Listing</button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
});

export default Products;
