import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(e.target.email.value, e.target.password.value);
      nav("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };
  if (user) return <Navigate to="/admin" />;
  return (
    <main className="login-page">
      <form onSubmit={submit}>
        <div className="logo">
          <i>स</i>
          <span>
            <b>SOHANI</b>
            <small>ADMIN PORTAL</small>
          </span>
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to manage your cattle catalogue.</p>
        {error && <div className="error">{error}</div>}
        <label>
          Email
          <input
            name="email"
            type="email"
            defaultValue="admin@sohanidairy.in"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            defaultValue="Admin@123"
            required
          />
        </label>
        <button className="primary">Sign In</button>
        <a href="/">← Return to website</a>
      </form>
    </main>
  );
}
