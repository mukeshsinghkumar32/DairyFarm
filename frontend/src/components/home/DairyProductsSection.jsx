import { Link } from "react-router-dom";

const PURE_DAIRY_PRODUCTS = [
  {
    id: "dp1",
    name: "Fresh Cow Milk",
    price: 62,
    unit: "Liter",
    rating: "4.8",
    reviews: 320,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80",
  },
  {
    id: "dp2",
    name: "Buffalo Milk",
    price: 82,
    unit: "Liter",
    rating: "4.7",
    reviews: 280,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80",
  },
  {
    id: "dp3",
    name: "Paneer",
    price: 320,
    unit: "kg",
    rating: "4.9",
    reviews: 510,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80",
  },
  {
    id: "dp4",
    name: "Curd",
    price: 90,
    unit: "kg",
    rating: "4.8",
    reviews: 175,
    image: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=500&q=80",
  },
  {
    id: "dp5",
    name: "Ghee",
    price: 650,
    unit: "kg",
    rating: "4.9",
    reviews: 420,
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&q=80",
  },
];

export default function DairyProductsSection() {
  return (
    <section className="pd-dairy-sec">
      <div className="pashu-container">
        <div className="pd-section-header">
          <span className="pd-section-tag">DAIRY PRODUCTS</span>
          <h2 className="pd-section-title">
            Fresh Milk, Trusted Quality to Every Home
          </h2>
          <p className="pd-section-sub">
            Pure, Natural, Healthy. Get fresh milk and dairy products from verified
            sellers near you.
          </p>
        </div>

        <div className="pd-products-grid">
          {PURE_DAIRY_PRODUCTS.map((item) => (
            <div key={item.id} className="pd-product-card">
              <div className="pd-product-thumb">
                <img src={item.image} alt={item.name} loading="lazy" />
              </div>
              <div className="pd-product-body">
                <h3 className="pd-product-title" title={item.name}>
                  {item.name}
                </h3>
                <div className="pd-product-price">
                  ₹ {item.price}{" "}
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    / {item.unit}
                  </span>
                </div>
                <div className="pd-product-rating">
                  <span className="pd-stars">★★★★★</span>
                  <span>
                    {item.rating} ({item.reviews})
                  </span>
                </div>
                <Link
                  to={`/contact-us?product=${encodeURIComponent(item.name)}`}
                  className="pd-btn-product-action"
                >
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
