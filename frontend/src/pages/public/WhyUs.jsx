import { Link } from "react-router-dom";
import SEO from "../../components/common/SEO";

const FEATURES = [
  {
    icon: "🩺",
    title: "Veterinary Certified Health",
    desc: "Every animal at Sohani Dairy Farm is examined by a licensed veterinarian before listing. We maintain complete vaccination records, deworming history and health certificates that buyers can review before purchase. No sick animals ever leave our farm.",
  },
  {
    icon: "📊",
    title: "Transparent Milk-Yield Data",
    desc: "We record milk production for every cow daily and share honest lactation data — actual averages, not exaggerated estimates. You'll know exactly what yield to expect from day one, helping you plan your dairy business with confidence.",
  },
  {
    icon: "🌿",
    title: "Natural, Balanced Feeding",
    desc: "Our cattle are raised on a carefully balanced diet of green fodder, dry fodder, mineral supplements and clean water. We never use artificial hormones or growth stimulants. What you see is what the cow genuinely produces on a natural diet.",
  },
  {
    icon: "🏡",
    title: "Clean, Spacious Housing",
    desc: "Our cattle sheds are well-ventilated, regularly cleaned and designed to reduce stress. Comfortable housing directly impacts health, milk yield and temperament — our animals are calm, social and easy to manage on your farm.",
  },
  {
    icon: "🚛",
    title: "Safe Transport Across India",
    desc: "We arrange professional, stress-minimising transport for cattle across Uttar Pradesh, Bihar, Madhya Pradesh and beyond. Our drivers are experienced with livestock and ensure every animal arrives healthy and settled.",
  },
  {
    icon: "🤝",
    title: "Post-Purchase Support",
    desc: "Our relationship doesn't end at sale. We stay in touch with the farmers we serve — answering questions about feeding, healthcare, and breed management. If you ever have a concern, one call to us gets you expert guidance.",
  },
];

const STATS = [
  { number: "500+", label: "Cattle successfully rehomed" },
  { number: "200+", label: "Farming families served" },
  { number: "8+", label: "Years of trusted service" },
  { number: "15+", label: "Avg. litre milk yield per day" },
];

export default function WhyUs() {
  return (
    <main>
      <SEO
        title="Why Choose Sohani Dairy Farm — Certified Quality & Transparent Service"
        description="Discover why 200+ dairy farmers across India trust Sohani Dairy Farm: 100% veterinary certified health, transparent daily milk-yield data, natural feeding, and insured nationwide livestock transport."
        keywords="why choose Sohani dairy, verified cow breeders, transparent milk yield, safe cattle transport India, best dairy farm Uttar Pradesh"
      />
      {/* HERO BANNER */}
      <div className="page-head">
        <p>WHY SOHANI DAIRY FARM</p>
        <h1>The farm that puts<br />farmers first</h1>
        <span>
          In a market full of unverified sellers and inflated claims, we've
          built our reputation on one principle: complete transparency.
        </span>
      </div>

      {/* INTRO BAND */}
      <section style={{ background: "white", padding: "80px 5%" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <p className="eyebrow">OUR COMMITMENT</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 44, margin: "16px 0 22px", lineHeight: 1.15 }}>
            Buying cattle is a major investment.<br />You deserve complete honesty.
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.9 }}>
            Dairy farming in India is built on hard work, thin margins and long-term
            commitment. A single unhealthy cow — or one with overstated milk yield —
            can set a family back by months. That's why at Sohani Dairy Farm, we share
            every detail upfront: health records, real yield history, breed temperament,
            lactation stage, and honest pricing. No surprises, ever.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.9, marginTop: 16 }}>
            With 8+ years of service and 200+ farmers trusting us with repeat purchases,
            our record speaks for itself. We invite you to visit the farm, see our cattle
            in person, review all documentation, and make a fully informed decision.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="whyus-features">
        <div style={{ textAlign: "center" }}>
          <p className="eyebrow">6 REASONS TO CHOOSE US</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 46, margin: "16px 0" }}>
            What makes us different
          </h2>
        </div>
        <div className="whyus-grid">
          {FEATURES.map((f) => (
            <div className="whyus-card" key={f.title}>
              <div className="whyus-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="whyus-stats">
        <div style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ color: "rgba(200,233,107,.7)", justifyContent: "center" }}>THE NUMBERS</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 46, color: "white", margin: "16px 0" }}>
            Our record since 2016
          </h2>
        </div>
        <div className="whyus-stats-inner">
          {STATS.map((s) => (
            <div className="stat-item" key={s.label}>
              <strong>{s.number}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ padding: "90px 5%", background: "var(--cream)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <p className="eyebrow">SOHANI VS. OTHERS</p>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 44, margin: "16px 0" }}>
              See the difference clearly
            </h2>
          </div>
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--deep)", color: "white" }}>
                  <th style={{ padding: "18px 24px", textAlign: "left", fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>FEATURE</th>
                  <th style={{ padding: "18px 24px", textAlign: "center", fontSize: 12, letterSpacing: 2, fontWeight: 700, color: "var(--lime)" }}>SOHANI FARM</th>
                  <th style={{ padding: "18px 24px", textAlign: "center", fontSize: 12, letterSpacing: 2, fontWeight: 700, color: "#7a9e92" }}>TYPICAL SELLER</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Health certificates", "✅ Always provided", "❌ Rarely available"],
                  ["Actual milk yield records", "✅ Documented daily", "❌ Verbal claims only"],
                  ["Vaccination history", "✅ Complete records", "❌ Often incomplete"],
                  ["Post-sale support", "✅ Always available", "❌ No support after sale"],
                  ["Transport arrangement", "✅ Professional, insured", "❌ Buyer's responsibility"],
                  ["Farm visit allowed", "✅ Open to all buyers", "❌ Often restricted"],
                ].map(([feat, us, them], i) => (
                  <tr key={feat} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "white" : "var(--card-bg)" }}>
                    <td style={{ padding: "16px 24px", fontWeight: 600, fontSize: 14 }}>{feat}</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 14, color: "var(--green)", fontWeight: 600 }}>{us}</td>
                    <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 14, color: "var(--muted)" }}>{them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <p className="eyebrow" style={{ color: "rgba(200,233,107,.7)", justifyContent: "center" }}>READY TO START?</p>
        <h2>Come visit the farm today</h2>
        <p>See our cattle in person, review all health records, and make a fully informed purchase. No pressure, ever.</p>
        <div className="cta-banner-actions">
          <Link className="primary" to="/contact-us">Book a Farm Visit →</Link>
          <Link className="outline" to="/consultancy">Get Free Consultancy</Link>
        </div>
      </section>
    </main>
  );
}
