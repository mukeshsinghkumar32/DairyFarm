import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";

export const BREEDS = [
  {
    name: "HF Cow",
    sub: "Holstein Friesian",
    slug: "hf-cow",
    img: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=360&q=85",
    count: "340+ Listed",
  },
  {
    name: "Gir Cow",
    sub: "Indigenous Desi Breed",
    slug: "gir-cow",
    img: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=360&q=85",
    count: "210+ Listed",
  },
  {
    name: "Sahiwal Cow",
    sub: "Best Native Milker",
    slug: "sahiwal-cow",
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=360&q=85",
    count: "180+ Listed",
  },
  {
    name: "Jersey Cow",
    sub: "High Fat Milk",
    slug: "jersey-cow",
    img: "https://images.unsplash.com/photo-1527153818091-1a9638521e2a?w=360&q=85",
    count: "150+ Listed",
  },
  {
    name: "Murrah Buffalo",
    sub: "Maximum Milk Yield",
    slug: "murrah-buffalo",
    img: "https://images.unsplash.com/photo-1501706362039-c06b2d715385?w=360&q=85",
    count: "290+ Listed",
  },
  {
    name: "Tharparkar",
    sub: "Desert Resilient Breed",
    slug: "tharparkar-cow",
    img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=360&q=85",
    count: "95+ Listed",
  },
];

export default function BreedsSection({ cats = [], categories = [] }) {
  const categoryList = cats.length > 0 ? cats : categories;

  const displayBreeds =
    categoryList.length > 0
      ? categoryList.map((c, i) => ({
          name: c.name,
          sub: c.description || BREEDS[i % BREEDS.length]?.sub,
          slug: c.slug,
          img: getImageUrl(c.image, BREEDS[i % BREEDS.length]?.img),
        }))
      : BREEDS;

  return (
    <section className="dm-section launch-strip">
      <div className="section-inner">
        <div className="section-head">
          <span className="eyebrow">Browse By Breed</span>
          <h2>
            Discover Trusted Dairy Suppliers. Build Your Farm with Confidence.
          </h2>
          <p>
            Select from India's most sought-after dairy breeds — all verified,
            all premium quality dairy animals
          </p>
        </div>
        <div className="breed-grid-pro">
          {displayBreeds.map((b) => (
            <Link
              to={`/pashu/category/${b.slug}`}
              className="breed-card-pro"
              key={b.slug || b.name}
            >
              <div className="breed-card-pro-img">
                <img src={b.img} alt={b.name} loading="lazy" />
                <div className="breed-card-pro-overlay" />
              </div>

              <div className="card-body p-2">
                <span
                  className="card-title text-dark mb-0"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  {b.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
