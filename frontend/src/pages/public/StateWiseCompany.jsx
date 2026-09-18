import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useLocations } from "../../hooks/useLocations";
import SEO from "../../components/common/SEO";
import "./StateWiseCompany.css";
import { useOutletContext } from "react-router-dom";
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
const POPULAR_LOCATIONS = [
  "Karnal",
  "Haryana",
  "Jaunpur",
  "Uttar Pradesh",
  "Anand",
  "Gujarat",
  "Rajasthan",
  "Punjab",
  "Maharashtra",
  "Madhya Pradesh",
  "Bihar",
  "All India",
];

const CATEGORIES_LIST = [
  { name: "Murrah Buffalo", slug: "murrah-buffalo", icon: "🐃" },
  { name: "HF Breed Cows", slug: "hf-cow", icon: "🐄" },
  { name: "Sahiwal Cows", slug: "sahiwal-cow", icon: "🐄" },
  { name: "Gir Cows", slug: "gir-cow", icon: "🐄" },
  { name: "Jersey Cows", slug: "jersey-cow", icon: "🐄" },
  { name: "Tharparkar Cows", slug: "tharparkar-cow", icon: "🐄" },
];

export default function StateWiseCompany() {
  const { state } = useParams();
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const outletCats = outletCtx?.categories || [];
  const [cats, setCats] = useState(outletCats);
  useEffect(() => {
    if (!outletCats || outletCats.length === 0) {
      api
        .get("/categories")
        .then((c) => setCats(c.data.data || []))
        .catch(() => {});
    }
  }, []);
  // If no state param, default to Karnal to match standard directory view or user's requested region
  const currentLocation = state ? decodeURIComponent(state) : "Karnal";

  const { states: locationStates, getCitiesForState } = useLocations();

  // Determine active state selection from currentLocation
  const matchedState = locationStates.find(
    (st) =>
      st.state.toLowerCase() === currentLocation.toLowerCase() ||
      (st.state_key &&
        st.state_key.toLowerCase() === currentLocation.toLowerCase()),
  );

  let activeStateName = matchedState ? matchedState.state : "";
  let activeCityName = "";

  if (
    !matchedState &&
    currentLocation &&
    currentLocation.toLowerCase() !== "all"
  ) {
    for (const st of locationStates) {
      const cities = getCitiesForState(st.state);
      if (
        cities.some((c) => c.toLowerCase() === currentLocation.toLowerCase())
      ) {
        activeStateName = st.state;
        activeCityName = currentLocation;
        break;
      }
    }
  }

  const [selectedState, setSelectedState] = useState(activeStateName);
  const [selectedCity, setSelectedCity] = useState(activeCityName);

  useEffect(() => {
    if (activeStateName) setSelectedState(activeStateName);
    if (activeCityName) setSelectedCity(activeCityName);
    else if (matchedState) setSelectedCity("");
  }, [currentLocation, activeStateName, activeCityName, matchedState]);

  const citiesForSelectedState = getCitiesForState(selectedState);

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isFallback, setIsFallback] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = import.meta.env.VITE_API_URL.replace("/api/v1", "");
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Reset to page 1 whenever location or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentLocation]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchSuppliers = async () => {
      try {
        const isAll =
          !currentLocation ||
          currentLocation.toLowerCase() === "all" ||
          currentLocation.toLowerCase() === "all india";

        const params = {
          page: currentPage,
          per_page: 10,
        };
        if (!isAll) {
          params.location = currentLocation;
        }

        const res = await api.get("/sellers", { params });
        const dataObj = res.data?.data || {};
        const list = dataObj.data || [];

        if (isMounted) {
          if (list.length > 0) {
            setSellers(list);
            setTotalPages(dataObj.last_page || 1);
            setTotalCount(dataObj.total || list.length);
            setIsFallback(false);
          } else {
            // If zero suppliers in this exact locality, fetch all active sellers as fallback
            const allRes = await api.get("/sellers", {
              params: { page: currentPage, per_page: 10 },
            });
            const fallbackObj = allRes.data?.data || {};
            setSellers(fallbackObj.data || []);
            setTotalPages(fallbackObj.last_page || 1);
            setTotalCount(fallbackObj.total || 0);
            setIsFallback(true);
          }
        }
      } catch (err) {
        console.error("Error fetching state suppliers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuppliers();
    window.scrollTo({ top: 350, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [currentLocation, currentPage]);

  const filteredSellers = sellers.filter((s) => {
    if (!searchKeyword.trim()) return true;
    const q = searchKeyword.toLowerCase();
    const name = (s.business_name || s.name || "").toLowerCase();
    const city = (s.city || "").toLowerCase();
    const st = (s.state || "").toLowerCase();
    return name.includes(q) || city.includes(q) || st.includes(q);
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(
        `/state-wise-company/${encodeURIComponent(searchKeyword.trim())}`,
      );
    }
  };
  const dynamicSeoTitle = `Dairy Farms in ${currentLocation} — Verified Cattle Suppliers & Breeders`;
  const dynamicSeoDesc = `Discover ${totalCount > 0 ? `${totalCount}+ ` : ""}top-rated verified dairy cattle suppliers and farms in ${currentLocation}. Buy pure breed HF cows, Murrah buffaloes, Sahiwal, and Gir cattle with lactation health verification and direct owner pricing.`;
  const dynamicKeywords = `dairy farm in ${currentLocation}, cattle suppliers ${currentLocation}, cow breeders ${currentLocation}, buy cow in ${currentLocation}, Murrah buffalo ${currentLocation}, Sohani Dairy Farm`;

  return (
    <div className="swc-page">
      <SEO
        title={dynamicSeoTitle}
        description={dynamicSeoDesc}
        keywords={dynamicKeywords}
        type="website"
      />
      {/* ─── HEADER BANNER ────────────────────────────────────────── */}
      <div className="swc-header-banner">
        <div className="swc-container">
          <div className="swc-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            Suppliers
            <span>›</span>
            <span>{currentLocation}</span>
          </div>

          <div className="swc-title-row">
            <div>
              <h1 className="swc-main-title">
                Dairy Farm in {currentLocation}
                <span className="swc-badge-count">
                  {totalCount || filteredSellers.length} Verified Farms
                </span>
              </h1>
            </div>

            <form className="swc-search-bar" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search farm name, city, or state..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="swc-search-btn">
                🔍 Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ─── DYNAMIC STATE & CITY SELECTORS ───────────────────────── */}
      <div className="swc-filters-bar">
        <div className="swc-container">
          <div className="swc-dropdowns-row">
            <div className="swc-select-group">
              <label>🏛️ Select State:</label>
              <select
                className="swc-location-select"
                value={selectedState}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedState(val);
                  setSelectedCity("");
                  if (val) {
                    navigate(`/state-wise-company/${encodeURIComponent(val)}`);
                  } else {
                    navigate(`/state-wise-company/All`);
                  }
                }}
              >
                <option value="">All States</option>
                {locationStates.map((st) => (
                  <option key={st.state} value={st.state}>
                    {st.state} {st.state_key ? `(${st.state_key})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="swc-select-group">
              <label>🏙️ Select City:</label>
              <select
                className="swc-location-select"
                value={selectedCity}
                disabled={!selectedState || citiesForSelectedState.length === 0}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCity(val);
                  if (val) {
                    navigate(`/state-wise-company/${encodeURIComponent(val)}`);
                  } else if (selectedState) {
                    navigate(
                      `/state-wise-company/${encodeURIComponent(selectedState)}`,
                    );
                  }
                }}
              >
                <option value="">
                  {!selectedState
                    ? "Select State First"
                    : `All Cities in ${selectedState}`}
                </option>
                {citiesForSelectedState.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── QUICK LOCATIONS BAR ──────────────────────────────────── */}
      <div className="swc-locations-bar">
        <div className="swc-container">
          <div className="swc-pills-scroll">
            {POPULAR_LOCATIONS.map((loc) => {
              const active =
                currentLocation.toLowerCase() === loc.toLowerCase() ||
                (loc === "All India" &&
                  currentLocation.toLowerCase() === "all");
              return (
                <Link
                  key={loc}
                  to={
                    loc === "All India"
                      ? "/state-wise-company/All"
                      : `/state-wise-company/${encodeURIComponent(loc)}`
                  }
                  className={`swc-pill-btn ${active ? "active" : ""}`}
                >
                  📍 {loc}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── MAIN SUPPLIERS GRID ──────────────────────────────────── */}
      <div className="swc-container swc-grid-section">
        {isFallback && !loading && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              color: "#92400e",
              padding: "12px 18px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span>
              ℹ️ Direct suppliers for <b>{currentLocation}</b> are being
              verified. Showing top verified dairy farms across India delivering
              to your area.
            </span>
            <Link
              to="/free-listing"
              style={{
                color: "#b45309",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              List your dairy farm in {currentLocation} →
            </Link>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: 14, color: "#64748b", fontWeight: 600 }}>
              Loading Dairy Farms in {currentLocation}...
            </p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="swc-empty-box">
            <div className="swc-empty-icon">🐄</div>
            <h3>No Dairy Farms Found</h3>
            <p>
              We could not find any dairy farms matching your search in{" "}
              <b>{currentLocation}</b>.
            </p>
            <Link to="/free-listing" className="swc-cta-btn">
              Register Your Dairy Farm for Free
            </Link>
          </div>
        ) : (
          <>
            <div className="swc-company-grid">
              {filteredSellers.map((seller) => {
                const profileLink = `/supplier/${slugify(seller.business_name)}`;
                const farmName =
                  seller.business_name || seller.name || "Verified Dairy Farm";
                const logoImg =
                  getMediaUrl(seller.business_image) ||
                  getMediaUrl(seller.avatar);

                return (
                  <div
                    className="swc-company-card"
                    key={seller._id || seller.id}
                  >
                    {/* Top: Logo + Name + Location */}
                    <div className="swc-card-top">
                      <div className="swc-logo-box">
                        {logoImg ? (
                          <img
                            src={logoImg}
                            alt={farmName}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="swc-logo-placeholder"
                          style={{ display: logoImg ? "none" : "flex" }}
                        >
                          🐄
                        </div>
                      </div>

                      <div className="swc-company-meta">
                        <div className="swc-card-header-row">
                          <Link
                            to={profileLink}
                            className="swc-company-name"
                            title={farmName}
                          >
                            {farmName}
                          </Link>
                          {seller.featured && (
                            <span className="swc-featured-badge">
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        <div className="swc-location-row">
                          <span className="swc-loc-icon">📍</span>
                          <span className="swc-loc-text">
                            {seller.city ? `${seller.city}, ` : ""}
                            {seller.state || "India"}
                          </span>
                          {seller.pincode && (
                            <span className="swc-pincode-pill">
                              ({seller.pincode})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Tags */}
                    <div className="swc-card-tags">
                      <span className="swc-verified-badge">
                        <span className="swc-check-icon">✓</span> Verified Farm
                      </span>
                      {seller.product_count > 0 ? (
                        <span className="swc-cattle-badge">
                          🥛 {seller.product_count} Cattle
                        </span>
                      ) : (
                        <span className="swc-cattle-badge">🥛 Pure Breeds</span>
                      )}
                    </div>

                    {/* Bottom: Action */}
                    <div className="swc-card-footer">
                      <Link to={profileLink} className="swc-view-btn">
                        <span>View Profile</span>
                        <span className="swc-btn-arrow">→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── PAGINATION (10 PER PAGE) ─── */}
            {totalPages > 1 && (
              <div className="swc-pagination-wrap">
                <div className="swc-pagination-info">
                  Showing <b>{(currentPage - 1) * 10 + 1}</b> –{" "}
                  <b>{Math.min(currentPage * 10, totalCount)}</b> of{" "}
                  <b>{totalCount}</b> Verified Farms
                </div>

                <div className="swc-pagination-buttons">
                  <button
                    type="button"
                    className="swc-page-btn swc-prev-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      return (
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 2
                      );
                    })
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((pNum, idx) =>
                      pNum === "..." ? (
                        <span key={`dots-${idx}`} className="swc-page-dots">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pNum}
                          type="button"
                          className={`swc-page-btn swc-num-btn ${
                            currentPage === pNum ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(pNum)}
                        >
                          {pNum}
                        </button>
                      ),
                    )}

                  <button
                    type="button"
                    className="swc-page-btn swc-next-btn"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── BOTTOM EDITORIAL & SEO SECTION (MATCHING IMAGE) ──────── */}
      <section className="swc-content-section">
        <div className="swc-container">
          <div className="swc-editorial-block">
            <h2>🥛 Dairy Farming in {currentLocation}</h2>
            <p>
              Dairy farming in {currentLocation} forms the vital backbone of the
              regional agricultural economy, supplying nutritious milk and
              pedigreed cattle across regional and interstate markets. Known for
              its fertile fodder belts, seasoned livestock management
              traditions, and favorable climatic conditions, {currentLocation}{" "}
              has produced some of the highest-yielding dairy breeds in India.
            </p>
            <p>
              Leading dairy breeds including <b>Murrah Buffaloes</b> (renowned
              for rich fat content and daily yields of 14-22 liters),{" "}
              <b>Holstein Friesian (HF) Cows</b>, and indigenous champions like{" "}
              <b>Sahiwal</b> and <b>Gir</b> cows are maintained with modern
              milking infrastructure and rigorous veterinary supervision in{" "}
              {currentLocation}.
            </p>
          </div>

          <div className="swc-editorial-block">
            <h3>🌟 Benefits of Using Our Marketplace</h3>
            <p>
              Sohani Mitra connects you directly with top-tier dairy farmers and
              certified breeders without intermediaries, ensuring total
              transparency and peace of mind:
            </p>
            <ul className="swc-benefits-list">
              <li>
                <b>100% Verified Sellers:</b> Every dairy farm listed in{" "}
                {currentLocation} undergoes address, ownership, and livestock
                lineage verification.
              </li>
              <li>
                <b>Direct Farmer-to-Farmer Trade:</b> Zero commissions and zero
                middlemen. Negotiate directly with the farm owners for best
                rates.
              </li>
              <li>
                <b>Comprehensive Health Cards:</b> Access lactation records,
                milk testing videos, calving dates, and vaccination records.
              </li>
              <li>
                <b>Interstate Logistics Assistance:</b> Safe, humane, and
                licensed transportation support to deliver cattle directly to
                your doorstep.
              </li>
              <li>
                <b>Secure Escrow & Inquiries:</b> Verified contact details and
                inquiry tracking for seamless negotiations.
              </li>
              <li>
                <b>Veterinary & Consultancy Advice:</b> Expert guidance on
                cattle nutrition, yield optimization, and shed management.
              </li>
            </ul>
          </div>

          <div className="swc-editorial-block">
            <h3>🐄 Our Categories</h3>
            <p>
              Browse verified cattle, dairy machinery, and livestock essentials
              available from suppliers in {currentLocation}:
            </p>
            <div className="swc-categories-grid">
              {cats.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/pashu/category/${cat.slug}`}
                  className="swc-cat-card"
                >
                  <span>🐄</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="swc-editorial-block">
            <h3>🤝 How do we support Dairy Farming in {currentLocation}?</h3>
            <p>
              At Sohani Mitra, our mission is to empower farmers in{" "}
              {currentLocation} with high-visibility digital storefronts,
              nationwide exposure, and modern marketplace technology. By
              enabling local dairy farms to showcase their breeding herds,
              lactation certifications, and dairy products online, we bridge the
              gap between progressive farmers and passionate dairy buyers across
              India.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
