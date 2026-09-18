import { useState, useEffect } from "react";
import api from "../../api/client";
import "./AutoRequirementModal.css";

const SUBMITTED_STORAGE_KEY = "sohani_dairy_req_submitted";
const DISMISSED_SESSION_KEY = "sohani_dairy_req_dismissed";

export default function AutoRequirementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    requirement: "",
  });

  useEffect(() => {
    // 1. Check if already submitted previously in this browser
    const alreadySubmitted = localStorage.getItem(SUBMITTED_STORAGE_KEY);
    if (alreadySubmitted === "true") {
      return;
    }

    // 2. Check if dismissed in this session
    const alreadyDismissed = sessionStorage.getItem(DISMISSED_SESSION_KEY);
    if (alreadyDismissed === "true") {
      return;
    }

    // 3. Auto-open popup after 2 seconds on page load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Remember dismissal for the session
    sessionStorage.setItem(DISMISSED_SESSION_KEY, "true");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.requirement.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/requirements", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email ? form.email.trim() : "",
        requirement: form.requirement.trim(),
      });

      // Mark permanently submitted in this browser so it NEVER pops up again
      localStorage.setItem(SUBMITTED_STORAGE_KEY, "true");
      setIsSuccess(true);

      // Auto close after 3.5s
      setTimeout(() => {
        setIsOpen(false);
      }, 3500);
    } catch (err) {
      console.error("Failed to submit requirement:", err);
      // Fallback: still save in localStorage if network error to avoid trapping user
      localStorage.setItem(SUBMITTED_STORAGE_KEY, "true");
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 3500);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="arm-overlay" onClick={handleClose}>
      <div className="arm-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="arm-header">
          <span className="arm-badge">⚡ Instant Quote & Video</span>
          <h3 className="arm-title">
            Tell us about your requirement for Dairy
          </h3>
          <p className="arm-subtitle">
            Get direct quotations, livestock milking videos & transport
            estimates
          </p>
          <button
            type="button"
            className="arm-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="arm-body">
          {isSuccess ? (
            <div className="arm-success">
              <div className="arm-success-icon">🎉</div>
              <h3>Requirement Submitted Successfully!</h3>
              <p>
                Thank you, <strong>{form.name}</strong>. Our certified dairy
                farm specialists will reach out to you via Call or WhatsApp
                shortly.
              </p>
              <button
                type="button"
                className="arm-success-btn"
                onClick={() => setIsOpen(false)}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="arm-form">
              {/* Full Name */}
              <div className="arm-field">
                <label className="arm-label">
                  Full Name <span>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="arm-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Mobile Number */}
              <div className="arm-field">
                <label className="arm-label">
                  Mobile Number <span>*</span>
                </label>
                <div className="arm-phone-wrap">
                  <span className="arm-phone-prefix">🇮🇳 +91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="arm-phone-input"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="arm-field">
                <label className="arm-label">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  className="arm-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Requirement Form / Message */}
              <div className="arm-field">
                <label className="arm-label">
                  Requirement Details <span>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="E.g. Looking for 2 HF / Sahiwal Cows with 18-20L daily yield. Delivery needed to Patna, Bihar..."
                  className="arm-textarea"
                  value={form.requirement}
                  onChange={(e) =>
                    setForm({ ...form, requirement: e.target.value })
                  }
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="arm-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting Requirement..."
                  : "✈️ Submit Requirement Now"}
              </button>

              <div className="arm-security-note">
                🔒 100% Free Service • Direct Farmer Price • No Spam
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
