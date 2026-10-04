import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";
import CowCardList from "../CowCardList";

const SUPPLIERS = [
  {
    id: "s1",
    name: "Shree Krishna Dairy Farm",
    state: "Punjab",
    tags: "Cows • Buffaloes • Milk",
    avatar: "/assets/suppliers/shree_krishna.jpg",
    slug: "shree-krishna-dairy-farm",
  },
  {
    id: "s2",
    name: "Desi Gir Dairy Farm",
    state: "Gujarat",
    tags: "Gir Cows • A2 Milk • Calves",
    avatar: "/assets/suppliers/desi_gir.jpg",
    slug: "desi-gir-dairy-farm",
  },
  {
    id: "s3",
    name: "Murrah Star Dairy",
    state: "Haryana",
    tags: "Murrah Buffaloes • Semen • Feed",
    avatar: "/assets/suppliers/murrah_star.jpg",
    slug: "murrah-star-dairy",
  },
  {
    id: "s4",
    name: "Suresh Dairy Farm",
    state: "Uttar Pradesh",
    tags: "HF Cows • Heifers • Milk",
    avatar: "/assets/suppliers/suresh_dairy.jpg",
    slug: "suresh-dairy-farm",
  },
  {
    id: "s5",
    name: "Raj Dairy Products",
    state: "Maharashtra",
    tags: "Milk Products • Paneer • Ghee",
    avatar: "/assets/suppliers/raj_dairy.jpg",
    slug: "raj-dairy-products",
  },
  {
    id: "s6",
    name: "Green Feast Solutions",
    state: "Rajasthan",
    tags: "Fodder • Silage • Cattle Feed",
    avatar: "/assets/suppliers/green_feast.jpg",
    slug: "green-feast-solutions",
  },
  {
    id: "s7",
    name: "Shakti Dairy Equipments",
    state: "Punjab",
    tags: "Milking Machine • Chillers • Tanks",
    avatar: "/assets/suppliers/shakti_equip.jpg",
    slug: "shakti-dairy-equipments",
  },
  {
    id: "s8",
    name: "Anand Dairy Farm",
    state: "Madhya Pradesh",
    tags: "Cows • Buffaloes • Breeding",
    avatar: "/assets/suppliers/anand_dairy.jpg",
    slug: "anand-dairy-farm",
  },
  {
    id: "s9",
    name: "Kisan Nutrition",
    state: "Gujarat",
    tags: "Mineral Mix • Supplements • Feed",
    avatar: "/assets/suppliers/kisan_nutrition.jpg",
    slug: "kisan-nutrition",
  },
];

export default function SuppliersSection({ suppliers, sellers }) {
  const dynamicSuppliers =
    sellers && sellers.length > 0
      ? sellers.map((s) => ({
          id: s.id || s._id,
          name: s.business_name || s.name || "Dairy Farm",
          location: [s.city, s.state].filter(Boolean).join(", ") || "India",
          memberSince: s.createdAt
            ? new Date(s.createdAt).getFullYear()
            : "2023",
          ownerName: s.name || "Verified Seller",
          logo: getImageUrl(
            s.business_image || s.avatar,
            "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=150&q=80",
          ),
        }))
      : suppliers || SUPPLIERS;

  const displaySuppliers = dynamicSuppliers;

  return (
    <section className="pd-sellers-sec">
      <div className="pashu-container">
        <div className="pd-section-header">
          <span className="pd-section-tag">FEATURED SELLERS</span>
          <h2 className="pd-section-title">
            Connect with Trusted Suppliers Across India for Quality Animal
          </h2>
          <p className="pd-section-sub">
            Connect with India's top-rated dairy animal suppliers — verified,
            reviewed, and ready to serve.
          </p>
        </div>

        <CowCardList displaySuppliers={displaySuppliers} />

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link className="btn-orange" to="/pashu">
            View All Suppliers →
          </Link>
        </div>
      </div>
    </section>
  );
}
