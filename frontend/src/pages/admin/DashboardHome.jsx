import { useNavigate } from "react-router-dom";
import AdminTable from "./AdminTable";

export default function DashboardHome({ stats, products, loading }) {
  const navigate = useNavigate();

  const statItems = [
    {
      title: "Total Cattle",
      value: stats.total_products ?? 0,
      icon: "🐄",
      colorClass: "orange",
      hint: "Registered in database",
      onClick: () => navigate("/admin/products"),
    },
    {
      title: "Active Sellers",
      value: stats.total_sellers ?? 0,
      icon: "👥",
      colorClass: "purple",
      hint: "Registered dairy farms",
      onClick: () => navigate("/admin/sellers"),
    },
    {
      title: "Price Inquiries",
      value: stats.total_enquiries ?? 0,
      icon: "⚡",
      colorClass: "amber",
      hint: `${stats.new_enquiries ?? 0} new product inquiries`,
      onClick: () => navigate("/admin/enquiries"),
    },
    {
      title: "Supplier Inquiries",
      value: stats.total_supplier_inquiries ?? 0,
      icon: "🏢",
      colorClass: "blue",
      hint: `${stats.new_supplier_inquiries ?? 0} new supplier inquiries`,
      onClick: () => navigate("/admin/supplier-inquiries"),
    },
    {
      title: "Requirements",
      value: stats.total_requirements ?? 0,
      icon: "📋",
      colorClass: "purple",
      hint: `${stats.new_requirements ?? 0} new popup requirements`,
      onClick: () => navigate("/admin/requirements"),
    },
    {
      title: "Contact Messages",
      value: stats.total_contacts ?? 0,
      icon: "📞",
      colorClass: "green",
      hint: `${stats.new_contacts ?? 0} new contact messages`,
      onClick: () => navigate("/admin/contacts"),
    },
  ];

  return (
    <div>
      {/* KPI Stats Grid */}
      <div className="admin-stats-grid">
        {statItems.map((item) => (
          <div
            key={item.title}
            className="admin-stat-card"
            onClick={item.onClick}
            style={{ cursor: item.onClick ? "pointer" : "default" }}
          >
            <div className={`admin-stat-icon ${item.colorClass}`}>
              {item.icon}
            </div>
            <div className="admin-stat-data">
              <small>{item.title}</small>
              <b>{loading ? "..." : item.value}</b>
              <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                {item.hint}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Listings Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Recent Cattle Listings</h2>
            <small style={{ color: "#64748b", fontSize: "12px" }}>
              Latest cattle records added to the marketplace
            </small>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#ff7600",
              fontWeight: 700,
              fontSize: "13px",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            View All ({products?.length || 0}) →
          </button>
        </div>

        <AdminTable
          products={(products ?? []).slice(0, 5)}
          readOnly
        />
      </div>
    </div>
  );
}
