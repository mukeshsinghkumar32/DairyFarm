import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSellerAuth } from "../../context/SellerAuthContext";
import "./seller.css";

export default function SellerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useSellerAuth();
  const navigate = useNavigate();

  // Reset any cached credentials when visiting the login page
  useEffect(() => {
    localStorage.removeItem("seller_token");
    localStorage.removeItem("seller_user");
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/seller/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please check your username and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-login-bg">
      <div className="seller-login-card">
        {/* Community Avatar Icon matching Screenshot 5 */}
        <div className="seller-login-icon-wrap">
          <div className="seller-login-illustration">
            👥
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(220, 53, 69, 0.95)",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "12.5px",
              marginBottom: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn}>
          <div>
            <label className="seller-login-label">Username</label>
            <input
              type="text"
              className="seller-login-input"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="seller-login-label">Password</label>
            <input
              type="password"
              className="seller-login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <label className="seller-login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me next time</span>
          </label>

          <button
            type="submit"
            className="seller-login-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Link to Dedicated Create Account Page */}
        <div style={{ marginTop: "18px", textAlign: "center" }}>
          <Link
            to="/seller/register"
            className="seller-link-btn"
            style={{ fontSize: "13px", fontWeight: "600" }}
          >
            Don't have an account? Create Account →
          </Link>
        </div>
      </div>
    </div>
  );
}
