import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import DashboardHome from "./DashboardHome";
import Products from "./Products";
import Categories from "./Categories";
import Enquiries from "./Enquiries";
import Requirements from "./Requirements";
import ContactUs from "./ContactUs";
import SupplierInquiries from "./SupplierInquiries";
import Sellers from "./Sellers";
import "../../admin.css";

const MENUS = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "sellers", label: "Sellers", icon: "👥" },
  { key: "categories", label: "Categories", icon: "📁" },
  { key: "products", label: "Cow Listings", icon: "🐄" },
  { key: "enquiries", label: "Price Inquiries", icon: "⚡" },
  { key: "supplier-inquiries", label: "Supplier Inquiries", icon: "🏢" },
  { key: "requirements", label: "Requirements", icon: "📋" },
  { key: "contacts", label: "Contact Us", icon: "📞" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive active tab from URL: /admin/products → "products"
  const rawTab = pathname.split("/").pop();
  const tab = !rawTab || rawTab === "admin" ? "dashboard" : rawTab;

  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [supplierInquiries, setSupplierInquiries] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refs to expose "open add form" actions from child pages
  const productsRef = useRef(null);
  const categoriesRef = useRef(null);
  const sellersRef = useRef(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard");
      setStats(res.data.data ?? {});
    } catch (err) {
      console.error("Dashboard stats load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      const res = await api.get("/admin/sellers");
      setSellers(res.data.data?.data ?? []);
    } catch (err) {
      console.error("Sellers load error:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data.data?.data ?? []);
    } catch (err) {
      console.error("Products load error:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/admin/categories");
      setCategories(res.data.data ?? []);
    } catch (err) {
      console.error("Categories load error:", err);
    }
  };

  const loadEnquiries = async () => {
    try {
      const res = await api.get("/admin/enquiries");
      setEnquiries(
        res.data.data?.data ??
          (Array.isArray(res.data.data) ? res.data.data : []),
      );
    } catch (err) {
      console.error("Enquiries load error:", err);
    }
  };

  const loadRequirements = async () => {
    try {
      const res = await api.get("/admin/requirements");
      setRequirements(
        res.data.data?.data ??
          (Array.isArray(res.data.data) ? res.data.data : []),
      );
    } catch (err) {
      console.error("Requirements load error:", err);
    }
  };

  const loadContacts = async () => {
    try {
      const res = await api.get("/admin/contacts");
      setContacts(
        res.data.data?.data ??
          (Array.isArray(res.data.data) ? res.data.data : []),
      );
    } catch (err) {
      console.error("Contacts load error:", err);
    }
  };

  const loadSupplierInquiries = async () => {
    try {
      const res = await api.get("/admin/supplier-inquiries");
      setSupplierInquiries(
        res.data.data?.data ??
          (Array.isArray(res.data.data) ? res.data.data : []),
      );
    } catch (err) {
      console.error("Supplier inquiries load error:", err);
    }
  };

  // Only load data needed for the currently active tab
  useEffect(() => {
    if (tab === "dashboard") {
      loadDashboard();
      loadProducts();
    } else if (tab === "sellers") {
      loadSellers();
    } else if (tab === "products") {
      loadProducts();
      loadCategories();
    } else if (tab === "categories") {
      loadCategories();
    } else if (tab === "enquiries") {
      loadEnquiries();
    } else if (tab === "supplier-inquiries") {
      loadSupplierInquiries();
    } else if (tab === "requirements") {
      loadRequirements();
    } else if (tab === "contacts") {
      loadContacts();
    }
  }, [tab]);

  const activeMenu = MENUS.find((m) => m.key === tab);
  const tabLabel = activeMenu ? activeMenu.label : "Dashboard";

  const handleNav = (key) => {
    navigate(`/admin/${key}`);
    setMobileOpen(false);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  return (
    <div className="admin-shell">
      {/* Mobile Top Bar */}
      <div className="admin-mobile-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="admin-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open Navigation"
          >
            ☰
          </button>
          <div
            style={{
              fontWeight: 800,
              fontSize: "16px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ color: "#ff7600" }}>SOHANI</span> ADMIN
          </div>
        </div>
        <button
          type="button"
          className="admin-mobile-logout"
          onClick={logout}
          title="Logout"
        >
          Logout
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {mobileOpen && (
        <div className="admin-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-text" style={{ textAlign: "center" }}>
            <small>Admin Control Panel</small>
          </div>
          {mobileOpen && (
            <button
              type="button"
              className="admin-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close Navigation"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="admin-nav-section">
          <div className="admin-nav-label">Main Menu</div>
          {MENUS.map((m) => (
            <button
              key={m.key}
              className={`admin-nav-btn ${tab === m.key ? "active" : ""}`}
              onClick={() => handleNav(m.key)}
            >
              <span className="nav-icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}

          <div
            style={{
              marginTop: "auto",
              paddingTop: "16px",
              borderTop: "1px solid #1e293b",
            }}
          >
            <div className="admin-nav-label">Quick Links</div>
            <Link to="/" target="_blank" className="admin-website-link">
              <span>🌐</span>
              <span>View Public Website ↗</span>
            </Link>
          </div>
        </nav>

        {/* User Footer */}
        <div className="admin-user-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">{userInitial}</div>
            <div className="admin-user-details">
              <b>{user?.name || "Administrator"}</b>
              <small>Active Session</small>
            </div>
          </div>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={logout}
            title="Sign out of Admin"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        

        {tab === "dashboard" && (
          <DashboardHome
            stats={stats}
            products={products}
            reload={loadDashboard}
            loading={loading}
          />
        )}
        {tab === "sellers" && (
          <Sellers ref={sellersRef} sellers={sellers} reload={loadSellers} />
        )}
        {tab === "products" && (
          <Products
            ref={productsRef}
            products={products}
            categories={categories}
            reload={loadProducts}
          />
        )}
        {tab === "categories" && (
          <Categories
            ref={categoriesRef}
            categories={categories}
            reload={loadCategories}
          />
        )}
        {tab === "enquiries" && (
          <Enquiries enquiries={enquiries} reload={loadEnquiries} />
        )}
        {tab === "supplier-inquiries" && (
          <SupplierInquiries
            inquiries={supplierInquiries}
            reload={loadSupplierInquiries}
          />
        )}
        {tab === "requirements" && (
          <Requirements requirements={requirements} reload={loadRequirements} />
        )}
        {tab === "contacts" && (
          <ContactUs contacts={contacts} reload={loadContacts} />
        )}
      </main>
    </div>
  );
}
