const Product = require('../../models/Product');

const PER_PAGE = 12;

// ─── GET /api/v1/products ────────────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const page    = parseInt(req.query.page, 10)     || 1;
    const perPage = parseInt(req.query.per_page, 10) || PER_PAGE;
    const skip    = (page - 1) * perPage;

    const query = { status: true };
    if (req.query.featured === '1') query.featured  = true;
    if (req.query.category)        query.category_id = req.query.category;
    if (req.query.availability)    query.availability = req.query.availability;

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

// ─── GET /api/v1/products/:slug ──────────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: true })
      .populate('category_id', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
