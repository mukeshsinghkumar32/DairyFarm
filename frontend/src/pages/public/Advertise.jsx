import { Link } from "react-router-dom";
import SEO from "../../components/common/SEO";

export default function Advertise() {
  return (
    <main>
      <SEO
        title="Advertise With Us — Reach Millions of Dairy Farmers & Livestock Buyers"
        description="Advertise your dairy farm equipment, cattle feed, pharmaceuticals, and breeding services on Sohani Mitra — India's #1 B2B livestock and dairy marketplace."
        keywords="dairy advertising India, livestock banner ads, cattle feed marketing, dairy equipment leads, promote dairy farm"
      />
      {/* ── Page Hero ──────────────────────────────────────── */}
      <div className="page-hero">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Advertise</span>
        </div>
        <h1>Advertise With Us</h1>
        <p>Grow your dairy business with India's largest B2B marketplace</p>
      </div>

      {/* ── Advertise Hero ────────────────────────────────── */}
      <section className="adv-hero">
        <div className="adv-hero-inner">
          <div>
            <div className="adv-eyebrow">GROW YOUR BUSINESS</div>
            <h1>Advertise with Sohani Mitra</h1>
            <h2>No. 1 Livestock Buying &amp; Selling Platform</h2>
            <p>
              Whether you are a small business or large organisation in dairy farm industry, Sohani Mitra offers reliable services to boost your reach and connect your brand with numerous buyers and sellers. We offer an effective lead generation model and marketing strategy that focus on giving you the best ROI.
            </p>
            <h3 style={{fontSize:14, fontWeight:700, color:'var(--dark)', marginTop:14, marginBottom:8}}>Expand Your Reach</h3>
            <ul className="adv-features">
              <li>Outshine Your Competitors</li>
              <li>Stay Ahead of the Market</li>
              <li>Instantly Connect with Ready-to-Buy Customers</li>
              <li>Monitor Leads &amp; Market Trends</li>
            </ul>
            <div style={{marginTop:24, display:'flex', gap:12, flexWrap:'wrap'}}>
              <Link to="/contact-us" style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'12px 28px',
                background:'var(--orange)',
                color:'#fff',
                borderRadius:6,
                fontWeight:700,
                fontSize:14,
                textDecoration:'none',
                boxShadow:'0 4px 14px rgba(255,118,0,.35)',
              }}>
                📢 Start Advertising Now
              </Link>
              <a href="tel:+918208127243" style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'12px 28px',
                border:'2px solid var(--green)',
                color:'var(--green)',
                borderRadius:6,
                fontWeight:700,
                fontSize:14,
              }}>
                ☎ Talk to Our Team
              </a>
            </div>
          </div>
          <div className="adv-illustration">
            <div style={{fontSize:80}}>📊</div>
            <div style={{marginTop:12, fontSize:13, fontWeight:600, color:'var(--text-light)'}}>
              Analytics &amp; Growth
            </div>
            {/* Mini stats */}
            <div style={{display:'flex',gap:10,marginTop:16,justifyContent:'center'}}>
              <div style={{background:'var(--orange-light)',border:'1px solid #ffd5a8',borderRadius:8,padding:'8px 12px',fontSize:12}}>
                <strong style={{color:'var(--orange)',display:'block',fontSize:18}}>3x</strong>
                Leads
              </div>
              <div style={{background:'#e8f5e4',border:'1px solid #b8ddb1',borderRadius:8,padding:'8px 12px',fontSize:12}}>
                <strong style={{color:'var(--green)',display:'block',fontSize:18}}>98%</strong>
                ROI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ads Goals ─────────────────────────────────────── */}
      <section className="dm-section adv-goals">
        <div className="section-inner">
          <div className="section-head">
            <span className="eyebrow">Platform Advertising</span>
            <h2>Sohani Mitra Ads Grow your business and Help You Achieve Your Goals</h2>
          </div>
          <div className="adv-goals-grid">
            {[
              { icon: "📣", title: "Promote Your Business to new Audiences" },
              { icon: "💰", title: "Increase Your Profits" },
              { icon: "👥", title: "Attract More customers" },
            ].map((g) => (
              <div className="adv-goal-card" key={g.title}>
                <div className="adv-goal-icon">{g.icon}</div>
                <h3>{g.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Attract Customers ─────────────────────────────── */}
      <section className="dm-section" style={{background:'var(--off-white)'}}>
        <div className="section-inner">
          <div className="section-head">
            <span className="eyebrow">Customer Acquisition</span>
            <h2>Attract new customers on Sohani Mitra</h2>
            <p>Connect with targeted customers for greater business conversion</p>
          </div>
          <div style={{
            display:'grid',
            gridTemplateColumns:'1fr 1fr',
            gap:24,
            alignItems:'center',
          }}>
            <div style={{
              background:'var(--white)',
              borderRadius:16,
              padding:32,
              textAlign:'center',
              boxShadow:'var(--shadow-sm)',
              border:'1px solid var(--border)',
              fontSize:70,
            }}>
              🎯
              <p style={{fontSize:14, marginTop:12, color:'var(--text-light)', fontWeight:600}}>
                Targeted advertising to reach ready-to-buy dairy farmers
              </p>
            </div>
            <div style={{
              background:'var(--white)',
              borderRadius:16,
              padding:32,
              textAlign:'center',
              boxShadow:'var(--shadow-sm)',
              border:'1px solid var(--border)',
              fontSize:70,
            }}>
              📈
              <p style={{fontSize:14, marginTop:12, color:'var(--text-light)', fontWeight:600}}>
                Track performance and optimize your ad campaigns in real time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Advertising Features ──────────────────────────── */}
      <section className="dm-section adv-features-section">
        <div className="section-inner">
          <div className="section-head">
            <span className="eyebrow">Ad Benefits</span>
            <h2>Attract new customers on Sohani Mitra</h2>
            <p>Connect with targeted customers for greater business conversion</p>
          </div>
          <div className="adv-features-grid">
            {[
              {
                icon: "⭐",
                title: "Premium Listing",
                desc: "Stand out from the crowd with prime exposure on Sohani Mitra. Your listing appears at the top of search results.",
              },
              {
                icon: "🤝",
                title: "Personalized Support",
                desc: "Receive tailored assistance and a helping hand as you get started with your advertising campaign.",
              },
              {
                icon: "📖",
                title: "Digital Catalogue",
                desc: "Showcase your offerings to connect with potential customers. Create a rich digital catalog of all your animals.",
              },
              {
                icon: "🛎️",
                title: "Customers Services",
                desc: "Get priority support and expert advice for a smoother journey and better customer relationships.",
              },
              {
                icon: "🔍",
                title: "Know Your Rivals",
                desc: "Gain insights into how your competitors are doing on Sohani Mitra and stay one step ahead of the market.",
              },
              {
                icon: "📊",
                title: "Analytics Dashboard",
                desc: "Access real-time data about your listing performance, visitor count, and inquiry conversion rates.",
              },
            ].map((f) => (
              <div className="adv-feature-item" key={f.title}>
                <div className="adv-feature-icon">{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="dm-section" style={{background:'linear-gradient(135deg,var(--green),var(--green-mid))'}}>
        <div style={{maxWidth:600, margin:'0 auto', textAlign:'center'}}>
          <h2 style={{fontSize:28, fontWeight:800, color:'#fff', marginBottom:12}}>
            Ready to grow your dairy business?
          </h2>
          <p style={{color:'rgba(255,255,255,.8)', fontSize:15, marginBottom:24}}>
            Join 2000+ businesses already advertising on Sohani Mitra and start getting real results today.
          </p>
          <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
            <Link to="/contact-us" style={{
              padding:'13px 32px',
              background:'var(--orange)',
              color:'#fff',
              borderRadius:6,
              fontWeight:700,
              fontSize:15,
              boxShadow:'0 4px 16px rgba(255,118,0,.4)',
              textDecoration:'none',
            }}>
              Get Started Now →
            </Link>
            <a href="tel:+918208127243" style={{
              padding:'13px 32px',
              background:'transparent',
              color:'#fff',
              border:'2px solid rgba(255,255,255,.6)',
              borderRadius:6,
              fontWeight:700,
              fontSize:15,
            }}>
              ☎ Call Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
