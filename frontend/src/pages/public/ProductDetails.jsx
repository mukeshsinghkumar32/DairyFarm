import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";
import { getImageUrl } from "../../utils/imageUrl";
import StateCitySelect from "../../components/common/StateCitySelect";
import SEO from "../../components/common/SEO";
import "./ProductDetails.css";
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
function formatHtmlDescription(raw) {
  if (!raw) return "";
  let text = String(raw);
  // Normalize Windows/Mac newlines
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Convert newlines to <br /> if no block-level tags, or preserve spacing
  if (!/<(p|div|ul|ol|table|h[1-6]|blockquote)/i.test(text)) {
    text = text.replace(/\n/g, "<br />");
  } else {
    text = text.replace(/\n{2,}/g, "<br /><br />").replace(/\n/g, "<br />");
  }
  return text;
}

export default function ProductDetails() {
  const { slug } = useParams();
  const [cow, setCow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    message: "",
  });
  const [formSent, setFormSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setFormSent(false);

    api
      .get(`/pashu/${slug}`)
      .then((r) => {
        setCow(r.data.data);
        if (r.data.data) {
          setForm((prev) => ({
            ...prev,
            message: `Hi, I am interested in ${r.data.data.name}. Please share more details and best price quote.`,
          }));
        }
      })
      .catch(() => setCow(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    setSubmitting(true);
    try {
      const seller = cow?.seller_id || null;
      const sellerName =
        seller?.business_name ||
        seller?.name ||
        cow?.owner_name ||
        "Sohani Dairy Farm";
      const sellerPhone = seller?.phone || cow?.phone || "+91 82081 27243";

      await api.post("/enquiries", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email ? form.email.trim() : "",
        state: form.state ? form.state.trim() : "",
        city: form.city ? form.city.trim() : "",
        message: form.message ? form.message.trim() : "",
        product_id: cow?._id || cow?.id || null,
        product_name: cow?.name || "Dairy Cattle",
        product_price: cow?.price || 0,
        seller_id: seller?._id || seller?.id || null,
        seller_name: seller?.name || sellerName,
        farm_name: seller?.business_name || cow?.company || sellerName,
        seller_phone: sellerPhone,
        inquiry_type: "product_price_inquiry",
      });

      setFormSent(true);
      setTimeout(() => setFormSent(false), 8000);
    } catch (err) {
      alert(
        "Error sending inquiry: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "120px 20px", textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: "4px solid #e2e8f0",
            borderTopColor: "#ff7600",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#64748b", fontWeight: 700, fontSize: "16px" }}>
          Loading cattle specifications...
        </p>
      </div>
    );
  }

  if (!cow) {
    return (
      <div style={{ padding: "120px 20px", textAlign: "center" }}>
        <span style={{ fontSize: "56px" }}>🐄</span>
        <h2 style={{ color: "#0f172a", marginTop: "16px", fontSize: "24px" }}>
          Cattle Listing Not Found
        </h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          The requested cattle animal is either sold or no longer available.
        </p>
        <Link
          to="/pashu"
          style={{
            background: "#ff7600",
            color: "#ffffff",
            padding: "12px 26px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: 800,
            display: "inline-block",
          }}
        >
          Browse All Available Cattle
        </Link>
      </div>
    );
  }

  const imgSrc = getImageUrl(
    cow.featured_image,
    "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=85",
  );

  const seller = cow.seller_id || null;
  const sellerName =
    seller?.business_name ||
    seller?.name ||
    cow.owner_name ||
    "Sohani Dairy Farm";
  const sellerLocation = seller?.city
    ? `${seller.city}${seller.state ? `, ${seller.state}` : ""}`
    : cow.location || "India";
  const sellerPhone = seller?.phone || cow.phone || "+91 82081 27243";
  const sellerId = slugify(seller?.business_name);

  const waText = encodeURIComponent(
    `Hi, I am interested in ${cow.name} listed on Sohani Dairy Mitra. Please share more photos, lactation history and best price.`,
  );
  const waNumber =
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    sellerPhone.replace(/[^0-9]/g, "") ||
    "918208127243";

  // Quick summary overview specs (for top hero right side)
  const quickSpecs = [
    {
      label: "Product Type",
      value: cow.category?.name ? `${cow.category.name}` : "Dairy Cattle",
    },
    {
      label: "Breed",
      value: cow.breed || cow.category?.name || "Indigenous Desi",
    },
    {
      label: "Milk Yield",
      value:
        cow.milk_capacity_min && cow.milk_capacity_max
          ? `${cow.milk_capacity_min}–${cow.milk_capacity_max} Litres/Day`
          : cow.milk_capacity_min || cow.milk_capacity_max
            ? `${cow.milk_capacity_min || cow.milk_capacity_max} L/Day`
            : "18–22 Litres/Day",
      highlight: true,
    },
    { label: "Age", value: cow.age ? `${cow.age} Years` : "3.5 Years" },
    {
      label: "Lactation Stage",
      value: cow.lactation ? `${cow.lactation} Lactation` : "2nd Lactation",
    },
    {
      label: "Pregnancy Status",
      value: cow.pregnancy_status || "Not pregnant",
    },
    {
      label: "Body Weight",
      value: cow.weight
        ? cow.weight.toString().toLowerCase().includes("kg")
          ? cow.weight
          : `${cow.weight} kg`
        : "420–480 kg",
    },
    { label: "Color / Coat", value: cow.color || "Standard Breed Coat" },
    { label: "Gender", value: cow.gender || "Female Milker" },
    {
      label: "Animal Location",
      value: cow.location || sellerLocation || "Jaunpur, UP",
    },
  ];

  // Comprehensive Product Specifications table
  const fullSpecs = [
    { label: "Animal Name / Breed", value: cow.name },
    { label: "Category", value: cow.category?.name || "Dairy Cattle" },
    {
      label: "Daily Milk Capacity",
      value:
        cow.milk_capacity_min && cow.milk_capacity_max
          ? `${cow.milk_capacity_min}–${cow.milk_capacity_max} Litres/Day (Recorded Fat 4.5% - 5.2%)`
          : "18–22 Litres / Day",
    },
    {
      label: "Age of Animal",
      value: cow.age ? `${cow.age} Years` : "Adult (3–4 Years)",
    },
    {
      label: "Lactation Stage",
      value: cow.lactation ? `${cow.lactation} Lactation` : "2nd Calving",
    },
    {
      label: "Pregnancy / Gestation",
      value:
        cow.pregnancy_status || "Not pregnant (Ready for breeding / milking)",
    },
    {
      label: "Gender",
      value: cow.gender || "Female Milker (High Genetic Potential)",
    },
    {
      label: "Estimated Body Weight",
      value: cow.weight
        ? cow.weight.toString().toLowerCase().includes("kg")
          ? cow.weight
          : `${cow.weight} kg`
        : "440–490 Kilograms (kg)",
    },
    {
      label: "Coat Color & Horns",
      value:
        cow.color || "Healthy standard coat, symmetric horns & clean udder",
    },
    {
      label: "Vaccination & Health",
      value: "100% Fully Vaccinated (FMD, HS, Black Quarter) & Dewormed",
    },
    {
      label: "Udder & Teat Structure",
      value:
        "Four balanced, leak-proof functional teats with strong milk veins",
    },
    {
      label: "Temperament",
      value: "Docile, easy to handle & hand/machine milk compliant",
    },
  ];

  // Trade & Commercial Information table
  const tradeInfo = [
    { label: "Minimum Order Quantity", value: "1 Piece / Animal" },
    {
      label: "Supply Ability",
      value: "50+ Pieces / Month across Verified Partner Network",
    },
    {
      label: "Price Term",
      value:
        cow.show_price && cow.price
          ? `₹${Number(cow.price).toLocaleString("en-IN")} (Negotiable on Bulk & Spot Booking)`
          : "Price on Request / Call for Wholesale Farm Quote",
    },
    {
      label: "Delivery / Transit Time",
      value: cow.delivery_time || "2–4 Days Pan-India Express Transit",
    },
    {
      label: "Transit Logistics Care",
      value:
        "Specialized ventilated cattle trucks with bedding & fodder on route",
    },
    {
      label: "Payment Options",
      value: "UPI, NEFT / RTGS, Bank Transfer, Spot Cash at Farm Loading",
    },
    {
      label: "Certifications Available",
      value: "Veterinary Health Fitness Certificate & Ownership Transfer Slip",
    },
    {
      label: "Main Domestic Markets",
      value:
        "Uttar Pradesh, Haryana, Punjab, Gujarat, Maharashtra, Rajasthan, Pan-India",
    },
  ];

  // FAQs for this Cattle
  const faqs = [
    {
      q: `What is the daily milk yield recorded for this ${cow.breed || cow.category?.name || "cattle"}?`,
      a: `Under standard balanced feed and green fodder management, this animal yields ${
        cow.milk_capacity_min && cow.milk_capacity_max
          ? `${cow.milk_capacity_min} to ${cow.milk_capacity_max}`
          : "18 to 22"
      } Litres per day with rich SNF and fat content.`,
    },
    {
      q: "Is doorstep transportation available for inter-state delivery?",
      a: "Yes. Verified transport partners provide safe, insured doorstep transit across all states in India with certified transit health passes.",
    },
    {
      q: "Can I inspect the animal and perform a milk test before buying?",
      a: "Absolutely. Buyers can visit the farm in person to conduct 2–3 time spot milking tests, udder inspection, and veterinary health check prior to payment.",
    },
    {
      q: "What is the vaccination and deworming schedule?",
      a: "The animal is certified fully vaccinated against Foot and Mouth Disease (FMD) and Hemorrhagic Septicemia (HS), and regularly dewormed.",
    },
  ];

  const defaultDescription = `We take pride in offering healthy, high-yield ${
    cow.category?.name || cow.breed || "Dairy"
  } cattle directly from verified breeding farms. This animal is known for high adaptability, strong disease resistance, and consistent high-volume milk production. Periodically examined by certified veterinary officers and tested for optimal fat and protein yield. Ideal for progressive commercial dairy farming and sustainable home milk production.`;

  const scrollToInquiry = () => {
    const el = document.getElementById("pdr-inquiry-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const seoTitle = cow.name;
  const seoDesc = `Buy a ${cow.name} available at ${sellerName}, ${sellerLocation}. Explore its ${cow.milk_capacity_min && cow.milk_capacity_max ? `${cow.milk_capacity_min}-${cow.milk_capacity_max} L/Day milk yield` : `${cow.milk_capacity_max || 18} L/Day milk yield`},  ${cow.age || 3.5}-Years-age,Heavy Breed: ${cow.breed || cow.category?.name || "Pure Breed"}. ${cow.price ? `Priced at ₹${Number(cow.price).toLocaleString("en-IN")}` : "Contact for direct price quote"}.`;
  const seoKeywords = `cow, buffalo, Indian Murrah Buffalo, Buffalo Supplier in India, Murrah Buffalo Supplier, murrah breed buffalo ,Hf Cow Trade In India Supplier, Trader in India, ${cow.name}${cow.breed ? `, ${cow.breed}` : ""}`;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: cow.name,
    image: [imgSrc],
    description: cow.short_description || cow.description || seoDesc,
    sku: String(cow._id || cow.id || slug),
    brand: {
      "@type": "Brand",
      name: sellerName,
    },
    offers: {
      "@type": "Offer",
      url:
        typeof window !== "undefined"
          ? window.location.href
          : `https://sohanidairy.com/pashu/${slug}`,
      priceCurrency: "INR",
      price: cow.price ? String(cow.price) : "0",
      priceValidUntil: "2027-12-31",
      availability:
        cow.availability === "sold"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: sellerName,
      },
    },
  };

  return (
    <main className="pdr-page">
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
        image={imgSrc}
        type="product"
        schema={productSchema}
        exactTitle={true}
      />
      {/* ─── BREADCRUMB ────────────────────────────────────────────── */}
      <nav className="pdr-breadcrumb">
        <div className="pdr-breadcrumb-inner">
          <Link to="/">Home</Link>
          <span className="bc-sep">›</span>
          <Link to="/pashu">All Cattle</Link>
          {cow.category?.name && (
            <>
              <span className="bc-sep">›</span>
              <Link to={`/pashu/category/${cow.category.slug}`}>
                {cow.category.name}
              </Link>
            </>
          )}
          <span className="bc-sep">›</span>
          <span className="bc-active">{cow.name}</span>
        </div>
      </nav>

      <div className="pdr-container">
        {/* ─── TOP SHOWCASE: LEFT (Image, Seller & Contact) + RIGHT (Title, Price, Overview) ── */}
        <div className="pdr-top-showcase">
          {/* ─── LEFT COLUMN: Main Photo Showcase + Verified Seller Card + Direct CTAs ─ */}
          <div className="pdr-left-col">
            <div className="pdr-main-image-wrap">
              <span className="pdr-badge-featured">
                <span>⭐</span>
                <span>FEATURED LIVESTOCK</span>
              </span>
              <img src={imgSrc} alt={cow.name} className="pdr-main-image" />
            </div>

            {/* Farm / Seller Card */}
            <div className="pdr-seller-card">
              <div className="pdr-seller-left">
                {seller?.business_image || seller?.avatar ? (
                  <img
                    src={getImageUrl(seller.business_image || seller.avatar)}
                    alt={sellerName}
                    className="pdr-seller-avatar"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className="pdr-seller-avatar-fallback"
                  style={{
                    display:
                      seller?.business_image || seller?.avatar
                        ? "none"
                        : "flex",
                  }}
                >
                  {sellerName.charAt(0).toUpperCase()}
                </div>

                <div className="pdr-seller-meta">
                  <h4>{sellerName}</h4>
                  <span>📍 {sellerLocation}</span>
                  <span className="pdr-seller-verified-badge">
                    ✓ Verified Partner
                  </span>
                </div>
              </div>

              {sellerId && (
                <Link
                  to={`/supplier/${sellerId}`}
                  className="pdr-btn-view-seller"
                >
                  View Farm ➔
                </Link>
              )}
            </div>

            {/* Direct Calling & WhatsApp Actions */}
            <div className="pdr-direct-actions">
              <button
                type="button"
                className="pdr-btn-primary-inquire"
                onClick={scrollToInquiry}
              >
                <span>✉️</span>
                <span>Send Best Price Inquiry</span>
              </button>

              <a
                className="pdr-btn-whatsapp"
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.054 1.477 5.765L.054 23.25l5.636-1.479A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.882 9.882 0 01-5.031-1.375l-.361-.214-3.741.981.999-3.648-.235-.374A9.863 9.863 0 012.115 12C2.115 6.529 6.529 2.115 12 2.115S21.885 6.529 21.885 12 17.471 21.885 12 21.885z" />
                </svg>
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Header, Pricing, Key Product Highlights & Inquire CTA ─ */}
          <div className="pdr-right-col">
            {/* Header Block */}
            <div className="pdr-header-block">
              <div className="pdr-top-tags">
                {cow.category?.name && (
                  <Link
                    to={`/pashu/category/${cow.category.slug}`}
                    className="pdr-category-badge"
                  >
                    {cow.category.name}
                  </Link>
                )}
                <span className="pdr-location-badge">📍 {sellerLocation}</span>
                <span className="pdr-status-badge">
                  {cow.availability === "available" || !cow.availability
                    ? "✓ In Stock & Available"
                    : cow.availability}
                </span>
              </div>

              <h1 className="pdr-title">{cow.name}</h1>

              {/* Price Row */}
              <div className="pdr-price-container">
                {cow.show_price && cow.price ? (
                  <div className="pdr-price-left">
                    <span className="pdr-price-amount">
                      ₹{Number(cow.price).toLocaleString("en-IN")}
                    </span>
                    <span className="pdr-price-unit">/ Piece</span>
                    <span className="pdr-price-tag">✓ Best Market Price</span>
                  </div>
                ) : (
                  <div className="pdr-price-left">
                    <span className="pdr-price-on-request">
                      Price on Request
                    </span>
                    <span className="pdr-price-tag">⚡ Call for Quote</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Overview Table (B2B Style) */}
            <div className="pdr-overview-card">
              <div className="pdr-overview-header">
                <span className="pdr-overview-title">
                  Key Product Highlights
                </span>
                <span className="pdr-overview-sub">100% Certified Data</span>
              </div>
              <div className="pdr-overview-table">
                {quickSpecs.map((item, idx) => (
                  <div className="pdr-overview-row" key={idx}>
                    <span className="pdr-overview-label">{item.label}</span>
                    <span
                      className={`pdr-overview-value ${
                        item.highlight ? "pdr-value-highlight" : ""
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Inquiry Triggers */}
          </div>
        </div>

        {/* ─── SECTION 2: B2B PRODUCT SPECIFICATIONS & TRADE INFORMATION TABLES ─ */}
        <div className="pdr-b2b-specs-section">
          <div className="pdr-b2b-specs-card">
            <div className="pdr-b2b-header">
              <div className="pdr-b2b-title-group">
                <span className="pdr-b2b-badge">OFFICIAL SPECIFICATIONS</span>
                <h2 className="pdr-b2b-title">
                  {cow.name} — Technical Specifications
                </h2>
              </div>
              <span className="pdr-b2b-verified-tag">
                ✓ Verified Livestock Parameters
              </span>
            </div>

            <div className="pdr-b2b-table-wrap">
              <table className="pdr-b2b-table">
                <tbody>
                  {fullSpecs.map((spec, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "pdr-tr-even" : "pdr-tr-odd"}
                    >
                      <td className="pdr-td-label">{spec.label}</td>
                      <td className="pdr-td-value">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trade & Commercial Terms Table */}
          <div className="pdr-b2b-specs-card pdr-trade-card">
            <div className="pdr-b2b-header">
              <div className="pdr-b2b-title-group">
                <span className="pdr-b2b-badge pdr-badge-blue">
                  TRADE & LOGISTICS
                </span>
                <h3 className="pdr-b2b-title">
                  {cow.name} — Trade & Supply Terms
                </h3>
              </div>
              <span className="pdr-b2b-verified-tag">
                🚚 Pan-India Delivery Available
              </span>
            </div>

            <div className="pdr-b2b-table-wrap">
              <table className="pdr-b2b-table">
                <tbody>
                  {tradeInfo.map((info, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "pdr-tr-even" : "pdr-tr-odd"}
                    >
                      <td className="pdr-td-label">{info.label}</td>
                      <td className="pdr-td-value">{info.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: ABOUT THIS CATTLE & FAQ ───────────────────────── */}
        <div className="pdr-bottom-fullwidth">
          {/* Full-Width "About This Cattle" */}
          <section className="pdr-about-section">
            <h2 className="pdr-section-heading">
              About This Cattle & Breed Characteristics
            </h2>
            <div
              className="pdr-about-content"
              dangerouslySetInnerHTML={{
                __html: formatHtmlDescription(
                  cow.description ||
                    cow.short_description ||
                    defaultDescription,
                ),
              }}
            />

            {/* Certified Health Highlights */}
            <div className="pdr-health-pillars">
              <div className="pdr-pillar-item">
                <div className="pdr-pillar-icon">💉</div>
                <div className="pdr-pillar-text">
                  <h5>100% Vaccinated</h5>
                  <p>Up to date with FMD, HS, and Black Quarter doses</p>
                </div>
              </div>

              <div className="pdr-pillar-item">
                <div className="pdr-pillar-icon">🩺</div>
                <div className="pdr-pillar-text">
                  <h5>Veterinary Verified</h5>
                  <p>
                    Certified healthy udder, strong milk veins & reproductive
                    health
                  </p>
                </div>
              </div>

              <div className="pdr-pillar-item">
                <div className="pdr-pillar-icon">🥛</div>
                <div className="pdr-pillar-text">
                  <h5>Tested High Fat Milk</h5>
                  <p>High quality daily milk yield recorded with 4.5%+ fat</p>
                </div>
              </div>

              <div className="pdr-pillar-item">
                <div className="pdr-pillar-icon">🚚</div>
                <div className="pdr-pillar-text">
                  <h5>Pan-India Safe Transit</h5>
                  <p>Certified transit support directly to your dairy farm</p>
                </div>
              </div>
            </div>

            {/* Cattle Buyer FAQs */}
            <div className="pdr-faq-box">
              <h3 className="pdr-faq-heading">
                Frequently Asked Questions (FAQs)
              </h3>
              <div className="pdr-faq-list">
                {faqs.map((f, idx) => (
                  <div className="pdr-faq-item" key={idx}>
                    <div className="pdr-faq-q">
                      <b>Q: {f.q}</b>
                    </div>
                    <div className="pdr-faq-a">
                      <p>
                        <b>Ans:</b> {f.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── SECTION 4: REQUIREMENT / LEAD FORM (Like Reference) ───────── */}
          <section className="pdr-inquiry-box-full" id="pdr-inquiry-section">
            <div className="pdr-inquiry-box-header">
              <span className="pdr-req-badge">FAST RESPONSE</span>
              <h2 className="pdr-req-title">
                Tell us about your requirement for {cow.name}
              </h2>
              <p className="pdr-req-subtitle">
                Get direct quotation, video clips, and transportation estimate
                from the seller
              </p>
            </div>

            {formSent ? (
              <div className="pdr-inquiry-success">
                <span style={{ fontSize: "32px" }}>🎉</span>
                <h3>Your Requirement Has Been Sent to {sellerName}!</h3>
                <p>
                  The seller will call or WhatsApp you shortly with the best
                  quote and livestock videos.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquiry} className="pdr-req-form">
                <div className="pdr-req-preview-card">
                  <img
                    src={imgSrc}
                    alt={cow.name}
                    className="pdr-req-mini-img"
                  />
                  <div className="pdr-req-mini-info">
                    <b>{cow.name}</b>
                    <span>
                      {cow.show_price && cow.price
                        ? `₹${Number(cow.price).toLocaleString("en-IN")}`
                        : "Price on Request"}{" "}
                      • 📍 {sellerLocation}
                    </span>
                  </div>
                </div>

                <div className="pdr-req-grid">
                  <div className="pdr-req-field">
                    <label>Your Full Name *</label>
                    <input
                      type="text"
                      className="pdr-req-input"
                      placeholder="Enter your name"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="pdr-req-field">
                    <label>Mobile Number (WhatsApp) *</label>
                    <div className="pdr-req-phone-wrap">
                      <span className="pdr-req-prefix">🇮🇳 +91</span>
                      <input
                        type="tel"
                        className="pdr-req-input"
                        placeholder="10-digit mobile number"
                        required
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            phone: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pdr-req-grid">
                  <StateCitySelect
                    selectedState={form.state}
                    selectedCity={form.city}
                    onStateChange={(st) =>
                      setForm((prev) => ({ ...prev, state: st, city: "" }))
                    }
                    onCityChange={(ct) =>
                      setForm((prev) => ({ ...prev, city: ct }))
                    }
                    stateLabel="Your State *"
                    cityLabel="Your City / District *"
                    stateWrapClassName="pdr-req-field"
                    cityWrapClassName="pdr-req-field"
                    stateClassName="pdr-req-input"
                    cityClassName="pdr-req-input"
                    required={false}
                  />
                </div>

                <div className="pdr-req-field">
                  <label>Email Address (Optional)</label>
                  <input
                    type="email"
                    className="pdr-req-input"
                    placeholder="e.g. ramesh@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="pdr-req-field">
                  <label>Additional Requirement / Questions *</label>
                  <textarea
                    rows={3}
                    className="pdr-req-textarea"
                    placeholder="E.g. Please share recent milking video, health pass, and delivery charges to my location..."
                    required
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="pdr-btn-submit-req"
                  disabled={submitting}
                >
                  {submitting
                    ? "Sending Requirement..."
                    : "Submit Requirement & Get Best Price →"}
                </button>
              </form>
            )}
          </section>

          {/* Full-Width Buyer Trust Banner */}
          <section className="pdr-trust-banner">
            <div className="pdr-trust-item">
              <h4>🛡️ 100% Verified Sellers</h4>
              <p>
                Direct authentic dairy farmers & commercial breeders across
                India.
              </p>
            </div>
            <div className="pdr-trust-item">
              <h4>💰 Direct Transparent Pricing</h4>
              <p>Zero middlemen charges with transparent negotiable quotes.</p>
            </div>
            <div className="pdr-trust-item">
              <h4>🩺 Health Inspection</h4>
              <p>
                Full health checkup and milk test report assistance prior to
                delivery.
              </p>
            </div>
            <div className="pdr-trust-item">
              <h4>🚛 Doorstep Transport Support</h4>
              <p>
                Safe animal vehicle logistics support with transit insurance
                guidance.
              </p>
            </div>
          </section>

          {/* Related Cattle Section */}
          {cow.related_products && cow.related_products.length > 0 && (
            <section className="pdr-related-section">
              <h2 className="pdr-section-heading">
                Similar Cattle You May Like in {cow.category?.name || "Dairy"}{" "}
                Category
              </h2>
              <div className="pdr-related-grid">
                {cow.related_products.map((r) => {
                  const rImg = getImageUrl(
                    r.featured_image,
                    "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80",
                  );
                  return (
                    <Link
                      to={`/pashu/${r.slug || r._id || r.id}`}
                      className="pdr-related-card"
                      key={r._id || r.id}
                    >
                      <div className="pdr-related-img-wrap">
                        <img
                          src={rImg}
                          alt={r.name}
                          className="pdr-related-img"
                        />
                      </div>
                      <div className="pdr-related-info">
                        <span className="pdr-related-name">{r.name}</span>
                        <span className="pdr-related-milk">
                          🥛{" "}
                          {r.milk_capacity_min && r.milk_capacity_max
                            ? `${r.milk_capacity_min}–${r.milk_capacity_max} L/day`
                            : "High Yielding Breed"}
                        </span>
                        <span className="pdr-related-price">
                          {r.show_price && r.price
                            ? `₹${Number(r.price).toLocaleString("en-IN")}`
                            : "Price on Request"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
