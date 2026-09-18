import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/common/SEO";
import "./Blog.css";

const ARTICLES = [
  {
    id: 1,
    title: "HF vs Sahiwal: Which Breed is Right for Your Dairy Farm?",
    excerpt:
      "Choosing between HF and Sahiwal is one of the most common questions new dairy farmers face. Both are excellent milk producers — but they suit very different farming conditions. HF cows can produce 20–30 litres per day in ideal conditions but require controlled housing, quality feed and regular veterinary attention. Sahiwal, on the other hand, is hardy, well-adapted to Indian climates, and produces 10–15 litres per day with far less intensive management. For small and mid-scale farmers in rural UP or Bihar without a climate-controlled shed, Sahiwal is often the smarter long-term choice.",
    tag: "Breed Guide",
    date: "September 10, 2026",
    readTime: "5 min read",
    author: "Ram Prakash Singh",
    image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "5 Signs Your Dairy Cow Is Healthy — A Practical Checklist",
    excerpt:
      "Whether you're buying a new animal or checking on your existing herd, knowing the signs of good cattle health can save you lakhs in vet bills. A healthy cow has bright, clear eyes with no discharge; a smooth, shiny coat without bald patches or skin infections; firm, well-shaped hooves without lameness; regular appetite and consistent daily rumination (8+ hours); and consistent milk yield with no sudden drops. Always check the udder for swelling, heat or abnormal discharge — mastitis is one of the most common and costly dairy farm diseases, but it's highly preventable with regular inspection.",
    tag: "Cattle Health",
    date: "August 28, 2026",
    readTime: "4 min read",
    author: "Dr. Vinod Mishra",
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "How to Maximise Milk Yield from Your Dairy Cow",
    excerpt:
      "Milk yield is determined by three primary factors: genetics, nutrition and management. While genetics are fixed at purchase, nutrition and management are entirely in the farmer's hands. A high-yielding dairy cow needs 3–4 kg of concentrate feed per 10 litres of milk produced, plus access to fresh green fodder and clean water throughout the day. Feeding timing matters too — twice-daily feeding around milking time boosts production by 15–20% compared to single daily feeding. Regular deworming every 3 months, prompt mastitis treatment, and stress-free handling all contribute significantly to sustained high yield over the cow's productive years.",
    tag: "Farm Management",
    date: "August 15, 2026",
    readTime: "6 min read",
    author: "Ram Prakash Singh",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Murrah Buffalo vs HF Cow: Profitability & Fat Percentage Comparison",
    excerpt:
      "For commercial dairy operations in North India, selecting between high-volume HF cows and high-fat Murrah buffaloes is critical. Murrah milk commands premium market rates (7-8% SNF and 7-9% Fat), fetching significantly higher per-litre returns from local sweetmakers and dairies. HF cows offer massive volume (25-30+ L/day) at lower fat (3.5-4%). Discover which livestock matches your local milk procurement model.",
    tag: "Breed Guide",
    date: "August 02, 2026",
    readTime: "5 min read",
    author: "Dr. Vinod Mishra",
    image: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Essential Vaccination Calendar for Dairy Cattle in UP & Bihar",
    excerpt:
      "Disease prevention is ten times cheaper than veterinary treatment. Follow our veterinary-approved schedule for Foot & Mouth Disease (FMD), Haemorrhagic Septicaemia (HS), and Black Quarter (BQ). Learn the exact pre-monsoon and post-monsoon timings to safeguard your high-value milking cows and pregnant heifers.",
    tag: "Cattle Health",
    date: "July 20, 2026",
    readTime: "4 min read",
    author: "Dr. Vinod Mishra",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Modern Dairy Shed Design: Ventilation, Flooring & Heat Stress Control",
    excerpt:
      "Heat stress can slash daily milk yields by up to 30% during May and June. Discover cost-effective shed modifications: ridge ventilation, rubber mats, mist cooling fans, and correct east-west orientation that maintain high milk production through North India's harshest summers.",
    tag: "Farm Management",
    date: "July 08, 2026",
    readTime: "6 min read",
    author: "Ram Prakash Singh",
    image: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80",
  },
];

const TAGS = ["All", "Breed Guide", "Cattle Health", "Farm Management"];

export default function Blog() {
  const [activeTag, setActiveTag] = useState("All");
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState("");

  const filtered =
    activeTag === "All"
      ? ARTICLES
      : ARTICLES.filter((a) => a.tag === activeTag);

  return (
    <main className="blog-main">
      <SEO
        title="Dairy Farming Blogs, Cattle Breed Guides & Veterinary Advice"
        description="Practical veterinary guides, cattle breed comparisons (HF vs Sahiwal, Murrah vs HF), vaccination schedules, and milk-yield maximization tips for Indian dairy farmers."
        keywords="dairy farming blog India, HF cow guide, Sahiwal cow care, Murrah buffalo milk yield, cattle vaccination schedule, dairy shed management"
      />
      {/* 1. HERO */}
      <section className="blog-hero">
        <div className="blog-hero-container">
          <div className="blog-badge">
            <span>📚</span>
            <span>Dairy Farming Insights</span>
          </div>
          <h1>Knowledge to Grow Your Dairy Farm</h1>
          <p>
            Expert veterinary and farmer-tested advice on cattle breeds, disease
            prevention, nutritional feed formulation, and modern shed management.
          </p>
        </div>
      </section>

      {/* 2. INTRO */}
      <section className="blog-intro-section">
        <div className="blog-intro-container">
          <p className="blog-eyebrow">From Our Farm to Yours</p>
          <h2>Practical Wisdom for Indian Dairy Farmers</h2>
          <p>
            India is home to the world's largest dairy sector, yet access to reliable,
            practical livestock knowledge remains scarce. Our guides bridge that gap —
            with hands-on advice grounded in actual barn experience, not textbooks.
          </p>
        </div>
      </section>

      {/* 3. TAG FILTERS */}
      <div className="blog-filter-bar">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`blog-pill-btn${activeTag === tag ? " active" : ""}`}
            onClick={() => setActiveTag(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 4. ARTICLES GRID */}
      <section className="blog-feed-section">
        <div className="blog-feed-grid">
          {filtered.map((article) => (
            <article className="blog-post-card" key={article.id}>
              <div className="blog-post-thumb">
                <img src={article.image} alt={article.title} loading="lazy" />
              </div>
              <div className="blog-post-body">
                <div className="blog-post-meta">
                  <span className="blog-tag-badge">{article.tag}</span>
                  <span className="blog-date-text">{article.date}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div className="blog-post-footer">
                  <div className="blog-author-info">
                    <div className="blog-author-avatar">
                      {article.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="blog-author-name">{article.author}</span>
                  </div>
                  <span className="blog-read-time">📖 {article.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. FEATURED ARTICLE SPOTLIGHT */}
      <section className="blog-spotlight-section">
        <div className="blog-spotlight-card">
          <div className="blog-spotlight-content">
            <p className="blog-eyebrow">Featured Field Guide</p>
            <h2>{ARTICLES[0].title}</h2>
            <p>{ARTICLES[0].excerpt}</p>
            <p>
              The key is to assess your farm's infrastructure honestly before choosing a breed.
              If you have a cemented shed with fans, access to quality silage or TMR feed, and are
              near a veterinary hub — HF is highly productive and profitable. If you are managing
              a rural village farm with natural grazing, Sahiwal or Gir will give you better long-term
              returns with minimal disease risk.
            </p>
            <div className="blog-spotlight-actions">
              <Link className="btn-blog-primary" to="/pashu">
                Browse Available Pashu →
              </Link>
              <Link className="btn-blog-outline" to="/consultancy">
                Get Free Breed Advice
              </Link>
            </div>
          </div>

          <div className="blog-spotlight-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=900&q=85"
              alt="HF and Sahiwal dairy cattle comparison"
            />
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER SUBSCRIPTION */}
      <section className="blog-newsletter-section">
        <div className="blog-newsletter-card">
          <p className="blog-eyebrow" style={{ color: "#c8e96b" }}>Stay Ahead</p>
          <h3>Get Farming Tips Delivered to Your Inbox</h3>
          <p>
            Join 500+ progressive dairy farmers who receive our monthly updates on cattle
            care, veterinary protocols, market price trends, and verified cattle listings.
          </p>

          {subMsg ? (
            <div className="blog-newsletter-success">{subMsg}</div>
          ) : (
            <form
              className="blog-newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubMsg("✓ You're subscribed! Watch your inbox for farming tips.");
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe Free</button>
            </form>
          )}
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="blog-cta-banner">
        <div className="blog-cta-inner">
          <p className="blog-eyebrow">Have Specific Questions?</p>
          <h2>Talk Directly to Our Dairy Farming Experts</h2>
          <p>
            Every inquiry receives personalized guidance from Ram Prakash Singh or one
            of our senior veterinary consultants.
          </p>
          <div className="blog-cta-actions">
            <Link className="btn-blog-primary" to="/consultancy">
              Book Free Consultation →
            </Link>
            <Link className="btn-blog-outline" to="/contact-us">
              Contact Our Office
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
