import { useState } from "react";

export default function ConsultationSection() {
  const [phone, setPhone] = useState("");
  const [consultMsg, setConsultMsg] = useState("");

  const handleConsult = (e) => {
    e.preventDefault();
    setConsultMsg("✅ Thank you! Our expert will call you shortly.");
    setPhone("");
    setTimeout(() => setConsultMsg(""), 4000);
  };

  return (
    <section className="dm-section consult-section">
      <div className="consult-inner">
        <div className="section-head">
          <span className="eyebrow">Expert Guidance</span>
          <h2>Talk to a Dairy Expert — Free Consultation</h2>
          <p>
            Enter your number and let our dairy specialists call you to find
            the perfect cattle for your farm
          </p>
        </div>
        {consultMsg ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--green)",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {consultMsg}
          </p>
        ) : (
          <form className="consult-form" onSubmit={handleConsult}>
            <input
              type="tel"
              placeholder="Enter your mobile number..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button type="submit">Get Expert Call →</button>
          </form>
        )}
        <p
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 12,
            color: "#000",
            fontWeight: 500,
          }}
        >
          🔒 We respect your privacy. No spam calls, ever.
        </p>
      </div>
    </section>
  );
}
