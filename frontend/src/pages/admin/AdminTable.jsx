const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api/v1", "")
  : "http://localhost:8000";

const COW_PLACEHOLDER =
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80";

function productImg(featured_image) {
  if (!featured_image) return COW_PLACEHOLDER;
  // featured_image is already a relative path like /uploads/products/xxx.jpg
  if (featured_image.startsWith("http")) return featured_image;
  return `${BACKEND_URL}${featured_image}`;
}

export default function AdminTable({
  products,
  edit,
  remove,
  readOnly = false,
}) {
  return (
    <div className="admin-table">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Cattle</th>
            <th>Category</th>
            <th>Milk</th>
            <th>Price</th>
            <th>Status</th>
            {!readOnly && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan={6}>No products found</td>
            </tr>
          )}
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <img
                  className="cow-img-thumb"
                  src={productImg(p.featured_image)}
                  alt=""
                />
              </td>
              <td>
                <b>{p.name}</b>
                <br />
                <small style={{ fontSize: 11, color: "black" }}>
                  {p.location}
                </small>
              </td>
              <td>{p.category?.name}</td>
              <td>
                {p.milk_capacity_min}–{p.milk_capacity_max} L
              </td>
              <td>₹{Number(p.price).toLocaleString("en-IN")}</td>
              <td>
                <span className={`status ${p.availability}`}>
                  {p.availability}
                </span>
              </td>
              {!readOnly && (
                <td>
                  <button onClick={() => edit(p)}>✎</button>
                  <button onClick={() => remove(p.id)}>⌫</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
