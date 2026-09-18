import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import StateCitySelect from "../../components/common/StateCitySelect";
import SEO from "../../components/common/SEO";
import "./Consultancy.css";

const imageUrl = "/about/Consultation.png";

const SERVICES = [
  {
    icon: "🐄",
    title: "Breed Selection Advice",
    desc: "Not sure which breed suits your farm? We assess your land size, available feed, housing, market and budget to recommend the ideal breed — whether that's HF, Sahiwal, Gir, Jersey or Murrah Buffalo.",
  },
  {
    icon: "🩺",
    title: "Health & Vaccination Planning",
    desc: "We create a customised vaccination and deworming calendar for your herd based on your region, season and breed. Prevent costly diseases before they occur with expert-guided preventive healthcare.",
  },
  {
    icon: "🌿",
    title: "Feed & Nutrition Optimisation",
    desc: "We audit your current feeding program and suggest balanced rations using locally available fodder, concentrates and mineral supplements to maximise milk yield without overspending on feed costs.",
  },
  {
    icon: "🏡",
    title: "Farm Setup & Housing Design",
    desc: "Starting a new dairy farm? We advise on shed orientation, flooring, drainage, ventilation and equipment selection to create a low-stress, hygienic environment that supports maximum productivity.",
  },
  {
    icon: "📊",
    title: "Milk Yield Improvement Audit",
    desc: "If your cow's production is below expectations, we diagnose the cause — whether feeding, health, stress or breed-specific issues — and give you a concrete action plan to restore or improve output.",
  },
  {
    icon: "🚛",
    title: "Cattle Purchase & Transport Support",
    desc: "We guide you through the entire cattle-buying process: shortlisting, health verification, price negotiation and safe transport. We accompany first-time buyers to ensure they don't get misled.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Submit Your Enquiry",
    desc: "Fill in the consultation form below with your farming situation — breed interest, herd size, location and key challenge.",
  },
  {
    num: "02",
    title: "Expert Consultation Call",
    desc: "Our senior farm advisor schedules a free 30-minute one-on-one call (or farm visit) to analyze your requirements in detail.",
  },
  {
    num: "03",
    title: "Personalised Action Plan",
    desc: "You receive a clear, practical roadmap — breed recommendations, feed ratio, health calendar, or cattle sourcing plan.",
  },
];

export default function Consultancy() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [consultState, setConsultState] = useState("");
  const [consultCity, setConsultCity] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(e.target));
      data.message = `[CONSULTANCY REQUEST] ${data.topic || "General"}: ${data.message}`;
      await api.post("/contact", data);
      setMsg("✓ Received! Our expert will call you within 24 hours.");
      setConsultState("");
      setConsultCity("");
      e.target.reset();
    } catch {
      setMsg(
        "Something went wrong. Please call us directly on +91 82081 27243.",
      );
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "918208127243";

  return (
    <main className="consult-main">
      <SEO
        title="Expert Dairy Farm Consultancy & Cattle Management Advice"
        description="Get free 1-on-1 dairy farm consultation on cattle breed selection, nutritional feeding ratios, disease prevention, milk yield optimization, and shed architecture from experienced livestock specialists."
        keywords="dairy farm consultancy India, cattle breeding advice, cow feed optimization, dairy shed design UP, milk yield improvement audit"
      />
      {/* 1. HERO */}
      <section className="consult-hero">
        <div className="consult-hero-container">
          <div className="consult-badge">
            <span>💡</span>
            <span>Expert Dairy Farm Consultancy</span>
          </div>
          <h1>
            Free Advice From Farmers
            <br />
            Who've Seen It All
          </h1>
          <p>
            8+ years of hands-on experience in breed selection, cattle health,
            farm shed setup and milk yield optimisation — 100% free for genuine
            farmers.
          </p>
          <div className="consult-hero-actions">
            <a href="#consult-form" className="btn-consult-primary">
              Book Free Consultation →
            </a>
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hello%2C%20I%20need%20farming%20consultancy.`}
              target="_blank"
              rel="noreferrer"
              className="btn-consult-outline"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* 2. INTRO 2-COLUMN */}
      <section className="consult-intro">
        <div className="consult-intro-container">
          <div>
            <p className="consult-eyebrow">Why Free Consultancy?</p>
            <h2>Because a well-informed farmer is a successful farmer</h2>
            <p>
              Most cattle sellers just want to make a sale. At Sohani Dairy
              Farm, we think differently. We've seen too many farmers make
              expensive mistakes — buying the wrong breed for their climate,
              overfeeding concentrates without balancing green fodder, or
              choosing cattle from unverified sources with inflated yield
              claims.
            </p>
            <p>
              Our free consultancy service exists because we believe a farmer
              who gets the right advice will succeed — and a successful farmer
              is our best partner. We've guided 200+ farmers through breed
              selection, herd health crises, and farm setup challenges. There is
              zero obligation to buy from us.
            </p>

            <div className="consult-intro-highlights">
              <div className="consult-highlight-item">
                <span>🎯</span>
                <div>
                  <strong>Region-Specific Advice</strong>
                  <small>
                    Tailored specifically to UP, Bihar, and North Indian
                    climate.
                  </small>
                </div>
              </div>
              <div className="consult-highlight-item">
                <span>📋</span>
                <div>
                  <strong>No Hidden Charges</strong>
                  <small>
                    100% free guidance. No commission or sales pressure.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="consult-intro-image-wrap">
            <img
              src={imageUrl}
              alt="Expert consultation at Sohani Dairy Farm"
            />
            <div className="consult-image-badge">
              <strong>🆓 100% Free Consultation</strong>
              <span>
                No obligation. No sales pressure. Just practical
                farmer-to-farmer advice.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROCESS STEPS */}
      <section className="consult-process">
        <div className="consult-section-header">
          <p className="consult-eyebrow">How It Works</p>
          <h2>3 Simple Steps to Expert Guidance</h2>
          <p>
            From inquiry to actionable advice — fast, straightforward, and
            completely free.
          </p>
        </div>

        <div className="consult-steps-grid">
          {STEPS.map((s) => (
            <div className="consult-step-card" key={s.num}>
              <div className="consult-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CONSULTANCY AREAS */}
      <section className="consult-services">
        <div className="consult-section-header">
          <p className="consult-eyebrow">Our Expertise</p>
          <h2>We Can Help You With</h2>
          <p>
            Choose an area where your farm needs guidance or discuss your
            overall dairy operations.
          </p>
        </div>

        <div className="consult-services-grid">
          {SERVICES.map((s) => (
            <div className="consult-service-card" key={s.title}>
              <div className="consult-service-icon">{s.icon}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BOOKING FORM */}
      <section className="consult-booking-section" id="consult-form">
        <div className="consult-booking-card">
          <div
            className="consult-section-header"
            style={{ marginBottom: "28px" }}
          >
            <p className="consult-eyebrow">Book A Session</p>
            <h2>Request a Free Consultation</h2>
            <p>
              Fill in your details and the challenge you're facing. Our senior
              farm advisor will call you within 24 hours to schedule your
              session.
            </p>
          </div>

          {msg && (
            <div
              className={`consult-form-msg ${msg.startsWith("✓") ? "success" : "error"}`}
            >
              {msg}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="consult-form-grid">
              <div className="consult-form-group">
                <label htmlFor="consult-name">Full Name *</label>
                <input
                  id="consult-name"
                  name="name"
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              <div className="consult-form-group">
                <label htmlFor="consult-phone">Phone Number *</label>
                <input
                  id="consult-phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <StateCitySelect
                selectedState={consultState}
                selectedCity={consultCity}
                onStateChange={setConsultState}
                onCityChange={setConsultCity}
                stateLabel="Your State"
                cityLabel="District / City"
                stateWrapClassName="consult-form-group"
                cityWrapClassName="consult-form-group"
                required={false}
              />

              <div className="consult-form-group">
                <label htmlFor="consult-topic">Consultation Topic *</label>
                <select id="consult-topic" name="topic" required>
                  <option value="">Select your topic</option>
                  <option>Breed Selection (HF, Sahiwal, Murrah)</option>
                  <option>Cattle Health & Disease Prevention</option>
                  <option>Milk Yield & Production Optimization</option>
                  <option>Feed, Fodder & Nutrition Ration</option>
                  <option>New Farm Setup & Shed Construction</option>
                  <option>Cattle Purchase & Transport Verification</option>
                  <option>Other Dairy Farm Query</option>
                </select>
              </div>

              <div className="consult-form-group full-width">
                <label htmlFor="consult-message">
                  Describe your farming situation *
                </label>
                <textarea
                  id="consult-message"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your farm — number of cattle, current challenges, what you are hoping to achieve..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="consult-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Submitting Request..."
                : "Request Free Consultation →"}
            </button>
          </form>

          <div className="consult-direct-contacts">
            <a
              className="btn-contact-whatsapp"
              href={`https://wa.me/${whatsappNumber}?text=Hello%2C%20I%20need%20farming%20consultancy.`}
              target="_blank"
              rel="noreferrer"
            >
              <span>💬</span>
              <span>WhatsApp Instead</span>
            </a>
            <a className="btn-contact-call" href="tel:+918208127243">
              <span>📞</span>
              <span>Call Directly: +91 82081 27243</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="consult-cta-banner">
        <div className="consult-cta-inner">
          <p className="consult-eyebrow" style={{ color: "#c8e96b" }}>
            Ready to Expand?
          </p>
          <h2>Browse Our Verified Cattle Listings</h2>
          <p>
            Explore our full range of health-certified, high-yield dairy cows
            and buffaloes — HF, Sahiwal, Gir, Jersey and Murrah Buffalo.
          </p>
          <div className="consult-cta-actions">
            <Link className="btn-consult-primary" to="/pashu">
              Explore Our Cattle →
            </Link>
            <Link className="btn-consult-outline" to="/why-us">
              Why Choose Sohani
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
