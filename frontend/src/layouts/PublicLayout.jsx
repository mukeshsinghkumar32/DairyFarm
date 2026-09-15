import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import api from "../api/client";
export default function PublicLayout() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCategories(r.data.data))
      .catch(() => {});
  }, []);
  return (
    <>
      <div className="topbar">
        <span>📍 Sohani, Kerakat, Jaunpur, Uttar Pradesh</span>
        <span>☎ +91 82081 27243</span>
      </div>
      <header>
        <Link className="logo" to="/">
          <i>स</i>
          <span>
            <b>SOHANI</b>
            <small>DAIRY FARM</small>
          </span>
        </Link>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about-us">Company Profile</NavLink>
          <div className="dropdown">
            <NavLink to="/products">Our Cattle +</NavLink>
            <div>
              {categories.map((c) => (
                <Link key={c.id} to={`/products/category/${c.slug}`}>
                  {c.name}
                  <span>›</span>
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/about-us">Blogs</NavLink>
          <NavLink to="/about-us">Consultancy</NavLink>

          <Link to="/contact-us" className="admin-btn">
            Contact Us
          </Link>
        </nav>
      </header>
      <Outlet />
      <footer>
        <div>
          <Link className="logo light" to="/">
            <i>स</i>
            <span>
              <b>SOHANI</b>
              <small>DAIRY FARM</small>
            </span>
          </Link>
          <p>Healthy, high-yield dairy cattle raised with care in Jaunpur.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about-us">About Us</Link>
          <Link to="/products">Our Cattle</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Sohani, Kerakat, Jaunpur, UP</p>
          <p>+91 82081 27243</p>
        </div>
      </footer>
    </>
  );
}
