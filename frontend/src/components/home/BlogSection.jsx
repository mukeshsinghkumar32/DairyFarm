import { Link } from "react-router-dom";

const BLOG_POSTS = [
  {
    id: 1,
    category: "Dairy Farming",
    badgeClass: "farming",
    title: "How to Increase Milk Production in Dairy Cows",
    excerpt:
      "Learn practical tips to improve milk yield, nutrition and overall herd health.",
    image:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80",
    slug: "how-to-increase-milk-production",
  },
  {
    id: 2,
    category: "Animal Health",
    badgeClass: "health",
    title: "Common Diseases in Buffaloes and How to Prevent Them",
    excerpt:
      "Protect your herd with early detection, vaccination and proper care.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    slug: "common-diseases-in-buffaloes",
  },
  {
    id: 3,
    category: "Feed & Nutrition",
    badgeClass: "feed",
    title: "Best Feed Formulas for High Milk Yield",
    excerpt:
      "Balanced nutrition for better production and improved animal health.",
    image:
      "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&q=80",
    slug: "best-feed-formulas-for-high-yield",
  },
  {
    id: 4,
    category: "Dairy Equipment",
    badgeClass: "equipment",
    title: "Choosing the Right Milking Machine for Your Farm",
    excerpt:
      "Features, types and buying guide for efficient milking.",
    image:
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80",
    slug: "choosing-right-milking-machine",
  },
];

export default function BlogSection() {
  return (
    <section className="pd-blog-sec">
      <div className="pashu-container">
        <div className="pd-section-header">
          <span className="pd-section-tag">LATEST BLOG</span>
          <h2 className="pd-section-title">Latest Dairy Farming Blog</h2>
          <p className="pd-section-sub">
            Tips, guides and expert advice for a healthier herd and higher profits.
          </p>
        </div>

        <div className="pd-blogs-grid">
          {BLOG_POSTS.map((blog) => (
            <Link
              key={blog.id}
              to={`/blogs#${blog.slug}`}
              className="pd-blog-card"
            >
              <div className="pd-blog-thumb">
                <img src={blog.image} alt={blog.title} loading="lazy" />
              </div>
              <div className="pd-blog-body">
                <span className={`pd-blog-badge ${blog.badgeClass}`}>
                  {blog.category}
                </span>
                <h3 className="pd-blog-title">{blog.title}</h3>
                <p className="pd-blog-excerpt">{blog.excerpt}</p>
                <span className="pd-blog-link">Read More &rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="pd-btn-center-wrap">
          <Link to="/blogs" className="pd-btn-view-all">
            View All Blogs &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
