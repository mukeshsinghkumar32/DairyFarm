import { useState } from "react";
import { useSellerAuth } from "../../context/SellerAuthContext";
import api from "../../api/client";

export default function SellerContact() {
  const { seller, updateSeller } = useSellerAuth();
  const [phone, setPhone] = useState(seller?.phone || "8853317611");
  const [email, setEmail] = useState(seller?.email || "Mukeshsinghkumar32@gmail.com");
  const [address, setAddress] = useState(
    seller?.business_address || "Madurai, Maduranthakam, Chengalpattu, Tamil Nadu, India"
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const { data } = await api.put("/sellers/profile", {
        phone,
        email,
        business_address: address,
      });
      if (data.success) {
        updateSeller(data.user);
        setMsg("✅ Contact details updated successfully!");
      }
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Failed to update contact."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="seller-page-header">
        <h1 className="seller-page-title">Contact & Location Settings</h1>
      </div>

      {msg && (
        <div
          style={{
            padding: "8px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "16px",
            background: msg.startsWith("✅") ? "#d1e7dd" : "#f8d7da",
            color: msg.startsWith("✅") ? "#0f5132" : "#842029",
          }}
        >
          {msg}
        </div>
      )}

      <div className="seller-card">
        <div className="seller-card-header">Manage Contact Information</div>
        <div className="seller-card-body">
          <form onSubmit={handleSave} style={{ maxWidth: "600px" }}>
            <div className="seller-form-group">
              <label className="seller-form-label">Phone / WhatsApp Number</label>
              <input
                type="text"
                className="seller-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Contact Email</label>
              <input
                type="email"
                className="seller-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Farm / Dairy Location Address</label>
              <textarea
                className="seller-input"
                style={{ height: "90px", paddingTop: "8px" }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                type="submit"
                className="btn-seller-dark"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Contact Info"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
