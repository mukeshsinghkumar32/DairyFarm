import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import CowCard from "../../components/CowCard";
export default function Home() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  useEffect(() => {
    Promise.all([api.get("/products?featured=1"), api.get("/categories")])
      .then(([p, c]) => {
        setProducts(p.data.data.data || []);
        setCats(c.data.data);
      })
      .catch(() => {});
  }, []);
  return (
    <main>
      <section className="hero">
        <div>
          <p>TRUSTED CATTLE FARM • JAUNPUR</p>
          <h1>
            Healthy cattle.
            <br />
            <em>Honest relationships.</em>
          </h1>
          <span>
            Premium, farm-raised dairy cows selected for health, milk yield and
            breed quality.
          </span>
          <div>
            <Link className="primary" to="/products">
              Explore Our Cattle →
            </Link>
            <a className="outline" href="tel:+919876543210">
              ☎ Talk to Expert
            </a>
          </div>
        </div>
      </section>
      <section className="category-strip">
        <p>EXPLORE BY BREED</p>
        <div>
          {cats.map((c) => (
            <Link key={c._id} to={`/products/category/${c.slug}`}>
              <i>🐄</i>
              <b>{c.name}</b>
              <small>View cattle →</small>
            </Link>
          ))}
        </div>
      </section>
      <section className="intro">
        <div className="intro-img">
          <img
            src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1100&q=85"
            alt="Dairy cows"
          />
          <span>
            <b>8+</b>Years experience
          </span>
        </div>
        <div>
          <p className="eyebrow">WELCOME TO SOHANI DAIRY FARM</p>
          <h2>
            Raised with care.
            <br />
            Chosen with confidence.
          </h2>
          <p>
            Every animal receives balanced nutrition, clean shelter and regular
            veterinary care. We help farmers choose cattle matching their milk
            goals and budget.
          </p>
          <ul>
            <li>✓ Verified health & vaccination</li>
            <li>✓ Transparent milk-yield details</li>
            <li>✓ Expert selection guidance</li>
            <li>✓ Safe transport support</li>
          </ul>
          <Link to="/about-us">Learn more about us →</Link>
        </div>
      </section>
      <section className="listing">
        <div className="title">
          <div>
            <p className="eyebrow">OUR CATTLE</p>
            <h2>Featured dairy cattle</h2>
          </div>
          <Link to="/products">View all cattle →</Link>
        </div>
        <div className="grid">
          {products.map((p) => (
            <CowCard key={p.id} cow={p} />
          ))}
        </div>
      </section>
      <section className="why">
        <h2>Good cattle build great dairy farms.</h2>
        {[
          "Veterinary Checked",
          "Honest Yield Details",
          "Farm-Raised Care",
          "Delivery Assistance",
        ].map((x, i) => (
          <article key={x}>
            <i>{["✚", "♢", "♧", "⇢"][i]}</i>
            <h3>{x}</h3>
            <p>
              Transparent support and practical guidance for every dairy farmer.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
