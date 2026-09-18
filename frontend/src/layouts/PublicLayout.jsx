import { useEffect, useState, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../api/client";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import LanguageSelector from "../components/common/LanguageSelector";
import AutoRequirementModal from "../components/common/AutoRequirementModal";
import { getImageUrl } from "../utils/imageUrl";
import { useOutletContext } from "react-router-dom";
export default function PublicLayout() {
  const outletCtx = useOutletContext();
  const outletCats = outletCtx?.categories || [];
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [enquiry, setEnquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [enquiryMsg, setEnquiryMsg] = useState("");

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState({
    products: [],
    sellers: [],
    tags: [],
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Debounced live AI search suggestions
  useEffect(() => {
    if (!outletCats || outletCats.length === 0) {
      api
        .get("/categories")
        .then((c) => setCategories(c.data.data || []))
        .catch(() => {});
    }
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchSuggestions({ products: [], sellers: [], tags: [] });
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      api
        .get("/search/suggestions", { params: { q: searchQuery.trim() } })
        .then((res) => {
          if (res.data?.success) {
            setSearchSuggestions(
              res.data.data || { products: [], sellers: [], tags: [] },
            );
            setIsSearchOpen(true);
          }
        })
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    const reqText = (enquiry.requirement || enquiry.message || "").trim();
    if (!enquiry.name.trim() || !enquiry.phone.trim() || !reqText) {
      return;
    }
    try {
      await api.post("/requirements", {
        name: enquiry.name.trim(),
        phone: enquiry.phone.trim(),
        email: enquiry.email ? enquiry.email.trim() : "",
        requirement: reqText,
      });
      setEnquiryMsg("Thank you! We'll get back to you soon.");
      setEnquiry({ name: "", email: "", phone: "", message: "", requirement: "" });
      setTimeout(() => setEnquiryMsg(""), 4000);
    } catch (err) {
      console.error("Failed to submit requirement:", err);
    }
  };

  return (
    <>
      {/* ── TOP ANNOUNCEMENT BAR — with background image ─── */}
      <div className="topbar">
        <div className="topbar-left">
          <span>🏆 India's No.1 B2B Dairy Marketplace</span>
          <span>📞 +91 82081 27243</span>
          <span>⏰ Mon–Sun: 7am – 7pm</span>
        </div>
        <div className="topbar-right">
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.7)",
              borderRight: "1px solid rgba(255,255,255,.2)",
              paddingRight: 14,
              marginRight: 6,
            }}
          >
            1500+ Verified Sellers
          </span>
          <div className="topbar-social">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="social-fb"
            >
              <FaFacebookF size={22} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="social-tw"
            >
              <FaXTwitter size={22} />
            </a>

            <a
              href="https://instagram.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-ig"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://wa.me/918208127243"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="social-wa"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* ── STICKY HEADER ────────────────────────────────── */}
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="header-main">
          {/* Logo */}
          <Link className="site-logo" to="/">
            <div className="logo-icon">🐄</div>
            <div className="logo-text">
              <b>SOHANI MITRA</b>
              <small>B2B DAIRY MARKETPLACE</small>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav">
            <LanguageSelector />
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about-us">About Us</NavLink>
            <NavLink to="/pashu">Buy Pashu</NavLink>
            <NavLink to="/advertise">Advertise</NavLink>
            <NavLink to="/free-listing">Free Listing</NavLink>
            <NavLink to="/blogs">Blogs</NavLink>
            <NavLink to="/consultancy">Consultancy</NavLink>
            <Link
              to="/seller/login"
              className="btn-signin"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff" }}
            >
              Company Login
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* ── SEARCH SUB-BAR ──────────────────────────────── */}
      <div className="search-bar-wrap">
        <div className="search-bar-inner">
          <div className="search-tagline">
            Find the Right <em>Breeding Cattle for Your Farm</em>
          </div>
          <div className="search-form-container" ref={searchRef}>
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="What are you looking for... (e.g. Murrah, 20 L milk, Karnal, 132001)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit(e);
                }}
              />
              <button type="submit" aria-label="Search" title="AI Search">
                🔍
              </button>
            </form>

            {/* AI Live Autocomplete Dropdown */}
            {isSearchOpen && (
              <div className="ai-dropdown-menu">
                <div className="ai-dropdown-header">
                  <span>🤖 AI Search Results</span>
                  {searchSuggestions.tags &&
                    searchSuggestions.tags.length > 0 && (
                      <div className="ai-dropdown-header-tags">
                        {searchSuggestions.tags.slice(0, 3).map((t, i) => (
                          <span key={i} className="ai-dropdown-header-tag">
                            {t.label}
                          </span>
                        ))}
                      </div>
                    )}
                </div>

                {/* Products Group */}
                {searchSuggestions.products &&
                  searchSuggestions.products.length > 0 && (
                    <div className="ai-dropdown-group">
                      <div className="ai-dropdown-group-title">
                        🐄 Cattle & Products
                      </div>
                      {searchSuggestions.products.map((p) => {
                        const pImg = getImageUrl(
                          p.featured_image,
                          "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=100&q=80",
                        );
                        const pSlug = p.slug || p._id;
                        const yieldText =
                          p.milk_capacity_min && p.milk_capacity_max
                            ? `${p.milk_capacity_min}-${p.milk_capacity_max} L`
                            : p.breed || "Cattle";

                        return (
                          <div
                            key={p._id}
                            className="ai-dropdown-item"
                            onClick={() => {
                              setIsSearchOpen(false);
                              navigate(`/pashu/${pSlug}`);
                            }}
                          >
                            <img
                              src={pImg}
                              alt={p.name}
                              className="ai-dropdown-thumb"
                            />
                            <div className="ai-dropdown-info">
                              <div className="ai-dropdown-item-title">
                                {p.name}
                              </div>
                              <div className="ai-dropdown-item-sub">
                                {p.breed || "Cattle"} • {yieldText} • 📍{" "}
                                {p.location || "India"}
                              </div>
                            </div>
                            {p.price ? (
                              <div className="ai-dropdown-price">
                                ₹{Number(p.price).toLocaleString("en-IN")}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}

                {/* Sellers Group */}
                {searchSuggestions.sellers &&
                  searchSuggestions.sellers.length > 0 && (
                    <div className="ai-dropdown-group">
                      <div className="ai-dropdown-group-title">
                        🏢 Dairy Farms & Sellers
                      </div>
                      {searchSuggestions.sellers.map((s) => {
                        const sImg = getImageUrl(
                          s.business_image || s.avatar,
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
                        );
                        const sLink = `/supplier/${s._id || s.username}`;
                        const loc =
                          [s.city, s.state].filter(Boolean).join(", ") ||
                          "India";

                        return (
                          <div
                            key={s._id}
                            className="ai-dropdown-item"
                            onClick={() => {
                              setIsSearchOpen(false);
                              navigate(sLink);
                            }}
                          >
                            <img
                              src={sImg}
                              alt={s.business_name}
                              className="ai-dropdown-thumb"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80";
                              }}
                            />
                            <div className="ai-dropdown-info">
                              <div className="ai-dropdown-item-title">
                                {s.business_name || s.name}
                              </div>
                              <div className="ai-dropdown-item-sub">
                                👤 {s.name} • 📍 {loc}{" "}
                                {s.pincode ? `(${s.pincode})` : ""}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                {/* Dropdown Footer */}
                <div className="ai-dropdown-footer">
                  <button
                    type="button"
                    className="ai-dropdown-all-btn"
                    style={{
                      background: "none",
                      border: "none",
                      width: "100%",
                      cursor: "pointer",
                    }}
                    onClick={handleSearchSubmit}
                  >
                    View all matching results for "{searchQuery}" →
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="search-socials">
            <span>Follow us on:</span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="social-fb"
            >
              <FaFacebookF size={22} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="social-tw"
            >
              <FaXTwitter size={22} />
            </a>

            <a
              href="https://instagram.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-ig"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://wa.me/918208127243"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="social-wa"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER ───────────────────────────────── */}
      <div
        className={`mobile-nav-overlay${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`mobile-nav-drawer${mobileOpen ? " open" : ""}`}>
        <div className="mobile-nav-header">
          <Link
            className="site-logo"
            to="/"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="logo-icon"
              style={{ width: 36, height: 36, fontSize: 16 }}
            >
              🐄
            </div>
            <div className="logo-text">
              <b>SOHANI MITRA</b>
              <small>B2B DAIRY MARKETPLACE</small>
            </div>
          </Link>
          <button
            className="mobile-nav-close"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="mobile-nav-links">
          <NavLink to="/" onClick={() => setMobileOpen(false)}>
            🏠 Home
          </NavLink>
          <NavLink to="/about-us" onClick={() => setMobileOpen(false)}>
            ℹ️ About Us
          </NavLink>
          <NavLink to="/pashu" onClick={() => setMobileOpen(false)}>
            🐄 Buy Pashu
          </NavLink>
          <NavLink to="/free-listing" onClick={() => setMobileOpen(false)}>
            📋 Free Listing
          </NavLink>
          <NavLink to="/advertise" onClick={() => setMobileOpen(false)}>
            📢 Advertise
          </NavLink>
          <NavLink to="/blogs" onClick={() => setMobileOpen(false)}>
            📝 Blogs
          </NavLink>
          <NavLink to="/consultancy" onClick={() => setMobileOpen(false)}>
            💡 Consultancy
          </NavLink>
          <NavLink to="/contact-us" onClick={() => setMobileOpen(false)}>
            📞 Contact Us
          </NavLink>
        </div>
        <div style={{ padding: "10px 16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            🌐 SELECT LANGUAGE
          </label>
          <LanguageSelector className="lang-select" style={{ width: "100%" }} />
        </div>
        <div className="mobile-nav-cta">
          <Link
            to="/seller/login"
            className="btn-signin"
            onClick={() => setMobileOpen(false)}
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>

      {/* ── PAGE CONTENT ────────────────────────────────── */}
      <Outlet context={{ categories }} />

      {/* ── AUTO REQUIREMENT POPUP MODAL ────────────────── */}
      <AutoRequirementModal />

      {/* ── FLOATING BUTTONS ────────────────────────────── */}
      <div className="float-btns">
        <a
          className="float-btn float-whatsapp"
          href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "918208127243"}?text=Hello%2C%20I%20am%20interested%20in%20buying%20dairy%20cattle.`}
          target="_blank"
          rel="noreferrer"
          title="WhatsApp Us"
        >
          <FaWhatsapp size={24} />
        </a>
        <a
          className="float-btn float-phone"
          href="tel:+918208127243"
          title="Call Us"
        >
          📞
        </a>
      </div>
      <a className="enquire-float" href="/contact-us">
        + Enquire Now
      </a>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="site-footer">
        {/* Help Bar */}
        <div className="footer-help-bar">
          <span>We are here to help you!</span>
          <div className="footer-help-socials">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="social-fb"
            >
              <FaFacebookF size={22} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="social-tw"
            >
              <FaXTwitter size={22} />
            </a>

            <a
              href="https://instagram.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-ig"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://wa.me/918208127243"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="social-wa"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="footer-main-grid">
          {/* About */}
          <div className="footer-col">
            <h4 style={{ marginTop: 14 }}>ABOUT SOHANI MITRA</h4>
            <p>
              We are India's best sourcing marketplace for dairy animals. Our
              platform provides easy access to a variety of breeds with detailed
              information on each animal, allowing buyers to make informed
              decisions when buying their desired livestock.
            </p>
            <p style={{ marginTop: 10 }}>
              📍 Sohani, Kerakat, Jaunpur, UP 222142
              <br />
              📞 +91 82081 27243
              <br />✉ info@sohanimitradairy.com
            </p>
          </div>

          {/* Category */}
          <div className="footer-col">
            <h4>OUR CATEGORY</h4>
            {categories.map((c) => (
              <Link key={c._id || c.id} to={`/pashu/category/${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </div>

          {/* Policy */}
          <div className="footer-col">
            <h4>OUR POLICY</h4>
            <Link to="/about-us">Terms of Service</Link>
            <Link to="/about-us">Privacy Policy</Link>
            <Link to="/about-us">Refund Policy</Link>
            <Link to="/contact-us">Support Center</Link>
            <Link to="/free-listing">Free Listing</Link>
            <Link to="/advertise">Advertise With Us</Link>
          </div>

          {/* Enquire Now */}
          <div className="footer-col">
            <div className="footer-enquire">
              <h4>ENQUIRE NOW</h4>
              {enquiryMsg ? (
                <p
                  style={{
                    color: "#1a5c14",
                    fontWeight: 600,
                    fontSize: 13,
                    textAlign: "center",
                    padding: "16px 0",
                  }}
                >
                  ✅ {enquiryMsg}
                </p>
              ) : (
                <form className="enquire-form" onSubmit={handleEnquiry}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={enquiry.name}
                    onChange={(e) =>
                      setEnquiry({ ...enquiry, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Id"
                    value={enquiry.email}
                    onChange={(e) =>
                      setEnquiry({ ...enquiry, email: e.target.value })
                    }
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={enquiry.phone}
                    onChange={(e) =>
                      setEnquiry({ ...enquiry, phone: e.target.value })
                    }
                    required
                  />
                  <textarea
                    placeholder="Feel free to ask your enquiry"
                    value={enquiry.message}
                    onChange={(e) =>
                      setEnquiry({ ...enquiry, message: e.target.value })
                    }
                  />
                  <button type="submit" className="btn-send">
                    Send Inquiry →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          Copyright © {new Date().getFullYear()} Sohani Mitra. All rights
          reserved. | India's Largest B2B Dairy Animal Marketplace
        </div>
      </footer>
    </>
  );
}
