import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";
export default function BreedsSection({ cats = [], categories = [] }) {
  const categoryList = cats.length > 0 ? cats : categories;

  const displayCategories =
    categoryList.length > 0
      ? categoryList.map((c) => ({
          name: c.name,
          sub: c.description || "",
          slug: c.slug,
          img: getImageUrl(c.image, ""),
        }))
      : [];

  return (
    <section className="pd-categories-sec">
      <div className="pashu-container">
        <div className="pd-section-header">
          <span className="pd-section-tag">EXPLORE BY CATEGORY</span>
          <h2 className="pd-section-title">
            Discover Trusted Dairy Suppliers. Build Your Farm with Confidence.
          </h2>
          <p className="pd-section-sub">
            Select from India's most sought-after dairy breeds — all verified,
            all premium quality dairy animals
          </p>
        </div>

        <div className="pd-categories-grid">
          {displayCategories.map((cat) => (
            <Link
              className="pd-cat-card"
              to={`/pashu/category/${cat.slug}`}
              key={cat.slug || cat.name}
            >
              <div className="pd-cat-thumb">
                <img src={cat.img} alt={cat.name} loading="lazy" />
              </div>
              <div className="pd-cat-body">
                <div className="pd-cat-name">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
