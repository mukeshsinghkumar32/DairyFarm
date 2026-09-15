const Category = require('../../models/Category');
const Product  = require('../../models/Product');

// ─── GET /api/v1/categories ──────────────────────────────────────────────────
exports.index = async (_req, res) => {
  try {
    const categories = await Category.find({ status: true }).sort({ sort_order: 1 });
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

    const page    = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.per_page, 10) || 12;
    const skip    = (page - 1) * perPage;

    const query = { category_id: category._id, status: true, availability: { $ne: 'sold' } };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category_id', 'name slug')
        .sort({ featured: -1, createdAt: -1 })
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
        last_page:    Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
