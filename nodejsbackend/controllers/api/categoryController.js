const Category = require('../../models/Category');
const Product  = require('../../models/Product');

// ─── GET /api/v1/categories ──────────────────────────────────────────────────
exports.index = async (_req, res) => {
  try {
    const categories = await Category.find({ status: { $ne: false } }).sort({ sort_order: 1, name: 1 });
    return res.json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/v1/categories/:slug/products ───────────────────────────────────
exports.products = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, status: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const page    = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page || req.query.limit, 10) || 30));
    const skip    = (page - 1) * perPage;

    const query = { category_id: category._id, status: true, availability: { $ne: 'sold' } };

    // Search query
    if (req.query.search || req.query.q) {
      const s = (req.query.search || req.query.q).trim();
      const sRegex = new RegExp(s, "i");
      query.$or = [
        { name: sRegex },
        { description: sRegex },
        { breed: sRegex },
        { location: sRegex },
      ];
    }

    // State & City filters
    const andConds = [];
    if (req.query.state && req.query.state.trim() && req.query.state !== "All" && req.query.state !== "all") {
      andConds.push({
        location: { $regex: new RegExp(req.query.state.trim(), "i") },
      });
    }
    if (req.query.city && req.query.city.trim() && req.query.city !== "All" && req.query.city !== "all") {
      andConds.push({
        location: { $regex: new RegExp(req.query.city.trim(), "i") },
      });
    }
    if (andConds.length > 0) {
      if (query.$and) {
        query.$and.push(...andConds);
      } else {
        query.$and = andConds;
      }
    }

    // Sorting: newly added (newest/latest) or oldest, or price
    let sortObj = { featured: -1, createdAt: -1 };
    const sortParam = (req.query.sort || "newest").toLowerCase();
    if (sortParam === "oldest" || sortParam === "old") {
      sortObj = { featured: -1, createdAt: 1 };
    } else if (sortParam === "newest" || sortParam === "new" || sortParam === "latest") {
      sortObj = { featured: -1, createdAt: -1 };
    } else if (sortParam === "price-low" || sortParam === "price_asc") {
      sortObj = { price: 1, createdAt: -1 };
    } else if (sortParam === "price-high" || sortParam === "price_desc") {
      sortObj = { price: -1, createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category_id', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(perPage),
      Product.countDocuments(query),
    ]);

    return res.json({
      success: true,
      category,
      data: {
        data:         products,
        total,
        per_page:     perPage,
        current_page: page,
        last_page:    Math.ceil(total / perPage) || 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
