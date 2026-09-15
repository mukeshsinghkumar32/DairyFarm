import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
export default function ProductDetails() {
  const { slug } = useParams();
  const [cow, setCow] = useState(null);
  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => setCow(r.data.data));
  }, [slug]);
  if (!cow) return <div className="loading">Loading...</div>;
  return (
    <main className="details">
      <img
        src={
          cow.featured_image
            ? `${import.meta.env.VITE_STORAGE_URL}/${cow.featured_image}`
            : "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=85"
        }
        alt={cow.name}
      />
      <div>
        <p className="eyebrow">{cow.category?.name}</p>
        <h1>{cow.name}</h1>
        <h2>
          {cow.show_price
            ? `₹${Number(cow.price).toLocaleString("en-IN")}`
            : "Price on request"}
        </h2>
        <p>{cow.description || cow.short_description}</p>
        <div className="detail-specs">
          <span>
            <small>Milk capacity</small>
            <b>
              {cow.milk_capacity_min}–{cow.milk_capacity_max} L/day
            </b>
          </span>
          <span>
            <small>Age</small>
            <b>{cow.age} years</b>
          </span>
          <span>
            <small>Lactation</small>
            <b>{cow.lactation}</b>
          </span>
          <span>
            <small>Pregnancy</small>
            <b>{cow.pregnancy_status}</b>
          </span>
        </div>
        <a
          className="primary"
          href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(`I am interested in ${cow.name}`)}`}
        >
          WhatsApp Enquiry
        </a>
      </div>
    </main>
  );
}
