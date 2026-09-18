import { Link } from "react-router-dom";
import SEO from "../../components/common/SEO";
const imageUrl = "/about/about_us.png";

export default function About() {
  return (
    <main>
      <SEO
        title="About Us — India's Most Trusted Dairy Animal Marketplace"
        description="Learn about Sohani Mitra and Sohani Dairy Farm. We empower farmers across India by connecting dairy cattle buyers and sellers directly with zero middlemen and verified livestock credentials."
        keywords="about Sohani dairy farm, dairy cattle platform India, cow marketplace, certified livestock breeders, Jaunpur dairy farm history"
      />
      {/* ── Page Hero Banner ──────────────────────────────── */}
      <div className="page-hero">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <span>About Us</span>
        </div>
        <h1>About Sohani Mitra</h1>
        <p>India's most trusted B2B dairy animal marketplace</p>
      </div>

      {/* ── Hero Banner Image ─────────────────────────────── */}

      {/* ── About Intro ───────────────────────────────────── */}
      <div className="about-intro">
        <div>
          <h2>About "Sohani Mitra"</h2>
          <p>
            Sohani Mitra set out to build a platform to empower dairy farmers by
            connecting <strong>buyers and sellers</strong> in the dairy farm
            cattle industry. Our platform helps in maximizing profits for
            producers by bridging the gap between buyer and seller while cutting
            out the middlemen.
          </p>
          <p>
            We strive to facilitate efficient transactions, foster growth and
            expand business opportunities for all our users. Also, we provide a
            user-friendly platform that not only connects users but also ensures
            they get the best deals that can enhance their businesses. If you
            have any questions regarding our services, our professional team
            will assist you ASAP.
          </p>

          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--dark)",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            Our Offered Services
          </h3>
          <ul className="about-list">
            <li>
              Sohani Mitra establishes a link between buyers &amp; sellers in
              the dairy farm cattle industry that creates a dynamic marketplace
              for smooth and easy dealings.
            </li>
            <li>
              Our commitment includes providing our users the best deals by
              providing a platform where they can negotiate and find competitive
              prices.
            </li>
            <li>
              Moreover at Sohani Mitra, businesses can broaden their market
              presence and get valuable partnerships within the dairy sector.
            </li>
          </ul>

          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--dark)",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            Why Choose Sohani Mitra?
          </h3>
          <p>
            We build the largest digital platform for cattle trading in India.
            We are working towards making dairy farming meaningfully profitable.
          </p>
          <ul className="about-list">
            <li>
              Our platform is user-friendly and designed for efficiency which
              makes it easy for users to navigate. Here, you can list your
              products as well as connect with potential buyers and sellers; our
              streamlined process saves your time &amp; effort while you focus
              on your business.
            </li>
            <li>
              You can get only secure and competitive prices by providing a
              pricing &amp; trustworthy environment for all types of dealings.
            </li>
            <li>
              As your reliable partner in the dairy sector, we ensure that you
              can get only secure &amp; trustworthy environment for all types of
              dealings. Also, you can trust us to protect your sensitive
              information and facilitate smooth and reliable deals every time.
            </li>
          </ul>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/free-listing"
              className="btn-orange"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "11px 24px",
                background: "var(--orange)",
                color: "#fff",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              📋 List Your Business Free
            </Link>
            <Link
              to="/contact-us"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "11px 24px",
                border: "2px solid var(--orange)",
                color: "var(--orange)",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              📞 Contact Us
            </Link>
          </div>
        </div>

        {/* Side visual */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="about-side-img">
            <img
              src={imageUrl}
              alt="Sohani Mitra businessman illustration"
              style={{ height: 280 }}
            />
          </div>
          {/* Stats */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {[
              { num: "1500+", label: "Buyers & Sellers" },
              { num: "2500+", label: "Customers Satisfied" },
              { num: "2000+", label: "Businesses Listed" },
              { num: "8+", label: "Years Experience" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--orange-light)",
                  border: "1.5px solid #ffd5a8",
                  borderRadius: 12,
                  padding: "16px 12px",
                  textAlign: "center",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--orange)",
                  }}
                >
                  {s.num}
                </strong>
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Buying & Selling Process ──────────────────────── */}
      <div className="about-process">
        <div className="about-process-inner">
          <h2>Buying and Selling process at Sohani Mitra</h2>
          <div className="process-cols">
            {/* Selling */}
            <div>
              <h3>🐄 Selling Livestock</h3>

              <div className="process-step-item">
                <h4>
                  <div className="step-num">1</div> List your cattle
                </h4>
                <ul>
                  <li>Create an account on Sohani Mitra</li>
                  <li>Make a list of the dairy animals you want to sell</li>
                  <li>Also, mention details like age, breed, health status</li>
                </ul>
              </div>

              <div className="process-step-item">
                <h4>
                  <div className="step-num">2</div> Verified Inquiries
                </h4>
                <ul>
                  <li>
                    Sohani Mitra carefully verifies every inquiry from buyers to
                    ensure its authenticity.
                  </li>
                </ul>
              </div>

              <div className="process-step-item">
                <h4>
                  <div className="step-num">3</div> Connect with buyers
                </h4>
                <ul>
                  <li>Your listing is forwarded to the appropriate buyers</li>
                  <li>
                    Now, you can expect to hear from interested parties soon.
                  </li>
                </ul>
              </div>
            </div>

            {/* Buying */}
            <div>
              <h3>🛒 Buying Livestock</h3>

              <div className="process-step-item">
                <h4>
                  <div className="step-num">1</div> Submit your requirements
                </h4>
                <ul>
                  <li>
                    Buyers can easily submit their requirements at the Sohani
                    Mitra platform; simply provide the details about breed type,
                    age, and quantity of cattle.
                  </li>
                </ul>
              </div>

              <div className="process-step-item">
                <h4>
                  <div className="step-num">2</div> Work with Verified Suppliers
                </h4>
                <ul>
                  <li>
                    Sohani Mitra works with only trusted farmers and suppliers
                    who can only provide only highest breed animals.
                  </li>
                </ul>
              </div>

              <div className="process-step-item">
                <h4>
                  <div className="step-num">3</div> Access Competitive Prices
                </h4>
                <ul>
                  <li>
                    By using the Sohani Mitra platform, buyers can get the
                    benefits of competitive prices, exclusive offers, and a wide
                    network.
                  </li>
                </ul>
              </div>

              <div className="process-step-item">
                <h4>
                  <div className="step-num">4</div> Easy Inquiry Process
                </h4>
                <ul>
                  <li>
                    Sohani Mitra has easy-to-follow steps to make buying cattle
                    simple: Just submit your requirements, get matched with
                    suppliers, and complete your process.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why choose us features ───────────────────────── */}
      <section className="dm-section" style={{ background: "var(--white)" }}>
        <div className="section-inner">
          <div className="section-head">
            <span className="eyebrow">Our Platform Benefits</span>
            <h2>Why should you choose Sohani Mitra?</h2>
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
                desc: "Include comprehensive details about your services and products to attract more buyers.",
              },
              {
                icon: "📢",
                title: "Increase Your Visibility",
                desc: "Boost your business presence with our extensive platform and marketing tools.",
              },
              {
                icon: "⭐",
                title: "Customer Reviews",
                desc: "Gain trust through ratings and reviews from your customers across India.",
              },
              {
                icon: "🆓",
                title: "Free and Easy",
                desc: "No cost to listing your business and simple steps to get started today.",
              },
              {
                icon: "📩",
                title: "Direct Inquiries",
                desc: "Receive inquiries directly from potential buyers and sellers without middlemen.",
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
    </main>
  );
}
