import { useState } from "react";
import api from "../../api/client";
export default function Contact() {
  const [msg, setMsg] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await api.post("/contact", data);
    setMsg("Thank you! We will contact you shortly.");
    e.target.reset();
  };
  return (
    <main className="contact-page">
      <div>
        <p className="eyebrow">CONTACT US</p>
        <h1>Looking for the right cattle?</h1>
        <p>Share your breed, milk capacity and budget requirement.</p>
        <h3>☎ +91 98765 43210</h3>
        <p>📍 Sohani, Kerakat, Jaunpur, Uttar Pradesh</p>
      </div>
      <form onSubmit={submit}>
        <h2>Send an enquiry</h2>
        {msg && <div className="success">{msg}</div>}
        <input name="name" placeholder="Your name" required />
        <input name="phone" placeholder="Phone number" required />
        <input name="email" type="email" placeholder="Email (optional)" />
        <input name="city" placeholder="City" />
        <textarea
          name="message"
          placeholder="Your requirement"
          required
        ></textarea>
        <button className="primary">Send Enquiry →</button>
      </form>
    </main>
  );
}
