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
  RegionsSection,
  HowWeWorkSection,
  PrimarySellersSection,
  BlogSection,
} from "../../components/home";

export default function Home() {
  const outletCtx = useOutletContext();
  const outletCats = outletCtx?.categories || [];

  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [primarySellers, setPrimarySellers] = useState([]);
  const [cats, setCats] = useState(outletCats);

  useEffect(() => {
    if (outletCats && outletCats.length > 0) {
      setCats(outletCats);
    }
  }, [outletCats]);

  useEffect(() => {
    api
      .get("/products?featured=1")
      .then((p) => {
        setProducts(p.data.data?.data || []);
      })
      .catch(() => {});

    api
      .get("/sellers?featured=1&per_page=12")
      .then((s) => {
        setSellers(s.data.data?.data || s.data?.data || []);
      })
      .catch(() => {});

    api
      .get("/sellers?status=active&per_page=12")
      .then((s) => {
        setPrimarySellers(s.data.data?.data || s.data?.data || []);
      })
      .catch(() => {});

    if (!outletCats || outletCats.length === 0) {
      api
        .get("/categories")
        .then((c) => setCats(c.data.data || []))
        .catch(() => {});
    }
  }, []);

  return (
    <main>
      <SEO
        title="Sohani Dairy Farm — Healthy Cattle, Honest Service"
        description="India's leading dairy cattle marketplace. Explore certified HF Cows, Murrah Buffaloes, Sahiwal, Gir, and Tharparkar cows directly from verified dairy farmers and breeders across India."
        keywords="dairy farm India, buy cow online, HF cow price, Murrah buffalo for sale, Sahiwal cow, Gir cow, Jaunpur dairy farm, dairy livestock suppliers, certified cattle"
      />
      {/* 1. HERO BANNER */}
      <HeroSection />

      {/* 2. LAUNCH STRIP — Breed Categories */}
      <BreedsSection cats={cats} />

      {/* 3. GREEN CTA BANNER */}
      <CtaBannerSection />

      {/* 4. MEET OUR TRUSTED SUPPLIERS */}
      <SuppliersSection sellers={sellers} />

      {/* 5. MAXIMIZE PROFITS — Premium Listings */}
      {products && products.length > 0 && (
        <FeaturedCattleSection products={products} />
      )}

      {/* 6. CONSULTATION CTA */}
      <ConsultationSection />

      {/* 7. EXPLORE REGIONS — All States */}
      <RegionsSection />

      {/* 8. HOW WE WORK — Stats */}
      <HowWeWorkSection />

      {/* 9. PRIMARY SELLERS — Professional Design */}
      <PrimarySellersSection sellers={primarySellers} />

      {/* 10. LATEST BLOG */}
      <BlogSection />
    </main>
  );
}
