import { Link } from "react-router-dom";

const PREMIUM_SUPPLIES = [
  {
    id: "p1",
    name: "Shama Feed 50kg",
    price: 1350,
    unit: "Bag",
    rating: "4.9",
    reviews: 120,
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500&q=80",
    slug: "shama-feed-50kg",
    action: "Add to Cart",
  },
  {
    id: "p2",
    name: "Mineral Mixture",
    price: 650,
    unit: "Bag",
    rating: "4.7",
    reviews: 95,
    image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&q=80",
    slug: "mineral-mixture",
    action: "Add to Cart",
  },
  {
    id: "p3",
    name: "Milk Chiller 500L",
    price: 185000,
    unit: "Unit",
    rating: "4.8",
    reviews: 34,
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80",
    slug: "milk-chiller-500l",
    action: "Ask for Price",
  },
  {
    id: "p4",
    name: "Milking Machine",
    price: 45000,
    unit: "Unit",
    rating: "4.9",
    reviews: 110,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80",
    slug: "milking-machine",
    action: "Ask for Price",
  },
  {
    id: "p5",
    name: "Cattle Calcium",
    price: 1050,
    unit: "Pack",
    rating: "4.8",
    reviews: 75,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
    slug: "cattle-calcium",
    action: "Add to Cart",
  },
];

export default function FeaturedCattleSection() {
  return (
    <section className="pd-products-sec">
      <div className="pashu-container">
        <div className="pd-section-header">
          <span className="pd-section-tag">FEATURED PRODUCTS</span>
          <h2 className="pd-section-title">
            Premium Dairy Products &amp; Supplies
          </h2>
          <p className="pd-section-sub">
            Best quality products for healthy animals and profitable dairy farming.
          </p>
        </div>

        <div className="pd-products-grid">
          {PREMIUM_SUPPLIES.map((prod) => (
            <div key={prod.id} className="pd-product-card">
              <Link to={`/pashu?search=${encodeURIComponent(prod.name)}`} className="pd-product-thumb">
                <img
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                />
              </Link>
              <div className="pd-product-body">
                <Link to={`/pashu?search=${encodeURIComponent(prod.name)}`} style={{ textDecoration: "none" }}>
                  <h3 className="pd-product-title" title={prod.name}>
                    {prod.name}
                  </h3>
                </Link>
                <div className="pd-product-price">
                  ₹ {prod.price.toLocaleString("en-IN")}{" "}
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    / {prod.unit}
                  </span>
                </div>
                <div className="pd-product-rating">
                  <span className="pd-stars">★★★★★</span>
                  <span>
                    {prod.rating} ({prod.reviews})
                  </span>
                </div>
                <Link
                  to={`/contact-us?product=${encodeURIComponent(prod.name)}`}
                  className="pd-btn-product-action"
                >
                  {prod.action}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="pd-btn-center-wrap">
          <Link to="/pashu" className="pd-btn-view-all">
            View All Products &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
