import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import DashboardHome from "./DashboardHome";
import Products from "./Products";
import Categories from "./Categories";
import Enquiries from "./Enquiries";

const MENUS = [
  ["dashboard", "▦ Dashboard"],
  ["categories", "◫ Categories"],
  ["products", "♙ Cow Listings"],
  ["enquiries", "✉ Enquiries"],
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Derive active tab from URL: /admin/products → "products"
  const rawTab = pathname.split("/").pop();
  const tab = !rawTab || rawTab === "admin" ? "dashboard" : rawTab;

  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  // Refs to expose "open add form" actions from child pages
  const productsRef = useRef(null);
  const categoriesRef = useRef(null);

  const load = async () => {
    try {
      const [d, p, c, e] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/products"),
        api.get("/admin/categories"),
        api.get("/admin/enquiries"),
      ]);
      setStats(d.data.data ?? {});
      setProducts(p.data.data?.data ?? []);
      setCategories(c.data.data ?? []);
      setEnquiries(e.data.data?.data ?? []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tabLabel = MENUS.find(([k]) => k === tab)?.[1]?.replace(/^.+? /, "") ?? "Dashboard";

  return (
    <main className="admin-shell">
      <aside>
        <div className="logo light">
          <i>स</i>
          <span>
            <b>SOHANI</b>
            <small>ADMIN PANEL</small>
          </span>
        </div>
        {MENUS.map(([k, l]) => (
          <button
            className={tab === k ? "active" : ""}
            key={k}
            onClick={() => navigate(`/admin/${k}`)}
          >
            {l}
          </button>
        ))}
        <div className="admin-user">
          <b>{user?.name}</b>
          <small>Administrator</small>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>

      <section className="admin-content">
        <header>
          <div>
            <small>Welcome back, {user?.name}</small>
            <h1>{tabLabel}</h1>
          </div>
          {tab === "products" && (
            <button
              className="primary"
              onClick={() => productsRef.current?.openAdd()}
            >
              ＋ Add New Cow
            </button>
          )}
          {tab === "categories" && (
            <button
              className="primary"
              onClick={() => categoriesRef.current?.openAdd(categories.length)}
            >
              ＋ Add Category
            </button>
          )}
        </header>

        {tab === "dashboard" && (
          <DashboardHome stats={stats} products={products} reload={load} />
        )}
        {tab === "products" && (
          <Products
            ref={productsRef}
            products={products}
            categories={categories}
            reload={load}
          />
        )}
        {tab === "categories" && (
          <Categories
            ref={categoriesRef}
            categories={categories}
            reload={load}
          />
        )}
        {tab === "enquiries" && (
          <Enquiries enquiries={enquiries} reload={load} />
        )}
      </section>
    </main>
  );
}
