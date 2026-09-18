import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSellerAuth } from "../../context/SellerAuthContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./seller.css";

export default function SellerLayout() {
  const { seller, logout } = useSellerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(true);
  const [userDropdown, setUserDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/seller/login");
  };

  const isProductsActive = location.pathname.startsWith("/seller/products");

  return (
    <div className="seller-app-wrapper">
      {/* ─── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`seller-sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
        <Link to="/seller/dashboard" className="seller-sidebar-brand">
          <h2>SellerKit</h2>
        </Link>

        <div className="seller-sidebar-nav">
          <div className="seller-nav-group-label">User Managing System</div>

          {/* Dashboard */}
          <NavLink
            to="/seller/dashboard"
            className={({ isActive }) =>
              `seller-nav-link ${isActive ? "active" : ""}`
            }
          >
            <div className="seller-nav-link-content">
              <span className="seller-nav-icon">📊</span>
              <span>Dashboard</span>
            </div>
          </NavLink>

          {/* Products (Expandable) */}
          <div>
            <button
              type="button"
              className={`seller-nav-link ${isProductsActive ? "active" : ""}`}
              onClick={() => setProductsOpen((prev) => !prev)}
            >
              <div className="seller-nav-link-content">
                <span className="seller-nav-icon">🏷️</span>
                <span>Products</span>
              </div>
              <span className={`seller-nav-arrow ${productsOpen ? "open" : ""}`}>
                ▶
              </span>
            </button>

            {productsOpen && (
              <div className="seller-submenu">
                <NavLink
                  to="/seller/products/add"
                  className={({ isActive }) =>
                    `seller-submenu-item ${isActive ? "active" : ""}`
                  }
                >
                  <span>➔</span>
                  <span>Add Product</span>
                </NavLink>

                <NavLink
                  to="/seller/products/manage"
                  className={({ isActive }) =>
                    `seller-submenu-item ${isActive ? "active" : ""}`
                  }
                >
                  <span>➔</span>
                  <span>Manage Products</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Banner */}
          <NavLink
            to="/seller/banner"
            className={({ isActive }) =>
              `seller-nav-link ${isActive ? "active" : ""}`
            }
          >
            <div className="seller-nav-link-content">
              <span className="seller-nav-icon">🖼️</span>
              <span>Banner</span>
            </div>
          </NavLink>

          {/* About Us */}
          <NavLink
            to="/seller/about-us"
            className={({ isActive }) =>
              `seller-nav-link ${isActive ? "active" : ""}`
            }
          >
            <div className="seller-nav-link-content">
              <span className="seller-nav-icon">🎛️</span>
              <span>About Us</span>
            </div>
          </NavLink>

          {/* Contact */}
          <NavLink
            to="/seller/contact"
            className={({ isActive }) =>
              `seller-nav-link ${isActive ? "active" : ""}`
            }
          >
            <div className="seller-nav-link-content">
              <span className="seller-nav-icon">🎛️</span>
              <span>Contact</span>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* ─── MAIN LAYOUT AREA ─────────────────────────────────── */}
      <div className="seller-main-layout">
        {/* Top Navbar */}
        <header className="seller-topbar">
          <button
            className="seller-toggle-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
            title="Toggle Sidebar"
          >
            ☰
          </button>

          <div className="seller-topbar-right">
            {/* Notification bell with badge 4 */}
            <button className="seller-topbar-icon-btn" title="Notifications">
              🔔
              <span className="seller-badge">4</span>
            </button>

            {/* Chat bubble icon */}
            <button className="seller-topbar-icon-btn" title="Messages">
              💬
            </button>

            {/* User Profile */}
            <div
              className="seller-user-dropdown"
              onClick={() => setUserDropdown((prev) => !prev)}
            >
              <img
                src={getImageUrl(
                  seller?.business_image || seller?.avatar,
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
                )}
                alt="Seller Avatar"
                className="seller-user-avatar"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";
                }}
              />
              <span className="seller-user-name">
                {seller?.name || seller?.business_name || "Seller"}
              </span>
              <span style={{ fontSize: "11px", color: "#6c757d" }}>▾</span>

              {userDropdown && (
                <div className="seller-dropdown-menu">
                  <button
                    className="seller-dropdown-item"
                    onClick={() => {
                      setUserDropdown(false);
                      navigate("/seller/dashboard");
                    }}
                  >
                    <span>📊</span> Dashboard
                  </button>
                  <Link
                    to="/"
                    target="_blank"
                    className="seller-dropdown-item"
                    onClick={() => setUserDropdown(false)}
                  >
                    <span>🌐</span> View Website ↗
                  </Link>
                  <div
                    style={{
                      height: "1px",
                      background: "#e9ecef",
                      margin: "4px 0",
                    }}
                  />
                  <button
                    className="seller-dropdown-item"
                    style={{ color: "#dc3545" }}
                    onClick={handleLogout}
                  >
                    <span>🚪</span> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="seller-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
