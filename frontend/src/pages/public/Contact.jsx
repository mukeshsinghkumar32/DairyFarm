import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import StateCitySelect from "../../components/common/StateCitySelect";
import SEO from "../../components/common/SEO";
import "./Contact.css";

export default function Contact() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactState, setContactState] = useState("");
  const [contactCity, setContactCity] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(e.target));
      await api.post("/contact", data);
      setMsg("✓ Thank you! We have received your enquiry and our team will contact you within 24 hours.");
      setContactState("");
      setContactCity("");
      e.target.reset();
    } catch {
      setMsg("Something went wrong. Please call us directly on +91 82081 27243.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <SEO
        title="Contact Us — Dairy Cattle Inquiries & Support"
        description="Get in touch with Sohani Dairy Farm. Inquire about pure breed cows, Murrah buffaloes, nationwide livestock transport, veterinary guidance, and partnership opportunities."
        keywords="contact Sohani dairy farm, dairy farm phone number, Jaunpur dairy contact, buy cow consultation, cattle transport help"
      />
      {/* ── PAGE HERO ────────────────────────────────────── */}
      <div className="contact-hero">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span>Contact Us</span>
        </div>
        <span className="contact-hero-eyebrow">GET IN TOUCH</span>
        <h1>We're Here to Help You Find the Right Cattle</h1>
        <p>
          Share your desired breed, milk yield requirements, and budget — our
          dairy cattle specialists will assist you immediately.
        </p>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="contact-container">
        <div className="contact-grid">
          {/* LEFT: Contact Details & Farm Info */}
          <div className="contact-info-col">
            <div className="contact-info-header">
              <div className="contact-eyebrow">OFFICIAL FARM DETAILS</div>
              <h2>Let's Talk Dairy Cattle</h2>
              <p>
                Whether you're a first-time dairy farmer or an experienced commercial
                breeder expanding your herd — our team is ready to guide you 7 days a week.
              </p>
            </div>

            <div className="contact-cards-list">
              <div className="contact-card-item">
                <div className="contact-card-icon">📞</div>
                <div className="contact-card-content">
                  <span className="contact-card-title">Phone & WhatsApp Hotline</span>
                  <strong className="contact-card-val">
                    <a href="tel:+918208127243">+91 82081 27243</a>
                  </strong>
                </div>
              </div>

              <div className="contact-card-item">
                <div className="contact-card-icon">📍</div>
                <div className="contact-card-content">
                  <span className="contact-card-title">Dairy Farm Address</span>
                  <strong className="contact-card-val">
                    Sohani Village, Kerakat Block, Jaunpur, Uttar Pradesh 222142
                  </strong>
                </div>
              </div>

              <div className="contact-card-item">
                <div className="contact-card-icon">✉️</div>
                <div className="contact-card-content">
                  <span className="contact-card-title">Email Support</span>
                  <strong className="contact-card-val">
                    <a href="mailto:info@sohanidairyfarm.com">info@sohanidairyfarm.com</a>
                  </strong>
                </div>
              </div>

              <div className="contact-card-item">
                <div className="contact-card-icon">⏰</div>
                <div className="contact-card-content">
                  <span className="contact-card-title">Visiting & Calling Hours</span>
                  <strong className="contact-card-val">Open 7 Days a Week: 7:00 AM – 7:00 PM</strong>
                </div>
              </div>
            </div>

            {/* Business Hours Table */}
            <div className="contact-hours-card">
              <div className="contact-hours-head">
                <span>🕒</span>
                <span>Farm Inspection & Visiting Schedule</span>
              </div>
              <table className="contact-hours-table">
                <tbody>
                  <tr>
                    <td className="contact-hours-day">Monday – Friday</td>
                    <td className="contact-hours-time">7:00 AM – 7:00 PM</td>
                    <td className="contact-hours-badge">● Open</td>
                  </tr>
                  <tr>
                    <td className="contact-hours-day">Saturday</td>
                    <td className="contact-hours-time">7:00 AM – 5:00 PM</td>
                    <td className="contact-hours-badge">● Open</td>
                  </tr>
                  <tr>
                    <td className="contact-hours-day">Sunday</td>
                    <td className="contact-hours-time">8:00 AM – 2:00 PM</td>
                    <td className="contact-hours-badge">● Open</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Direct Quick Action CTAs */}
            <div className="contact-quick-actions">
              <a
                className="contact-btn-wa"
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "918208127243"}?text=Hello%2C%20I%20want%20to%20enquire%20about%20dairy%20cattle.`}
                target="_blank"
                rel="noreferrer"
              >
                💬 WhatsApp Us
              </a>
              <a className="contact-btn-call" href="tel:+918208127243">
                📞 Call Directly
              </a>
            </div>
          </div>

          {/* RIGHT: Send Enquiry Form */}
          <div className="contact-form-card">
            <div className="contact-form-head">
              <h3>Send Us an Enquiry</h3>
              <p>
                Fill in your requirements and our team will get back to you with price
                quotes and live animal video clips within 24 hours.
              </p>
            </div>

            {msg && (
              <div
                className={`contact-form-msg ${
                  msg.startsWith("✓") ? "success" : "error"
                }`}
              >
                {msg}
              </div>
            )}

            <form onSubmit={submit} className="contact-form-fields">
              <div className="contact-form-row-2col">
                <div className="contact-field-group">
                  <label htmlFor="contact-name">Full Name *</label>
                  <input
                    id="contact-name"
                    name="name"
                    placeholder="e.g. Ramesh Kumar"
                    required
                  />
                </div>
                <div className="contact-field-group">
                  <label htmlFor="contact-phone">Mobile Number *</label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="contact-field-group">
                <label htmlFor="contact-email">Email Address (Optional)</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                />
              </div>

              <div className="contact-form-row-2col">
                <StateCitySelect
                  selectedState={contactState}
                  selectedCity={contactCity}
                  onStateChange={setContactState}
                  onCityChange={setContactCity}
                  stateLabel="Your State"
                  cityLabel="Your City / District"
                  stateWrapClassName="contact-field-group"
                  cityWrapClassName="contact-field-group"
                  required={false}
                />
              </div>

              <div className="contact-field-group">
                <label htmlFor="contact-breed">Preferred Breed / Cattle Type</label>
                <select id="contact-breed" name="breed">
                  <option value="">Select breed (optional)</option>
                  <option>HF (Holstein Friesian) Cow</option>
                  <option>Sahiwal Cow</option>
                  <option>Gir Cow</option>
                  <option>Murrah Buffalo</option>
                  <option>Jersey Cow</option>
                  <option>Crossbred High-Yield Cow</option>
                  <option>Not sure — need expert guidance</option>
                </select>
              </div>

              <div className="contact-field-group">
                <label htmlFor="contact-message">Your Requirements *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Describe your requirements — e.g. Looking for 2 HF Cows with 20+ litre daily milk yield, budget approx ₹70,000 each, delivery needed to Patna, Bihar..."
                  required
                />
              </div>

              <button
                className="contact-submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting Enquiry..." : "✈️ Send Enquiry Now"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── GOOGLE MAP & VISITING LOCATION SECTION ───────── */}
      <div className="contact-map-section">
        <div className="contact-map-icon">📍</div>
        <h3 className="contact-map-title">Sohani Dairy Farm — Kerakat, Jaunpur, UP</h3>
        <p className="contact-map-sub">
          Visit our verified breeding farm anytime between 7:00 AM – 7:00 PM, 7 days a week.
        </p>
        <a
          href="https://maps.google.com/?q=Sohani+Kerakat+Jaunpur+UP"
          target="_blank"
          rel="noreferrer"
          className="contact-map-btn"
        >
          🗺️ Open Directions in Google Maps →
        </a>
      </div>
    </main>
  );
}
