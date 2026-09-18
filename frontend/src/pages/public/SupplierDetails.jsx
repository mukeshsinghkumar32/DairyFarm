import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";
import { getImageUrl } from "../../utils/imageUrl";
import StateCitySelect from "../../components/common/StateCitySelect";
import SEO from "../../components/common/SEO";
import "./SupplierDetails.css";

function formatHtmlContent(raw) {
  if (!raw) return "";
  let text = String(raw);
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!/<(p|div|ul|ol|table|h[1-6]|blockquote)/i.test(text)) {
    text = text.replace(/\n/g, "<br />");
  } else {
    text = text.replace(/\n{2,}/g, "<br /><br />").replace(/\n/g, "<br />");
  }
  return text;
}

export default function SupplierDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);

  // Inquiry Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api
      .get(`/suppliers/${id}`)
      .then((res) => {
        setData(res.data.data);
      })
      .catch(() => {
        // Fallback to /seller/:id
        api
          .get(`/seller/${id}`)
          .then((res) => {
            setData(res.data.data);
          })
          .catch(() => setData(null));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const openInquiry = (product = null) => {
    setTargetProduct(product);
    setInquiryForm({
      name: "",
      phone: "",
      email: "",
      state: "",
      city: "",
      message: product
        ? `Hi, I am interested in inquiring about ${product.name}. Please contact me with more information.`
        : `Hi, I want to inquire about dairy cattle and services from ${
            data?.seller?.business_name || data?.seller?.name || "your farm"
          }.`,
    });
    setSubmitted(false);
    setModalOpen(true);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (
      !inquiryForm.name.trim() ||
      !inquiryForm.phone.trim() ||
      !inquiryForm.message.trim()
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/supplier-inquiries", {
        name: inquiryForm.name.trim(),
        phone: inquiryForm.phone.trim(),
        email: inquiryForm.email ? inquiryForm.email.trim() : "",
        state: inquiryForm.state ? inquiryForm.state.trim() : "",
        city: inquiryForm.city ? inquiryForm.city.trim() : "",
        message: inquiryForm.message.trim(),
        supplier_id: seller?._id || seller?.id || id,
        supplier_name:
          seller?.business_name || seller?.name || "Dairy Farm Partner",
        supplier_phone: seller?.phone || "",
        supplier_email: seller?.email || "",
        supplier_location: [seller?.city, seller?.state]
          .filter(Boolean)
          .join(", "),
        product_id: targetProduct?._id || targetProduct?.id || null,
        product_name: targetProduct?.name || "",
        page_url: window.location.href,
      });
      setSubmitted(true);
      setTimeout(() => {
        setModalOpen(false);
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      alert(
        "Failed to submit inquiry: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            border: "4px solid #e2e8f0",
            borderTopColor: "#ff7600",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#64748b", fontWeight: 600 }}>
          Loading supplier details...
        </p>
      </div>
    );
  }

  const seller = data?.seller;

  if (!seller) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <span style={{ fontSize: "52px" }}>🐄</span>
        <h2 style={{ color: "#0f172a", marginTop: "16px" }}>
          Supplier Not Found
        </h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          The requested dairy farm or supplier profile could not be located.
        </p>
        <Link
          to="/"
          style={{
            background: "#ff7600",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Return Home
        </Link>
      </div>
    );
  }

  const latestProducts = data?.latest_products || [];
  const moreProducts = data?.more_products || [];

  const bannerImg = getImageUrl(
    seller.banner_image,
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1000&q=85",
  );

  const logoImg = getImageUrl(
    seller.business_image || seller.avatar,
    "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=150&q=80",
  );

  const defaultDescription = `${
    seller.business_name || "Our Dairy Farm"
  } is one of the Dummy leading merchants and suppliers of dairy cows and buffaloes. We are a well-known farm that has been offering premium livestock cattle with high milk production capacity in both quantity and quality. Our healthy cattle breed consists of HF Cows, Sahiwal Cows, Sahiwal Bull, Murrah Buffaloes, Murrah Bull, Kankrej Cow, and many other breeds. We maintain a positive outlook towards excellence. With our creative ideas and techniques, we always try to do our best and deliver only healthy, fully vaccinated Buffaloes and Cows to customers from all over India to meet their diverse needs. Furthermore, we work with noted veterinarians who do periodic herd inspections to ensure the animals' health. At ${
    seller.business_name || "our farm"
  }, we serve small/marginal farmers, commercial businesses, and major dairy establishments.`;

  const farmName = seller.business_name || seller.name || "Dairy Farm Supplier";
  const farmLocation =
    [seller.city, seller.state].filter(Boolean).join(", ") || "India";
  const seoTitle = seller.business_name || seller.name || "Dairy Farm Supplier";
  const seoDesc = `Connect with ${farmName} in ${farmLocation}, a verified dairy cattle partner. Explore HF Cows, Sahiwal, Gir, and Murrah Buffaloes, view milk test records, and contact the farm directly.`;
  const seoKeywords = `Buy quality HF Cows, Sahiwal, Gir Cows,Cow, buffalo, Indian Murrah Buffalo, Buffalo Supplier in India, Murrah Buffalo Supplier, murrah breed buffalo, ${farmName}${seller.city ? `, ${seller.city}` : ""}${seller.state ? `, ${seller.state}` : ""}`;
  const supplierSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: farmName,
    image: logoImg,
    description:
      seller.about?.description || seller.description || defaultDescription,
    telephone: seller.phone || "+91-8853317611",
    email: seller.email || "",
    address: {
      "@type": "PostalAddress",
      streetAddress: seller.business_address || "",
      addressLocality: seller.city || "Jaunpur",
      addressRegion: seller.state || "Uttar Pradesh",
      postalCode: seller.pincode || "",
      addressCountry: "IN",
    },
  };

  return (
    <main className="sd-page">
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
        image={bannerImg || logoImg}
        type="business.business"
        schema={supplierSchema}
        exactTitle={true}
      />
      {/* Breadcrumb */}
      <nav className="sd-breadcrumb">
        <div className="sd-breadcrumb-inner">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/state-wise-company/All">Suppliers</Link>
          <span>›</span>
          <span className="bc-active">
            {seller.business_name || seller.name}
          </span>
        </div>
      </nav>

      <div className="sd-container">
        {/* 1. Top Hero Section */}
        <section className="sd-hero-grid">
          {/* Left: Cattle Herd Banner */}
          <div className="sd-hero-banner-wrap">
            <img
              src={bannerImg}
              alt={seller.business_name}
              className="sd-hero-banner"
            />
          </div>

          {/* Right: Supplier Details Card */}
          <div className="sd-hero-info">
            <div>
              <div className="sd-info-header">
                <div>
                  <h1 className="sd-farm-title">
                    {seller.business_name || "Sohani Dairy Farm"}
                  </h1>
                  <div className="sd-meta-line">
                    <span>Owner name : </span>
                    <b>{seller.name || "Dairy Owner"}</b>
                  </div>
                  <div className="sd-meta-line">
                    <span>
                      {seller.business_address ||
                        [seller.city, seller.state]
                          .filter(Boolean)
                          .join(", ") ||
                        "India"}
                    </span>
                  </div>
                </div>

                {/* Circular Farm Logo */}
                <img
                  src={logoImg}
                  alt={seller.business_name}
                  className="sd-farm-logo"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=150&q=80";
                  }}
                />
              </div>

              {/* Badge */}
              <div className="sd-badge-verified">
                <span>🛡️</span>
                <span>Premium Seller</span>
              </div>
            </div>

            {/* Actions */}
            <div className="sd-hero-actions">
              <button
                type="button"
                className="btn-sd-inquiry"
                onClick={() => openInquiry(null)}
              >
                <span>✈️</span>
                <span>Send Inquiry</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. Company Details Section(s) */}
        {Array.isArray(seller?.sellerAbout) && seller.sellerAbout.length > 0 ? (
          seller.sellerAbout.map((aboutItem, idx) => {
            const aboutImg = aboutItem.image
              ? getImageUrl(aboutItem.image)
              : "";
            const rawContent = aboutItem.content || defaultDescription;
            const cleanContent =
              typeof rawContent === "string" &&
              /<[a-z][\s\S]*>/i.test(rawContent)
                ? rawContent.replace(/<[^>]*>?/gm, "").trim()
                : rawContent;

            return (
              <section
                className="sd-company-section"
                key={aboutItem._id || aboutItem.id || idx}
                style={{
                  marginBottom:
                    idx < seller.sellerAbout.length - 1 ? "36px" : "48px",
                }}
              >
                <h2 className="sd-section-title">
                  {aboutItem.title || "Company Details"}
                </h2>
                <div className="sd-company-grid">
                  <div
                    className="sd-company-text"
                    dangerouslySetInnerHTML={{
                      __html: formatHtmlContent(
                        aboutItem.content || defaultDescription,
                      ),
                    }}
                  />

                  {/* Dynamic Image in each section or Farm Illustration Fallback */}
                  <div className="sd-company-graphic">
                    {aboutImg ? (
                      <div className="sd-company-photo-wrap">
                        <img
                          src={aboutImg}
                          alt={aboutItem.title || "Company Details"}
                          className="sd-company-photo"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display =
                                "block";
                            }
                          }}
                        />
                        <svg
                          viewBox="0 0 320 200"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="sd-farm-illustration"
                          style={{ display: "none" }}
                        >
                          <circle cx="270" cy="50" r="16" fill="#f59e0b" />
                          <path
                            d="M 20 180 C 140 90, 240 100, 310 130 C 270 195, 120 195, 20 180 Z"
                            fill="#4caf50"
                          />
                          <path
                            d="M 10 190 C 130 130, 260 140, 315 170 C 260 215, 80 215, 10 190 Z"
                            fill="#388e3c"
                          />
                          <g
                            fill="#452a1e"
                            transform="translate(60, 60) scale(0.65)"
                          >
                            <path d="M 50 80 Q 70 70 100 70 Q 150 65 180 75 Q 190 70 200 65 Q 210 50 205 40 Q 195 42 190 48 Q 185 30 200 25 Q 215 35 210 55 Q 220 60 215 75 Q 200 95 180 100 Q 170 115 175 130 Q 165 130 160 105 Q 120 110 90 105 Q 85 125 75 130 Q 70 120 75 95 Q 60 90 50 80 Z" />
                          </g>
                        </svg>
                      </div>
                    ) : (
                      <svg
                        viewBox="0 0 320 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="sd-farm-illustration"
                      >
                        <circle cx="270" cy="50" r="16" fill="#f59e0b" />
                        <path
                          d="M 20 180 C 140 90, 240 100, 310 130 C 270 195, 120 195, 20 180 Z"
                          fill="#4caf50"
                        />
                        <path
                          d="M 10 190 C 130 130, 260 140, 315 170 C 260 215, 80 215, 10 190 Z"
                          fill="#388e3c"
                        />
                        <g
                          fill="#452a1e"
                          transform="translate(60, 60) scale(0.65)"
                        >
                          <path d="M 50 80 Q 70 70 100 70 Q 150 65 180 75 Q 190 70 200 65 Q 210 50 205 40 Q 195 42 190 48 Q 185 30 200 25 Q 215 35 210 55 Q 220 60 215 75 Q 200 95 180 100 Q 170 115 175 130 Q 165 130 160 105 Q 120 110 90 105 Q 85 125 75 130 Q 70 120 75 95 Q 60 90 50 80 Z" />
                        </g>
                      </svg>
                    )}
                  </div>
                </div>
              </section>
            );
          })
        ) : (
          <section className="sd-company-section">
            <h2 className="sd-section-title">Company Details</h2>
            <div className="sd-company-grid">
              <div
                className="sd-company-text"
                dangerouslySetInnerHTML={{
                  __html: formatHtmlContent(
                    seller?.sellerAbout?.content || defaultDescription,
                  ),
                }}
              />

              {/* Dynamic Image from sellerAbout or Farm Illustration */}
              <div className="sd-company-graphic">
                {seller?.sellerAbout?.image ? (
                  <div className="sd-company-photo-wrap">
                    <img
                      src={getImageUrl(seller.sellerAbout.image)}
                      alt="Company Details"
                      className="sd-company-photo"
                    />
                  </div>
                ) : (
                  <svg
                    viewBox="0 0 320 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="sd-farm-illustration"
                  >
                    <circle cx="270" cy="50" r="16" fill="#f59e0b" />
                    <path
                      d="M 20 180 C 140 90, 240 100, 310 130 C 270 195, 120 195, 20 180 Z"
                      fill="#4caf50"
                    />
                    <path
                      d="M 10 190 C 130 130, 260 140, 315 170 C 260 215, 80 215, 10 190 Z"
                      fill="#388e3c"
                    />
                    <g fill="#452a1e" transform="translate(60, 60) scale(0.65)">
                      <path d="M 50 80 Q 70 70 100 70 Q 150 65 180 75 Q 190 70 200 65 Q 210 50 205 40 Q 195 42 190 48 Q 185 30 200 25 Q 215 35 210 55 Q 220 60 215 75 Q 200 95 180 100 Q 170 115 175 130 Q 165 130 160 105 Q 120 110 90 105 Q 85 125 75 130 Q 70 120 75 95 Q 60 90 50 80 Z" />
                    </g>
                  </svg>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 3. Latest Products Section */}
        {latestProducts.length > 0 && (
          <section className="sd-products-block">
            <h3 className="sd-block-heading">Latest Products</h3>
            <div className="sd-products-grid">
              {latestProducts.map((p) => {
                const pImg = getImageUrl(
                  p.featured_image,
                  "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80",
                );
                return (
                  <div className="sd-product-card" key={p._id || p.id}>
                    <Link
                      to={`/pashu/${p.slug || p._id || p.id}`}
                      className="sd-product-img-wrap"
                    >
                      <img src={pImg} alt={p.name} className="sd-product-img" />
                    </Link>
                    <div className="sd-product-info">
                      <Link
                        to={`/pashu/${p.slug || p._id || p.id}`}
                        className="sd-product-title"
                      >
                        {p.name}
                      </Link>
                      <button
                        type="button"
                        className="btn-card-inquiry"
                        onClick={() => openInquiry(p)}
                      >
                        <span>✈️</span>
                        <span>Send Inquiry</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. More Products from this Seller */}
        {moreProducts.length > 0 && (
          <section className="sd-products-block">
            <h3 className="sd-block-heading">More Products from this Seller</h3>
            <div className="sd-products-grid">
              {moreProducts.map((p) => {
                const pImg = getImageUrl(
                  p.featured_image,
                  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80",
                );
                return (
                  <div className="sd-product-card" key={p._id || p.id}>
                    <Link
                      to={`/pashu/${p.slug || p._id || p.id}`}
                      className="sd-product-img-wrap"
                    >
                      <img src={pImg} alt={p.name} className="sd-product-img" />
                    </Link>
                    <div className="sd-product-info">
                      <Link
                        to={`/pashu/${p.slug || p._id || p.id}`}
                        className="sd-product-title"
                      >
                        {p.name}
                      </Link>
                      <button
                        type="button"
                        className="btn-card-inquiry"
                        onClick={() => openInquiry(p)}
                      >
                        <span>✈️</span>
                        <span>Send Inquiry</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Inquiry Modal */}
      {modalOpen && (
        <div className="sd-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="sd-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="sd-modal-header">
              <h3>
                {targetProduct
                  ? `Inquire About ${targetProduct.name}`
                  : `Send Inquiry to ${seller.business_name || seller.name}`}
              </h3>
              <button
                type="button"
                className="sd-modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <span style={{ fontSize: "44px" }}>✅</span>
                <h4 style={{ color: "#166534", margin: "16px 0 8px" }}>
                  Inquiry Sent Successfully!
                </h4>
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  The seller will reach out to you shortly regarding your
                  inquiry.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit}>
                <div className="sd-modal-body">
                  <div className="sd-form-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={inquiryForm.name}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="sd-form-field">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={inquiryForm.phone}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="sd-form-grid-2col">
                    <StateCitySelect
                      selectedState={inquiryForm.state}
                      selectedCity={inquiryForm.city}
                      onStateChange={(val) =>
                        setInquiryForm((prev) => ({
                          ...prev,
                          state: val,
                          city: "",
                        }))
                      }
                      onCityChange={(val) =>
                        setInquiryForm((prev) => ({
                          ...prev,
                          city: val,
                        }))
                      }
                      stateLabel="State *"
                      cityLabel="City *"
                      stateWrapClassName="sd-form-field"
                      cityWrapClassName="sd-form-field"
                      required={true}
                    />
                  </div>
                  <div className="sd-form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@example.com"
                      value={inquiryForm.email}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="sd-form-field">
                    <label>Your Message / Requirements *</label>
                    <textarea
                      rows={3}
                      required
                      value={inquiryForm.message}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          message: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-card-inquiry"
                    disabled={submitting}
                    style={{ padding: "12px", fontSize: "14px" }}
                  >
                    {submitting
                      ? "Sending Inquiry..."
                      : "✈️ Submit Inquiry Now"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
