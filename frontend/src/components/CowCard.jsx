import { Link } from "react-router-dom";
export default function CowCard({ cow }) {
  const img = cow.featured_image
    ? `${import.meta.env.VITE_STORAGE_URL}/${cow.featured_image}`
    : "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80";
  return (
    <Link to={`/products/${cow.slug}`}>
      <article className="cow-card">
        <div className="cow-img">
          <img src={img} alt={cow.name} />
          {cow.featured && <em>FEATURED</em>}
          <span>{cow.availability}</span>
        </div>
        <div className="cow-info">
          <small>{cow.category?.name}</small>
          <h3>{cow.name}</h3>
          <div className="specs">
            <p>
              <span>MILK</span>
              <b>
                {cow.milk_capacity_min}–{cow.milk_capacity_max} L/day
              </b>
            </p>
            <p>
              <span>AGE</span>
              <b>{cow.age || "-"} years</b>
            </p>
            <p>
              <span>LACTATION</span>
              <b>{cow.lactation || "-"}</b>
            </p>
            <p>
              <span>LOCATION</span>
              <b>{cow.location}</b>
            </p>
          </div>
          <div className="card-foot">
            <b>
              {cow.show_price
                ? `₹${Number(cow.price).toLocaleString("en-IN")}`
                : "Price on request"}
            </b>
            <Link to={`/products/${cow.slug}`} className="admin-btn">
              View & Enquire →
            </Link>
          </div>
        </div>
      </article>
    </Link>
  );
}
