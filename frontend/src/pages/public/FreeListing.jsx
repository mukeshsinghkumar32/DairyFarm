import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/common/SEO";

export default function FreeListing() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    business: "",
    category: "",
  });
  const [msg, setMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg(
      "🎉 Success! Your free listing request has been submitted. Our team will contact you within 24 hours.",
    );
    setForm({ name: "", phone: "", business: "", category: "" });
  };

  return (
    <main>
      <SEO
        title="Free Dairy Farm & Cattle Listing — Reach Thousands of Buyers"
        description="List your dairy farm and cattle animals on Sohani Mitra for 100% free. Gain nationwide visibility, direct buyer inquiries on WhatsApp, and boost cattle sales."
        keywords="free dairy listing, list cow for sale free, dairy farm registration, sell cow online India, dairy cattle suppliers directory"
      />
      {/* ── Page Hero ──────────────────────────────────────── */}
      <div className="page-hero">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Free Listing</span>
        </div>
        <h1>Free Business Listing</h1>
        <p>List your dairy business for free and reach thousands of buyers</p>
      </div>

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="fl-hero">
        <div className="fl-hero-inner">
          <div>
            <h1>
              Increase Your Reach in the Dairy Industry –<br />
              <em>List Your Business on Sohani Mitra for Free!</em>
            </h1>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--dark)",
                marginBottom: 16,
              }}
            >
              Features of Our Platform
            </h2>
            <ul className="fl-features">
              <li>Comprehensive Business Profiles.</li>
              <li>Help buyers and sellers boost your business quickly.</li>
              <li>Connect with New Customers &amp; Grow Your Business.</li>
              <li>Verified listing with detailed breed information.</li>
              <li>Direct inquiries from interested buyers nationwide.</li>
            </ul>
            <div style={{ marginTop: 24 }}>
              <a
                href="#get-listed"
                className="btn-orange"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 28px",
                  background: "var(--orange)",
                  color: "#fff",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                📋 Get Listed Now — It's Free!
              </a>
            </div>
          </div>
          <div className="fl-stat-bubbles">
            <div className="fl-stat-bubble">
              <strong>1500+</strong>
              <span>Buyers &amp; Sellers Served</span>
            </div>
            <div className="fl-stat-bubble">
              <strong>2500+</strong>
              <span>Customers Satisfied</span>
            </div>
            <div className="fl-stat-bubble">
              <strong>2000+</strong>
              <span>Businesses Listed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Simple Steps ────────────────────────────────── */}
      <section className="dm-section steps-section">
        <div className="section-inner">
          <div className="section-head">
            <span className="eyebrow">Simple Process</span>
            <h2>We will get a FREE Business Listing in 3 Simple Steps!</h2>
          </div>
          <div className="steps-grid">
            {[
              {
                icon: "📱",
                num: "01",
                title: "Create your Account",
                desc: "Enter your phone number to begin. Quick registration in under a minute.",
              },
              {
                icon: "🏢",
                num: "02",
                title: "Provide Business Information",
                desc: "Input the name, location, and operating hours, and upload photos of your business.",
              },
              {
                icon: "🗂️",
                num: "03",
                title: "Choose Categories",
                desc: "Select the appropriate categories for your complimentary listing page.",
              },
            ].map((step) => (
              <div className="step-card" key={step.num}>
                <div className="step-icon-wrap">{step.icon}</div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: "var(--orange)",
                    color: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    margin: "0 auto 12px",
                  }}
                >
                  {step.num}
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why List ──────────────────────────────────────── */}
      <section className="dm-section why-list-section">
        <div className="section-inner">
          <div className="section-head">
            <span className="eyebrow">Platform Benefits</span>
            <h2>Why should you List Your Business on Sohani Mitra?</h2>
          </div>
          <div className="why-list-grid">
            {[
              {
                icon: "🎯",
                title: "Reach a Wider Audience",
                desc: "Connect with thousands of potential buyers and sellers in the livestock industry",
              },
              {
                icon: "📋",
                title: "Detailed Listings",
                desc: "Include comprehensive details about your services and products.",
              },
              {
                icon: "📢",
                title: "Increase Your Visibility",
                desc: "Boost your business presence with our extensive platform.",
              },
              {
                icon: "⭐",
                title: "Customer Reviews",
                desc: "Gain trust through ratings and reviews from your customers.",
              },
              {
                icon: "🆓",
                title: "Free and Easy",
                desc: "No cost to listing your business and simple steps to get started.",
              },
              {
                icon: "📩",
                title: "Direct Inquiries",
                desc: "Receive inquiries directly from potential buyers and sellers.",
              },
            ].map((item) => (
              <div className="why-list-item" key={item.title}>
                <div className="why-list-icon">{item.icon}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get Listed Form ───────────────────────────────── */}
      <section
        id="get-listed"
        className="dm-section"
        style={{ background: "var(--orange-light)" }}
      >
        <div className="section-inner" style={{ maxWidth: 600 }}>
          <div className="section-head">
            <span className="eyebrow">Start Today</span>
            <h2>Submit Your Free Listing</h2>
            <p>
              Fill in your details and our team will create your business
              profile within 24 hours.
            </p>
          </div>
          {msg ? (
            <div
              style={{
                background: "#e8f5e4",
                border: "2px solid var(--green)",
                borderRadius: 12,
                padding: "24px",
                textAlign: "center",
                fontSize: 15,
                color: "var(--green)",
                fontWeight: 600,
              }}
            >
              {msg}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: "var(--white)",
                borderRadius: 16,
                padding: 28,
                boxShadow: "var(--shadow-md)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  placeholder="Your farm / business name"
                  value={form.business}
                  onChange={(e) =>
                    setForm({ ...form, business: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Select a category</option>
                  <option>HF Cow</option>
                  <option>Gir Cow</option>
                  <option>Sahiwal Cow</option>
                  <option>Jersey Cow</option>
                  <option>Murrah Buffalo</option>
                  <option>Tharparkar Cow</option>
                  <option>Other</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn-send"
                style={{ marginTop: 4 }}
              >
                Submit Free Listing →
              </button>
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--text-light)",
                }}
              >
                🔒 Your information is 100% secure and private.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
