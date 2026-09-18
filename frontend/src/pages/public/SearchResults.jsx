import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { getImageUrl } from "../../utils/imageUrl";
import SEO from "../../components/common/SEO";
import "./SearchResults.css";
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
const DEFAULT_COW_IMG =
  "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80";
const DEFAULT_SELLER_IMG =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";

const POPULAR_SEARCHES = [
  "Murrah Buffalo Karnal",
  "Gir Cow under 70000",
  "HF Cow 20 liter milk",
  "Sahiwal Cow Haryana",
  "Dairy Farm 132001",
  "Fast Delivery (2-3 Days)",
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "all";
  const pageParam = parseInt(searchParams.get("page"), 10) || 1;

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState(typeParam); // "all" | "products" | "sellers"
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState({
    products: [],
    sellers: [],
    counts: { products: 0, sellers: 0, total: 0 },
    pagination: {
      page: 1,
      limit: 18,
      product_pages: 1,
      seller_pages: 1,
      total_pages: 1,
    },
    ai_parsed: { tags: [] },
    ai_provider: "Sohani AI Engine",
    ai_advisor_note: null,
  });

  const limit = 18;

  // Sync state when URL params change
  useEffect(() => {
    setInputQuery(queryParam);
    setActiveTab(typeParam);
    setCurrentPage(pageParam);
  }, [queryParam, typeParam, pageParam]);

  useEffect(() => {
    if (!queryParam.trim()) {
      setResultData({
        products: [],
        sellers: [],
        counts: { products: 0, sellers: 0, total: 0 },
        pagination: {
          page: 1,
          limit,
          product_pages: 1,
          seller_pages: 1,
          total_pages: 1,
        },
        ai_parsed: { tags: [] },
        ai_provider: "Sohani AI Engine",
        ai_advisor_note: null,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get("/search", {
        params: {
          q: queryParam,
          type: activeTab,
          page: currentPage,
          limit: limit,
        },
      })
      .then((res) => {
        if (res.data?.success) {
          setResultData({
            products: res.data.data?.products || [],
            sellers: res.data.data?.sellers || [],
            counts: res.data.counts || {
              products: res.data.data?.products?.length || 0,
              sellers: res.data.data?.sellers?.length || 0,
              total:
                (res.data.data?.products?.length || 0) +
                (res.data.data?.sellers?.length || 0),
            },
            pagination: res.data.pagination || {
              page: currentPage,
              limit,
              product_pages: 1,
              seller_pages: 1,
              total_pages: 1,
            },
            ai_parsed: res.data.ai_parsed || { tags: [] },
            ai_provider: res.data.ai_provider || "Sohani AI Engine",
            ai_advisor_note: res.data.ai_advisor_note || null,
          });
        }
      })
      .catch((err) => {
        console.error("AI Search API Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [queryParam, activeTab, currentPage]);

  const handleRefineSubmit = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({
        q: inputQuery.trim(),
        ...(activeTab !== "all" ? { type: activeTab } : {}),
        page: 1,
      });
    }
  };

  const handleQuickSearch = (term) => {
    setInputQuery(term);
    setSearchParams({
      q: term,
      ...(activeTab !== "all" ? { type: activeTab } : {}),
      page: 1,
    });
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({
      q: queryParam,
      ...(newTab !== "all" ? { type: newTab } : {}),
      page: 1,
    });
  };

  const handlePageClick = (newPage) => {
    if (newPage < 1 || newPage === currentPage) return;
    setCurrentPage(newPage);
    setSearchParams({
      q: queryParam,
      ...(activeTab !== "all" ? { type: activeTab } : {}),
      page: newPage,
    });
    const resultsElem = document.getElementById("ai-search-results-area");
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const {
    products,
    sellers,
    counts,
    pagination,
    ai_parsed,
    ai_provider,
    ai_advisor_note,
  } = resultData;
  const tags = ai_parsed?.tags || [];

  // Determine active total items and total pages for pagination
  const activeCount =
    activeTab === "products"
      ? counts.products
      : activeTab === "sellers"
        ? counts.sellers
        : counts.total;

  const totalPages =
    activeTab === "products"
      ? pagination.product_pages || Math.ceil(counts.products / limit) || 1
      : activeTab === "sellers"
        ? pagination.seller_pages || Math.ceil(counts.sellers / limit) || 1
        : pagination.total_pages ||
          Math.max(
            pagination.product_pages || 1,
            pagination.seller_pages || 1,
          ) ||
          1;

  const startIndex = activeCount > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endIndex = Math.min(currentPage * limit, activeCount);

  const getPaginationNumbers = (curr, total) => {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (curr <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", total);
      } else if (curr >= total - 3) {
        pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, "...", curr - 1, curr, curr + 1, "...", total);
      }
    }
    return pages;
  };

  return (
    <main className="ai-search-page">
      <SEO
        title={queryParam ? `Search Results for "${queryParam}" — Dairy Cattle & Suppliers` : "Search Dairy Cattle & Farms — AI Search"}
        description={queryParam ? `Explore verified dairy cattle, cows, buffaloes, and dairy farm suppliers matching "${queryParam}". Compare daily milk yield, prices, and locations.` : "Search certified dairy cattle and verified dairy farms across India."}
        keywords={`${queryParam ? `${queryParam}, ` : ""}search dairy cattle, buy cows online, find dairy farms India`}
      />
      {/* ── AI HERO BANNER ───────────────────────────────── */}
      <section className="ai-search-hero">
        <div className="ai-search-hero-inner">
          <div className="ai-badge">
            <span className="pulse-dot"></span>
            🤖 {ai_provider || "AI Search Intelligence"}
          </div>

          {ai_advisor_note && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.16)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "12px 18px",
                borderRadius: "12px",
                marginBottom: "16px",
                fontSize: "14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                lineHeight: "1.5",
              }}
            >
              <span style={{ fontSize: "18px" }}>💡</span>
              <div>
                <strong style={{ color: "#ffcb99" }}>
                  OpenAI Advisor Insight:
                </strong>{" "}
                <span>{ai_advisor_note}</span>
              </div>
            </div>
          )}

          {ai_parsed?.ai_intent_summary && (
            <div
              style={{
                fontSize: "14px",
                color: "#e2f8e0",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 500,
              }}
            >
              <span>🎯</span>
              <span>
                <strong>AI Understanding:</strong> {ai_parsed.ai_intent_summary}
              </span>
            </div>
          )}

          <h1 className="ai-search-title">
            Search Results for{" "}
            {queryParam ? (
              <span className="query-highlight">"{queryParam}"</span>
            ) : (
              "All Cattle & Sellers"
            )}
          </h1>

          <p className="ai-search-sub">
            Real-time semantic matching across Cattle attributes (Breed, Milk
            Yield, Price, Weight, Location, Delivery) and Verified Dairy Farms
            (Name, State, City, Pincode, GST).
          </p>

          {/* Refine Search Input */}
          <form className="ai-refine-form" onSubmit={handleRefineSubmit}>
            <input
              type="text"
              placeholder="Search by breed, milk yield (e.g. 20 L), price range, city, pincode, GST..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
            />
            <button type="submit">🔍 Search</button>
          </form>

          {/* AI Detected Parameter Badges */}
          {tags.length > 0 && (
            <div className="ai-tags-wrap">
              <span className="ai-tags-label">✨ AI Detected Filters:</span>
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className={`ai-tag-chip tag-${t.type || "default"}`}
                >
                  {t.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── POPULAR QUICK CHIPS ──────────────────────────── */}
      <div className="ai-suggestions-row">
        <span>Popular queries:</span>
        {POPULAR_SEARCHES.map((term, i) => (
          <button
            key={i}
            className="ai-suggestion-btn"
            onClick={() => handleQuickSearch(term)}
          >
            {term}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT & TABS ──────────────────────────── */}
      <div className="ai-search-container" id="ai-search-results-area">
        {/* Tab Navigation */}
        <div className="ai-tabs-bar">
          <button
            className={`ai-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            All Results
            <span className="ai-tab-count">{counts.total}</span>
          </button>

          <button
            className={`ai-tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => handleTabChange("products")}
          >
            🐄 Cattle & Products
            <span className="ai-tab-count">{counts.products}</span>
          </button>

          <button
            className={`ai-tab-btn ${activeTab === "sellers" ? "active" : ""}`}
            onClick={() => handleTabChange("sellers")}
          >
            🏢 Dairy Farms & Sellers
            <span className="ai-tab-count">{counts.sellers}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="ai-loading-box">
            <div className="ai-spinner"></div>
            <p style={{ color: "#64748b", fontWeight: 500 }}>
              AI is searching across products, cattle breeds, yields, and
              verified sellers...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && counts.total === 0 && (
          <div className="ai-empty-state">
            <div className="ai-empty-icon">🔍</div>
            <h3 className="ai-empty-title">No direct matches found</h3>
            <p className="ai-empty-desc">
              We couldn't find any cattle or sellers matching "
              <strong>{queryParam}</strong>". Try searching by common breed
              names like <em>Murrah</em> or <em>Gir</em>, locations like{" "}
              <em>Karnal</em>, or price ranges like <em>under 80000</em>.
            </p>
            <div className="ai-empty-actions">
              {POPULAR_SEARCHES.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  className="ai-suggestion-btn"
                  onClick={() => handleQuickSearch(p)}
                >
                  Try: {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION: CATTLE & PRODUCTS ─────────────────── */}
        {!loading &&
          (activeTab === "all" || activeTab === "products") &&
          products.length > 0 && (
            <div style={{ marginBottom: "36px" }}>
              <div className="ai-section-head">
                <h2>
                  🐄 Matching Cattle & Products (
                  {counts.products.toLocaleString()})
                </h2>
                {activeTab === "all" && counts.products > products.length && (
                  <button
                    className="ai-view-all-link"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleTabChange("products")}
                  >
                    View all {counts.products} cattle →
                  </button>
                )}
              </div>

              <div className="ai-products-grid">
                {products.map((item) => {
                  const img = getImageUrl(
                    item.featured_image || item.img,
                    DEFAULT_COW_IMG,
                  );
                  const detailSlug = item.slug || item._id;
                  const breed =
                    item.breed || item.category?.name || "Dairy Cattle";
                  const minC = item.milk_capacity_min;
                  const maxC = item.milk_capacity_max;
                  const milkStr =
                    minC && maxC
                      ? `${minC} - ${maxC} L/day`
                      : minC
                        ? `${minC}+ L/day`
                        : maxC
                          ? `Up to ${maxC} L/day`
                          : "15 - 20 L/day";

                  const weightStr = item.weight
                    ? item.weight.toString().toLowerCase().includes("kg")
                      ? item.weight
                      : `${item.weight} kg`
                    : "380–480 kg";

                  return (
                    <article
                      key={item._id || item.id}
                      className="ai-product-card"
                    >
                      <div className="ai-card-img-wrap">
                        {item.featured && (
                          <div className="ai-card-badge-top">⭐ Featured</div>
                        )}
                        <div className="ai-card-badge-breed">{breed}</div>
                        <Link to={`/pashu/${detailSlug}`}>
                          <img src={img} alt={item.name} loading="lazy" />
                        </Link>
                      </div>

                      <div className="ai-card-body">
                        <h3 className="ai-card-title">
                          <Link to={`/pashu/${detailSlug}`}>{item.name}</Link>
                        </h3>

                        <div className="ai-card-seller">
                          🏢{" "}
                          {item.seller_id?.business_name ||
                            item.seller_id?.name ||
                            "Verified Dairy Farm"}{" "}
                          • 📍{" "}
                          {item.location || item.seller_id?.city || "India"}
                        </div>

                        {/* Professional Interactive Specifications Grid */}
                        <div className="ai-specs-grid">
                          <div className="ai-spec-tile ai-tile-yield" title={`Milk Yield: ${milkStr}`}>
                            <div className="ai-tile-icon-box">🥛</div>
                            <div className="ai-tile-info">
                              <span className="ai-tile-lbl">Milk Yield</span>
                              <strong className="ai-tile-val ai-val-yield">{milkStr}</strong>
                            </div>
                          </div>
                          <div className="ai-spec-tile" title={`Breed: ${breed}`}>
                            <div className="ai-tile-icon-box">🏷️</div>
                            <div className="ai-tile-info">
                              <span className="ai-tile-lbl">Breed</span>
                              <strong className="ai-tile-val">{breed}</strong>
                            </div>
                          </div>
                          <div className="ai-spec-tile" title={`Weight: ${weightStr}`}>
                            <div className="ai-tile-icon-box">⚖️</div>
                            <div className="ai-tile-info">
                              <span className="ai-tile-lbl">Live Weight</span>
                              <strong className="ai-tile-val">{weightStr}</strong>
                            </div>
                          </div>
                          <div className="ai-spec-tile" title={`Delivery: ${item.delivery_time || "2–4 Days"}`}>
                            <div className="ai-tile-icon-box">🚚</div>
                            <div className="ai-tile-info">
                              <span className="ai-tile-lbl">Delivery</span>
                              <strong className="ai-tile-val">{item.delivery_time || "2–4 Days"}</strong>
                            </div>
                          </div>
                        </div>

                        {/* {item.description && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              margin: "4px 0 12px",
                              lineClamp: 2,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {item.description}
                          </p>
                        )} */}

                        <div className="ai-card-foot">
                          <div className="ai-card-price">
                            <span className="ai-price-label">Price</span>
                            <span className="ai-price-amount">
                              {item.price
                                ? `₹${Number(item.price).toLocaleString("en-IN")}`
                                : "Price on Call"}
                            </span>
                          </div>
                          <Link
                            to={`/pashu/${detailSlug}`}
                            className="ai-card-btn"
                          >
                            View Cattle →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

        {/* ── SECTION: DAIRY FARMS & SELLERS ─────────────── */}
        {!loading &&
          (activeTab === "all" || activeTab === "sellers") &&
          sellers.length > 0 && (
            <div style={{ marginBottom: "36px" }}>
              <div className="ai-section-head">
                <h2>
                  🏢 Matching Dairy Farms & Sellers (
                  {counts.sellers.toLocaleString()})
                </h2>
                {activeTab === "all" && counts.sellers > sellers.length && (
                  <button
                    className="ai-view-all-link"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleTabChange("sellers")}
                  >
                    View all {counts.sellers} sellers →
                  </button>
                )}
              </div>

              <div className="ai-sellers-grid">
                {sellers.map((s) => {
                  const avatar = getImageUrl(
                    s.business_image || s.avatar,
                    DEFAULT_SELLER_IMG,
                  );
                  const sellerLink = `/supplier/${slugify(s.business_name || s.username)}`;
                  const locationText =
                    [s.city, s.state].filter(Boolean).join(", ") || "India";

                  return (
                    <article key={s._id || s.id} className="ai-seller-card">
                      <div className="ai-seller-top">
                        <img
                          src={avatar}
                          alt={s.business_name || s.name}
                          className="ai-seller-avatar"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_SELLER_IMG;
                          }}
                        />
                        <div className="ai-seller-main">
                          <h3 className="ai-seller-business">
                            <Link
                              to={sellerLink}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              {s.business_name || "Dairy Farm"}
                            </Link>
                          </h3>
                          <div className="ai-seller-owner">
                            👤 Owner: <strong>{s.name || "Farmer"}</strong>
                          </div>
                          <div className="ai-seller-badges-row">
                            <span className="ai-badge-verified">
                              ✓ Verified Farm
                            </span>
                            {s.gst_number && (
                              <span className="ai-badge-gst">
                                GST: {s.gst_number}
                              </span>
                            )}
                            {s.pincode && (
                              <span className="ai-badge-gst">
                                PIN: {s.pincode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ai-seller-meta-box">
                        <div className="ai-meta-line">
                          <span>📍</span>
                          <span>
                            <strong>Location:</strong> {locationText}{" "}
                            {s.pincode ? `(${s.pincode})` : ""}
                          </span>
                        </div>
                        {s.business_address && (
                          <div className="ai-meta-line">
                            <span>🏠</span>
                            <span
                              style={{ fontSize: "12px", color: "#5c5d5f" }}
                            >
                              {s.business_address}
                            </span>
                          </div>
                        )}
                        {typeof s.product_count === "number" &&
                          s.product_count > 0 && (
                            <div className="ai-meta-line">
                              <span>🐄</span>
                              <span>
                                <strong>{s.product_count} Cattle</strong>{" "}
                                currently available
                              </span>
                            </div>
                          )}
                      </div>

                      <div className="ai-seller-foot">
                        <Link to={sellerLink} className="ai-seller-btn-outline">
                          View Farm Profile
                        </Link>
                        {s.phone ? (
                          <a
                            href={`tel:${s.phone}`}
                            className="ai-seller-btn-call"
                          >
                            📞 Call Now
                          </a>
                        ) : (
                          <Link to={sellerLink} className="ai-seller-btn-call">
                            Enquire Farm
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

        {/* ── PAGINATION CONTROLS ─────────────────────────── */}
        {!loading && activeCount > 0 && totalPages > 1 && (
          <div
            className="products-pagination-wrap"
            style={{ marginTop: "32px" }}
          >
            <div className="products-pagination-info">
              Showing <b>{startIndex}</b> to <b>{endIndex}</b> of{" "}
              <b>{activeCount.toLocaleString()}</b>{" "}
              {activeTab === "products"
                ? "cattle listings"
                : activeTab === "sellers"
                  ? "verified sellers"
                  : "total results"}{" "}
              (Page <b>{currentPage}</b> of <b>{totalPages}</b>)
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
              {getPaginationNumbers(currentPage, totalPages).map((num, idx) =>
                num === "..." ? (
                  <span key={`dots-${idx}`} className="products-page-dots">
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
    </main>
  );
}
