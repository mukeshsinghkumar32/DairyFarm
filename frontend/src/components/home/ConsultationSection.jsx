import { Link } from "react-router-dom";

export default function ConsultationSection() {
  return (
    <section className="pd-consult-sec">
      <div className="pashu-container">
        <div className="pd-consult-banner">
          <div className="pd-consult-img">
            <img
              src="/assets/vet-cow-consult.jpg"
              alt="Veterinary Dairy Cow Doctor Consultation"
              loading="lazy"
            />
          </div>
          <div className="pd-consult-body">
            <span className="pd-consult-tag">EXPERT ADVICE</span>
            <h2 className="pd-consult-title">
              Talk to a Dairy Expert – Free Consultation
            </h2>
            <p className="pd-consult-desc">
              Get professional advice on animal health, nutrition, breeding and
              dairy management from our certified experts.
            </p>
            <Link to="/consultancy" className="pd-btn-consult">
              Book Free Consultation &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
