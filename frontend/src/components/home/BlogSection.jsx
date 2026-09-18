import { Link } from "react-router-dom";

export const BLOGS = [
  {
    id: 1,
    tag: "Dairy Farming",
    date: "Sep 10, 2026",
    title: "Dairy Farming Business Plan – Complete Guide for Beginners",
    excerpt:
      "Starting a dairy farm requires proper planning, breed selection, and capital. Here's a comprehensive guide to help you get started right.",
    img: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=500&q=80",
  },
  {
    id: 2,
    tag: "Cow Breeds",
    date: "Sep 5, 2026",
    title: "HF vs Gir Cow Milk – Which is Healthiest?",
    excerpt:
      "Comparing Holstein Friesian and Gir cow milk nutritional profiles, yield potential, and suitability for different farming operations.",
    img: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&q=80",
  },
  {
    id: 3,
    tag: "Buffalo Care",
    date: "Aug 28, 2026",
    title: "Monsoon Farm Tips for Murrah Buffalos",
    excerpt:
      "During monsoon, buffalos need special care and nutrition. Follow these expert-recommended tips for maximum productivity in rainy season.",
    img: "https://images.unsplash.com/photo-1501706362039-c06b2d715385?w=500&q=80",
  },
];

export default function BlogSection({ blogs = BLOGS }) {
  const displayBlogs = blogs && blogs.length > 0 ? blogs : BLOGS;

  return (
    <section className="dm-section blog-section">
      <div className="section-inner">
        <div className="section-head">
          <span className="eyebrow">Knowledge Hub</span>
          <h2>Latest Blog</h2>
          <p>
            Expert tips, farming guides, and breed information to help you
            succeed in dairy farming.
          </p>
        </div>
        <div className="blog-grid">
          {displayBlogs.map((blog) => (
            <Link to="/blogs" className="blog-card" key={blog.id}>
              <div className="blog-card-img">
                <img src={blog.img} alt={blog.title} loading="lazy" />
              </div>
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span className="blog-tag">{blog.tag}</span>
                  <span className="blog-date">📅 {blog.date}</span>
                </div>
                <h3>{blog.title}</h3>
                <p>{blog.excerpt}</p>
                <span className="blog-read-more">Read More →</span>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link className="btn-orange" to="/blogs">
            View All Articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
