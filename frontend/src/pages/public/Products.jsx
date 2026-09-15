import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
import CowCard from "../../components/CowCard";
export default function Products() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("All Available Cattle");
  useEffect(() => {
    const url = slug ? `/categories/${slug}/products` : "/products";
    api
      .get(url)
      .then((r) => {
        setProducts(r.data.data.data || []);
        if (r.data.category) setTitle(r.data.category.name);
      })
      .catch(() => setProducts([]));
  }, [slug]);
  return (
    <main className="page">
      <div className="page-head">
        <p>SOHANI DAIRY FARM</p>
        <h1>{title}</h1>
        <span>Healthy, vaccinated and carefully selected dairy cattle.</span>
      </div>
      <div className="listing">
        <div className="grid">
          {products.map((p) => (
            <CowCard key={p.id} cow={p} />
          ))}
        </div>
        {!products.length && (
          <p className="empty">No cattle found in this category.</p>
        )}
      </div>
    </main>
  );
}
