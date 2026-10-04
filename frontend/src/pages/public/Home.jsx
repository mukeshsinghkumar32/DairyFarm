import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/client";
import SEO from "../../components/common/SEO";
import {
  HeroSection,
  BreedsSection,
  CtaBannerSection,
  SuppliersSection,
  FeaturedCattleSection,
  ConsultationSection,
  DairyProductsSection,
  HowWeWorkSection,
  BlogSection,
} from "../../components/home";

export default function Home() {
  const outletCtx = useOutletContext();
  const outletCats = outletCtx?.categories || [];

  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [cats, setCats] = useState(outletCats);

  useEffect(() => {
    if (outletCats && outletCats.length > 0) {
      setCats(outletCats);
    }
  }, [outletCats]);

  useEffect(() => {
    // Dynamic binding: fetch products
    api
      .get("/products?featured=1&per_page=10")
      .then((p) => {
        setProducts(p.data.data?.data || p.data?.data || []);
      })
      .catch(() => {});

    // Dynamic binding: fetch active verified sellers
    api
      .get("/sellers?status=active&per_page=12")
      .then((s) => {
        setSellers(s.data.data?.data || s.data?.data || []);
      })
      .catch(() => {});

    // Dynamic binding: fetch categories if not provided by outlet
    if (!outletCats || outletCats.length === 0) {
      api
        .get("/categories")
        .then((c) => setCats(c.data.data || []))
        .catch(() => {});
    }
  }, []);

  return (
    <main className="pashudairy-home">
      <SEO
        title="PASHUDAIRY — Buy & Sell High-Quality Dairy Animals with Confidence"
        description="India's trusted dairy marketplace. Connect directly with verified farmers and dairy sellers across India. Find healthy cows, buffaloes, milk products, feed, fodder and dairy equipment."
        keywords="dairy farm India, pashu dairy, buy cow online, HF cow price, Murrah buffalo for sale, Sahiwal cow, Gir cow, dairy livestock suppliers, certified cattle"
      />

      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. EXPLORE BY CATEGORY */}
      <BreedsSection cats={cats} />

      {/* 3. GREEN CALLOUT PROMO BANNER */}
      <CtaBannerSection />

      {/* 4. FEATURED SELLERS — Top Verified Dairy Suppliers Across India (3x3 Grid) */}
      <SuppliersSection sellers={sellers} />

      {/* 5. FEATURED PRODUCTS — Premium Dairy Products & Supplies (5 Cards Grid) */}
      <FeaturedCattleSection products={products} />

      {/* 6. EXPERT ADVICE — Talk to a Dairy Expert Consultation Banner */}
      <ConsultationSection />

      {/* 7. DAIRY PRODUCTS — Fresh Milk, Trusted Quality to Every Home (5 Cards Grid) */}
      <DairyProductsSection />

      {/* 8. WHY PASHUDAIRY — How We Help Farmers Grow & 2x2 Stats Grid */}
      <HowWeWorkSection />

      {/* 9. LATEST BLOG — 4 Farming Blog Cards */}
      <BlogSection />
    </main>
  );
}
