import { Link } from "react-router-dom";

export default function HowWeWorkSection() {
  const steps = [
    "Submit your requirements & get matched instantly",
    "Connect with verified, trusted suppliers",
    "Negotiate competitive prices on our secure platform",
    "Get your cattle delivered safely to your doorstep",
  ];

  const stats = [
    { icon: "🤝", num: "1500+", label: "Buyers & Sellers" },
    { icon: "🐄", num: "5,000+", label: "Products Listed" },
    { icon: "🏢", num: "2,000+", label: "Businesses Listed" },
    { icon: "⭐", num: "98%", label: "Quality Assured" },
  ];

  return (
    <section className="dm-section how-section">
      <div className="section-inner">
        <div className="how-section-inner">
          <div className="how-section-left">
            <span className="eyebrow">Platform Stats</span>
            <h2>How we work?</h2>
            <p>
              Sohani Mitra makes dairy animal trading seamless, transparent,
              and profitable. Whether you're a buyer or seller, our platform
              ensures the best match every time.
            </p>
            <ul
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {steps.map((s) => (
                <li
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: 14,
                    color: "var(--text)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--orange)",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>{" "}
                  {s}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 24 }}>
              <Link
                to="/free-listing"
                className="btn-orange"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 24px",
                  background: "var(--orange)",
                  color: "#fff",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Join Our Platform →
              </Link>
            </div>
          </div>
          <div className="how-section-right">
            <div className="how-grid-2x2">
              {stats.map((item) => (
                <div className="how-card-pro" key={item.label}>
                  <div className="how-card-icon">{item.icon}</div>
                  <strong>{item.num}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
