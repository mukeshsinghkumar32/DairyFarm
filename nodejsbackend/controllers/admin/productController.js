const path    = require('path');
const fs      = require('fs');
const slugify = require('slugify');
const Product = require('../../models/Product');

const PER_PAGE = 15;
const makeSlug = (name) => slugify(name, { lower: true, strict: true });

// ─── GET /api/v1/admin/products ─────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const page  = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.per_page, 10) || PER_PAGE;
    const skip  = (page - 1) * limit;

    const query = {};
    if (req.query.availability) query.availability = req.query.availability;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category_id', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        data:          products,
        total,
        per_page:      limit,
        current_page:  page,
        last_page:     Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/v1/admin/products ────────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.category_id) {
      return res.status(422).json({ success: false, message: 'Name and category are required.' });
    }

    let slug = makeSlug(body.name);
    const existing = await Product.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const productData = buildProductData(body, slug);
    if (req.file) {
      productData.featured_image = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create(productData);
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/v1/admin/products/:id ─────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category_id', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/v1/admin/products/:id  (with _method=PUT override from FormData) ─
// ─── PUT  /api/v1/admin/products/:id ────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const body = req.body;
    const updates = buildProductData(body, product.slug);

    // Only regenerate slug if name changed
    if (body.name && body.name !== product.name) {
      let slug = makeSlug(body.name);
      const existing = await Product.findOne({ slug, _id: { $ne: product._id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      updates.slug = slug;
    }

    if (req.file) {
      // Remove old image
      if (product.featured_image) {
        const oldPath = path.join(__dirname, '..', '..', product.featured_image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.featured_image = `/uploads/products/${req.file.filename}`;
    }

    Object.assign(product, updates);
    await product.save();
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/v1/admin/products/:id ──────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    // Remove image file
    if (product.featured_image) {
      const imgPath = path.join(__dirname, '..', '..', product.featured_image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    return res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Helper: build product fields from request body ─────────────────────────
function buildProductData(body, slug) {
  const bool = (val) => val === '1' || val === true || val === 'true';
  return {
    name:              body.name?.trim(),
    slug,
    category_id:       body.category_id,
    price:             body.price              ? Number(body.price)             : null,
    show_price:        body.show_price         !== undefined ? bool(body.show_price) : true,
    milk_capacity_min: body.milk_capacity_min  ? Number(body.milk_capacity_min) : null,
    milk_capacity_max: body.milk_capacity_max  ? Number(body.milk_capacity_max) : null,
    age:               body.age               ? Number(body.age)               : null,
    lactation:         body.lactation          || '',
    pregnancy_status:  body.pregnancy_status   || 'Not pregnant',
    location:          body.location           || 'Sohani, Jaunpur',
    availability:      body.availability       || 'available',
    featured:          body.featured           !== undefined ? bool(body.featured) : false,
    status:            body.status             !== undefined ? bool(body.status)   : true,
    short_description: body.short_description  || '',
    description:       body.description        || '',
    quantity:          body.quantity           ? Number(body.quantity)          : 1,
  };
}
