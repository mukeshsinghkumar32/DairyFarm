import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSellerAuth } from "../../context/SellerAuthContext";
import api from "../../api/client";
import StateCitySelect from "../../components/common/StateCitySelect";
import "./seller.css";

export default function SellerRegister() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    business_name: "",
    gst_number: "",
    state: "",
    city: "",
    pincode: "",
    password: "",
  });

  const [otpCode, setOtpCode] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const { updateSeller } = useSellerAuth();
  const navigate = useNavigate();

  // 60-second cooldown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Step 1: Send OTP ───────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/sellers/auth/send-register-otp", form);
      if (data.success) {
        setSuccessMsg(data.message || `Verification code sent to ${form.email}`);
        setDebugOtp(data.debugOtp || "");
        setStep("otp");
        setCountdown(60);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send verification code. Please check your information."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/sellers/auth/verify-register-otp", {
        email: form.email,
        otp: otpCode.trim(),
      });

      if (data.success) {
        localStorage.setItem("seller_token", data.token);
        localStorage.setItem("seller_user", JSON.stringify(data.user));
        updateSeller(data.user);
        setSuccessMsg("✅ Email verified! Welcome to SellerKit. Redirecting...");
        setTimeout(() => {
          navigate("/seller/dashboard");
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ─────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const { data } = await api.post("/sellers/auth/resend-otp", {
        email: form.email,
      });
      if (data.success) {
        setSuccessMsg(data.message || `New code sent to ${form.email}`);
        setDebugOtp(data.debugOtp || "");
        setCountdown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-login-bg">
      <div className="seller-login-card" style={{ maxWidth: step === "otp" ? "420px" : "540px" }}>
        {/* Community Avatar Icon */}
        <div className="seller-login-icon-wrap" style={{ marginBottom: "14px" }}>
          <div className="seller-login-illustration">
            👥
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "19px", fontWeight: "700" }}>
            {step === "otp" ? "Verify Your Email" : "Create Seller Account"}
          </h2>
          <p style={{ margin: 0, fontSize: "12.5px", opacity: 0.9 }}>
            {step === "otp"
              ? `Enter the 6-digit code sent to ${form.email}`
              : "Register your dairy farm to start selling cattle across India"}
          </p>
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

        {successMsg && (
          <div
            style={{
              background: "rgba(25, 135, 84, 0.95)",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "12.5px",
              marginBottom: "14px",
              textAlign: "center",
            }}
          >
            {successMsg}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP 1: REGISTRATION FORM WITH GST, STATE, CITY, PINCODE
            ═══════════════════════════════════════════════════════ */}
        {step === "form" && (
          <form onSubmit={handleSendOtp}>
            {/* Row 1: Full Name | Username */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "4px",
              }}
            >
              <div>
                <label className="seller-login-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="seller-login-input"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="seller-login-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  className="seller-login-input"
                  placeholder="Choose username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 2: Email | Phone */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "4px",
              }}
            >
              <div>
                <label className="seller-login-label">Email (for OTP) *</label>
                <input
                  type="email"
                  name="email"
                  className="seller-login-input"
                  placeholder="name@domain.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="seller-login-label">Phone / WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  className="seller-login-input"
                  placeholder="10-digit mobile"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 3: Farm / Business Name | GST Number */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "4px",
              }}
            >
              <div>
                <label className="seller-login-label">Farm / Business Name</label>
                <input
                  type="text"
                  name="business_name"
                  className="seller-login-input"
                  placeholder="e.g. Sohani Dairy Farm"
                  value={form.business_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="seller-login-label">GST Number</label>
                <input
                  type="text"
                  name="gst_number"
                  className="seller-login-input"
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  value={form.gst_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 4: State | City | Pincode / Zip Code */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginBottom: "4px",
              }}
            >
              <StateCitySelect
                selectedState={form.state}
                selectedCity={form.city}
                onStateChange={(st) => setForm((prev) => ({ ...prev, state: st }))}
                onCityChange={(ct) => setForm((prev) => ({ ...prev, city: ct }))}
                stateLabel="State *"
                cityLabel="City *"
                stateClassName="seller-login-input"
                cityClassName="seller-login-input"
                labelClassName="seller-login-label"
                required
              />

              <div>
                <label className="seller-login-label">Pincode / Zip *</label>
                <input
                  type="text"
                  name="pincode"
                  className="seller-login-input"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 5: Password */}
            <div style={{ marginBottom: "16px" }}>
              <label className="seller-login-label">Password *</label>
              <input
                type="password"
                name="password"
                className="seller-login-input"
                placeholder="Create password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="seller-login-btn"
              disabled={loading}
            >
              {loading ? "Sending OTP Code..." : "Send Verification Code →"}
            </button>

            <div style={{ marginTop: "18px", textAlign: "center" }}>
              <Link
                to="/seller/login"
                className="seller-link-btn"
                style={{ fontSize: "13px", fontWeight: "600" }}
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP 2: EMAIL OTP VERIFICATION
            ═══════════════════════════════════════════════════════ */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <div className="seller-otp-hint">
              <span>✉️</span> We sent a 6-digit verification code to{" "}
              <strong>{form.email}</strong>
            </div>

            {debugOtp && (
              <div
                style={{
                  background: "#fff3cd",
                  color: "#664d03",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  marginBottom: "14px",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                💡 Verification Code: <span style={{ letterSpacing: "2px" }}>{debugOtp}</span>
              </div>
            )}

            <div>
              <label className="seller-login-label" style={{ textAlign: "center" }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                className="seller-otp-input"
                maxLength={6}
                placeholder="------"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, ""))
                }
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="seller-login-btn"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <button
                type="button"
                className="seller-link-btn"
                onClick={() => {
                  setStep("form");
                  setError("");
                  setSuccessMsg("");
                }}
              >
                ← Edit Details
              </button>

              <button
                type="button"
                className="seller-link-btn"
                disabled={countdown > 0 || loading}
                onClick={handleResend}
                style={{ opacity: countdown > 0 ? 0.6 : 1 }}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
