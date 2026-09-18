import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import CowCard from "../../components/CowCard";
import SEO from "../../components/common/SEO";
import { useLocations } from "../../hooks/useLocations";

const BREED_FILTERS = [
  { label: "All Cattle", slug: "" },
  { label: "HF Cow", slug: "hf-cow" },
  { label: "Gir Cow", slug: "gir-cow" },
  { label: "Sahiwal Cow", slug: "sahiwal-cow" },
  { label: "Jersey Cow", slug: "jersey-cow" },
  { label: "Murrah Buffalo", slug: "murrah-buffalo" },
  { label: "Tharparkar", slug: "tharparkar-cow" },
];

const ITEMS_PER_PAGE = 12;

export default function Products() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    states = [],
    getCitiesForState,
    loading: locLoading,
  } = useLocations();

  // Data state
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(() => {
    return Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  });
  const [title, setTitle] = useState("All Available Cattle");
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState(
    () => searchParams.get("search") || searchParams.get("q") || "",
  );
  const [selectedState, setSelectedState] = useState(
    () => searchParams.get("state") || "",
  );
  const [selectedCity, setSelectedCity] = useState(
    () => searchParams.get("city") || "",
  );
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest"); // "newest" | "oldest" | "price-low" | "price-high"
  const [cats, setCats] = useState([]);

  // Compute available cities for currently selected state
  const availableCities =
    typeof getCitiesForState === "function" && selectedState
      ? getCitiesForState(selectedState)
      : [];

  // Update URL search parameters when filters or pagination change
  const syncSearchParams = (
    nextState,
    nextCity,
    nextSort,
    nextSearch,
    nextPage,
  ) => {
    const sp = {};
    if (nextPage > 1) sp.page = nextPage;
    if (nextSort && nextSort !== "newest") sp.sort = nextSort;
    if (nextState) sp.state = nextState;
    if (nextCity) sp.city = nextCity;
    if (nextSearch) sp.search = nextSearch;
    setSearchParams(sp, { replace: true });
  };

  const handleStateChange = (e) => {
    const nextState = e.target.value;
    setSelectedState(nextState);
    setSelectedCity("");
    setCurrentPage(1);
    syncSearchParams(nextState, "", sort, search, 1);
  };

  const handleCityChange = (e) => {
    const nextCity = e.target.value;
    setSelectedCity(nextCity);
    setCurrentPage(1);
    syncSearchParams(selectedState, nextCity, sort, search, 1);
  };

  const handleSortChange = (e) => {
    const nextSort = e.target.value;
    setSort(nextSort);
    setCurrentPage(1);
    syncSearchParams(selectedState, selectedCity, nextSort, search, 1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    syncSearchParams(selectedState, selectedCity, sort, search, 1);
  };

  const clearAllFilters = () => {
    setSelectedState("");
    setSelectedCity("");
    setSearch("");
    setSort("newest");
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  // Sync state when URL searchParams change (e.g. Back/Forward button, filter URL mutations)
  useEffect(() => {
    const pageFromUrl = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
    setCurrentPage(pageFromUrl);
    setSelectedState(searchParams.get("state") || "");
    setSelectedCity(searchParams.get("city") || "");
    setSort(searchParams.get("sort") || "newest");
    setSearch(searchParams.get("search") || searchParams.get("q") || "");
  }, [searchParams]);

  // Fetch products from backend with pagination, sorting, and location filters
  useEffect(() => {
    setLoading(true);
    const url = slug ? `/categories/${slug}/products` : "/products";

    const params = {
      page: currentPage,
      per_page: ITEMS_PER_PAGE,
      sort,
    };
    if (selectedState && selectedState !== "All") params.state = selectedState;
    if (selectedCity && selectedCity !== "All") params.city = selectedCity;
    if (search.trim()) params.search = search.trim();

    Promise.all([
      api.get(url, { params }),
      cats.length === 0 ? api.get("/categories") : Promise.resolve(null),
    ])
      .then(([r, c]) => {
        const pData = r.data?.data;
        if (pData && Array.isArray(pData.data)) {
          setProducts(pData.data);
          setTotalCount(pData.total || 0);
          setTotalPages(pData.last_page || 1);
        } else if (Array.isArray(pData)) {
          setProducts(pData);
          setTotalCount(pData.length);
          setTotalPages(1);
        } else {
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }

        if (r.data?.category) {
          setTitle(r.data.category.name);
        } else if (slug) {
          setTitle(
            slug.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          );
        } else {
          setTitle("All Available Cattle");
        }

        if (c && c.data?.data) {
          setCats(c.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, currentPage, sort, selectedState, selectedCity, search]);

  const handlePageClick = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== currentPage
    ) {
      setCurrentPage(pageNumber);
      syncSearchParams(selectedState, selectedCity, sort, search, pageNumber);
      const targetEl = document.getElementById("cattle-listings-top");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 400, behavior: "smooth" });
      }
    }
  };

  // Generate pagination page numbers window
  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const startIndex = totalCount > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  // Dynamic SEO metadata
  const locationLabel = [selectedCity, selectedState].filter(Boolean).join(", ");
  const categoryLabel = slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "";
  const dynamicSeoTitle = categoryLabel
    ? `${categoryLabel} for Sale ${locationLabel ? `in ${locationLabel}` : "in India"} — Verified Dairy Cattle`
    : search
    ? `Search Results for "${search}" — Dairy Cattle Marketplace`
    : locationLabel
    ? `Dairy Cattle & Cows for Sale in ${locationLabel} — Pure Breeds`
    : "Dairy Cattle for Sale — HF Cows, Murrah Buffaloes, Gir & Sahiwal";

  const dynamicSeoDesc = `Explore ${totalCount > 0 ? `${totalCount}+ ` : ""}verified dairy cattle ${categoryLabel ? `(${categoryLabel}) ` : ""}${locationLabel ? `available in ${locationLabel}` : "across India"}. Compare daily milk yield, lactation history, health cards, and direct breeder pricing.`;
  const dynamicKeywords = `${categoryLabel ? `${categoryLabel}, buy ${categoryLabel}, ` : ""}dairy cow for sale, milk cattle India, cattle prices, HF cows, Murrah buffalo, Sahiwal cow, Gir cow, Jaunpur dairy farm${locationLabel ? `, dairy farm ${locationLabel}` : ""}`;

  return (
    <main className="products-page">
      <SEO
        title={dynamicSeoTitle}
        description={dynamicSeoDesc}
        keywords={dynamicKeywords}
        type="website"
      />
      {/* Main Content Body */}
      <div className="products-page-body" id="cattle-listings-top">
        {/* Sidebar */}
        <aside className="products-sidebar">
          {/* Search */}
          <div className="ps-block">
            <h4 className="ps-block-title">Search Cattle</h4>
            <form onSubmit={handleSearchSubmit} className="ps-search-wrap">
              <input
                type="text"
                placeholder="Name, breed, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-search-input"
              />
              <button
                type="submit"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                className="ps-search-icon"
              >
                🔍
              </button>
            </form>
          </div>

          {/* Location Filter: State & City */}
          <div className="ps-block">
            <h4 className="ps-block-title">Filter by Location</h4>
            <div className="ps-location-filter">
              <label className="ps-filter-label">Select State</label>
              <select
                className="ps-filter-select"
                value={selectedState}
                onChange={handleStateChange}
                disabled={locLoading}
              >
                <option value="">All States (India)</option>
                {states.map((st) => {
                  const stateName = typeof st === "string" ? st : st.state;
                  const stateKey = typeof st === "object" ? st.state_key : "";
                  return (
                    <option key={stateName} value={stateName}>
                      {stateName} {stateKey ? `(${stateKey})` : ""}
                    </option>
                  );
                })}
              </select>

              <label className="ps-filter-label" style={{ marginTop: 12 }}>
                Select City
              </label>
              <select
                className="ps-filter-select"
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedState || locLoading}
              >
                <option value="">
                  {selectedState
                    ? `All Cities in ${selectedState}`
                    : "Select State First"}
                </option>
                {availableCities.map((ct) => {
                  const cityName =
                    typeof ct === "string"
                      ? ct
                      : ct.city || ct.name || String(ct);
                  return (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  );
                })}
              </select>

              {(selectedState ||
                selectedCity ||
                search ||
                sort !== "newest") && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="ps-clear-filters-btn"
                >
                  ✕ Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Browse by Breed */}
          <div className="ps-block">
            <h4 className="ps-block-title">Browse by Breed</h4>
            <ul className="ps-filter-list">
              {(cats.length > 0
                ? [
                    { label: "All Cattle", slug: "" },
                    ...cats.map((c) => ({ label: c.name, slug: c.slug })),
                  ]
                : BREED_FILTERS
              ).map((f) => (
                <li key={f.slug || "all"}>
                  <Link
                    to={f.slug ? `/pashu/category/${f.slug}` : "/pashu"}
                    className={`ps-filter-link${
                      (!slug && !f.slug) || slug === f.slug ? " active" : ""
                    }`}
                    onClick={() => setCurrentPage(1)}
                  >
                    <span className="ps-filter-dot" />
                    {f.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Expert CTA */}
          <div className="ps-cta-box">
            <div className="ps-cta-icon">📞</div>
            <h4>Need Help Finding Cattle?</h4>
            <p>Talk to our dairy experts for free guidance.</p>
            <a href="tel:+918208127243" className="ps-cta-btn">
              Call Expert Now
            </a>
          </div>
        </aside>

        {/* Listings Section */}
        <section className="products-listing-area">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="products-count">
              {loading ? (
                <span key="loading-status">Loading cattle listings...</span>
              ) : totalCount > 0 ? (
                <span key="count-status">
                  <span>Showing </span>
                  <b>
                    {startIndex}–{endIndex}
                  </b>
                  <span> of </span>
                  <b>{totalCount.toLocaleString()}</b>
                  <span> Cattle</span>
                  {selectedState && <span> in {selectedState}</span>}
                  {selectedCity && <span>, {selectedCity}</span>}
                </span>
              ) : (
                <span key="empty-status">0 Cattle Found</span>
              )}
            </div>

            <div className="products-toolbar-right">
              <label
                style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}
              >
                Sort by:
              </label>
              <select
                className="products-sort-select"
                value={sort}
                onChange={handleSortChange}
              >
                <option value="newest">Newly Added (Newest First)</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Cattle Listings Grid */}
          {loading ? (
            <div className="products-loading" key="grid-loading">
              <div className="products-spinner" />
              <p>Fetching cattle listings from database...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty" key="grid-empty">
              <span className="products-empty-icon">🐄</span>
              <h3>No cattle found matching your criteria</h3>
              <p>
                Try selecting a different state, city, or clearing your filters.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn-orange"
                style={{ border: "none", cursor: "pointer", marginTop: 8 }}
              >
                Clear Filters & Browse All
              </button>
            </div>
          ) : (
            <div key="grid-content">
              <div className="products-grid-pro">
                {products.map((p) => (
                  <CowCard key={p._id || p.id} cow={p} />
                ))}
              </div>

              {/* ── PAGINATION CONTROLS ── */}
              {totalPages > 1 && (
                <div className="products-pagination-wrap">
                  <div className="products-pagination-info">
                    <span>Showing </span>
                    <b>{startIndex}</b>
                    <span> to </span>
                    <b>{endIndex}</b>
                    <span> of </span>
                    <b>{totalCount.toLocaleString()}</b>
                    <span> listings (Page </span>
                    <b>{currentPage}</b>
                    <span> of </span>
                    <b>{totalPages}</b>
                    <span>)</span>
                  </div>

                  <div className="products-pagination-buttons">
                    {/* Previous Page */}
                    <button
                      type="button"
                      className="products-page-btn"
                      onClick={() => handlePageClick(currentPage - 1)}
                      disabled={currentPage <= 1}
                      aria-label="Previous Page"
                    >
                      ‹ Prev
                    </button>

                    {/* Page Numbers */}
                    {getPaginationNumbers().map((num, idx) =>
                      num === "..." ? (
                        <span
                          key={`dots-${idx}`}
                          className="products-page-dots"
                        >
                          •••
                        </span>
                      ) : (
                        <button
                          key={num}
                          type="button"
                          className={`products-page-btn ${
                            currentPage === num ? "active" : ""
                          }`}
                          onClick={() => handlePageClick(num)}
                        >
                          {num}
                        </button>
                      ),
                    )}

                    {/* Next Page */}
                    <button
                      type="button"
                      className="products-page-btn"
                      onClick={() => handlePageClick(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      aria-label="Next Page"
                    >
                      Next ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
