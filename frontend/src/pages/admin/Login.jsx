import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../admin.css";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(e.target.email.value, e.target.password.value);
      nav("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user) return <Navigate to="/admin" />;

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="logo">
          <i>स</i>
          <span>
            <b>SOHANI DAIRY</b>
            <small>ADMIN PORTAL</small>
          </span>
        </div>
        <h1>Admin Sign In</h1>
        <p>Enter your credentials to manage cattle listings & enquiries.</p>

        {error && (
          <div className="login-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={submit}>
          <div className="login-field">
            <label htmlFor="admin-email">Email Address</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              defaultValue="admin@sohanidairy.in"
              placeholder="admin@sohanidairy.in"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              defaultValue="Admin@123"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In to Dashboard →"}
          </button>
        </form>

        <a href="/" className="login-back-link">
          ← Return to Public Website
        </a>
      </div>
    </main>
  );
}
