const slugify  = require('slugify');
const Category = require('../../models/Category');

// ─── Helper ──────────────────────────────────────────────────────────────────
const makeSlug = (name) => slugify(name, { lower: true, strict: true });

// ─── GET /api/v1/admin/categories ───────────────────────────────────────────
exports.index = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ sort_order: 1, createdAt: -1 });
    return res.json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/v1/admin/categories ──────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const { name, description, sort_order, status } = req.body;
    if (!name) return res.status(422).json({ success: false, message: 'Name is required.' });

    let slug = makeSlug(name);
    // Ensure slug is unique
    const existing = await Category.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || '',
      sort_order:  sort_order  || 0,
      status:      status !== undefined ? Boolean(Number(status)) : true,
    });

    return res.status(201).json({ success: true, data: category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/v1/admin/categories/:id ───────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    return res.json({ success: true, data: category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/v1/admin/categories/:id ───────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { name, description, sort_order, status } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    if (name && name !== category.name) {
      let slug = makeSlug(name);
      const existing = await Category.findOne({ slug, _id: { $ne: category._id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      category.slug = slug;
      category.name = name.trim();
    }
    if (description !== undefined) category.description = description;
    if (sort_order  !== undefined) category.sort_order  = sort_order;
    if (status      !== undefined) category.status      = Boolean(Number(status));

    await category.save();
    return res.json({ success: true, data: category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/v1/admin/categories/:id ────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
