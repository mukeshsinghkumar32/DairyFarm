const Product = require('../../models/Product');
const Category = require('../../models/Category');
const fs = require('fs');
const path = require('path');

// Helper to make slug
function makeSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── GET /api/v1/sellers/products ────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const { search, category_id, page = 1, limit = 20 } = req.query;
    const filter = { seller_id: req.seller._id };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    if (category_id) {
      filter.category_id = category_id;
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category_id', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: {
        data: products,
        total,
        current_page: Number(page),
        last_page: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Seller products index error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// ─── POST /api/v1/sellers/products ───────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const {
      name,
      slug,
      category_id,
      price,
      weight,
      gender,
      breed,
      delivery_time,
      stock_quantity,
      color,
      description,
      short_description,
      milk_capacity_min,
      milk_capacity_max,
      age,
      lactation,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(422).json({ success: false, message: 'Product title is required.' });
    }

    // Category check
    let category = null;
    if (category_id && category_id !== 'Non selection' && category_id !== '') {
      category = await Category.findById(category_id);
    }
    if (!category) {
      // Find first available category or default
      category = await Category.findOne({ status: { $ne: false } });
    }

    if (!category) {
      return res.status(422).json({ success: false, message: 'Please create or assign a category first.' });
    }

    // Generate unique slug
    let baseSlug = makeSlug(slug || name);
    let finalSlug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    let featured_image = null;
    if (req.file) {
      featured_image = `/uploads/sellers/${req.file.filename}`;
    } else if (req.body.featured_image) {
      featured_image = req.body.featured_image;
    }

    const product = await Product.create({
      name: name.trim(),
      slug: finalSlug,
      category_id: category._id,
      price: price ? Number(price) : null,
      weight: weight || '',
      gender: gender && gender !== 'Non Selection' ? gender : '',
      breed: breed || '',
      delivery_time: delivery_time || '',
      stock_quantity: stock_quantity ? Number(stock_quantity) : 1,
      quantity: stock_quantity ? Number(stock_quantity) : 1,
      color: color && color !== 'Non Selection' ? color : '',
      milk_capacity_min: milk_capacity_min ? Number(milk_capacity_min) : null,
      milk_capacity_max: milk_capacity_max ? Number(milk_capacity_max) : null,
      age: age !== undefined && age !== '' && age !== null ? (isNaN(age) ? age : Number(age)) : null,
      lactation: lactation || '',
      short_description: short_description || '',
      description: description || '',
      featured_image,
      seller_id: req.seller._id,
      status: true,
      availability: 'available',
    });

    const populated = await Product.findById(product._id).populate('category_id', 'name slug');

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: populated,
    });
  } catch (err) {
    console.error('Seller product store error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create product.' });
  }
};

// ─── GET /api/v1/sellers/products/:id ────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller_id: req.seller._id,
    }).populate('category_id', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// ─── PUT /api/v1/sellers/products/:id ────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller_id: req.seller._id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      name,
      slug,
      category_id,
      price,
      weight,
      gender,
      breed,
      delivery_time,
      stock_quantity,
      color,
      description,
      short_description,
      milk_capacity_min,
      milk_capacity_max,
      age,
      lactation,
      status,
      availability,
    } = req.body;

    if (name) product.name = name.trim();
    if (slug) {
      const formattedSlug = makeSlug(slug);
      const conflict = await Product.findOne({ slug: formattedSlug, _id: { $ne: product._id } });
      if (!conflict) product.slug = formattedSlug;
    }
    if (category_id && category_id !== 'Non selection' && category_id !== '') {
      const catObj = await Category.findById(category_id);
      if (catObj) product.category_id = catObj._id;
    }
    if (price !== undefined) product.price = price ? Number(price) : null;
    if (weight !== undefined) product.weight = weight;
    if (gender !== undefined) product.gender = gender === 'Non Selection' ? '' : gender;
    if (breed !== undefined) product.breed = breed;
    if (delivery_time !== undefined) product.delivery_time = delivery_time;
    if (stock_quantity !== undefined) {
      product.stock_quantity = Number(stock_quantity);
      product.quantity = Number(stock_quantity);
    }
    if (color !== undefined) product.color = color === 'Non Selection' ? '' : color;
    if (milk_capacity_min !== undefined) {
      product.milk_capacity_min = milk_capacity_min ? Number(milk_capacity_min) : null;
    }
    if (milk_capacity_max !== undefined) {
      product.milk_capacity_max = milk_capacity_max ? Number(milk_capacity_max) : null;
    }
    if (age !== undefined) {
      product.age = age !== '' && age !== null ? (isNaN(age) ? age : Number(age)) : null;
    }
    if (lactation !== undefined) product.lactation = lactation;
    if (short_description !== undefined) product.short_description = short_description;
    if (description !== undefined) product.description = description;
    if (status !== undefined) product.status = status;
    if (availability !== undefined) product.availability = availability;

    if (req.file) {
      if (product.featured_image && product.featured_image.startsWith('/uploads/sellers/')) {
        const oldPath = path.join(__dirname, '..', '..', product.featured_image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.featured_image = `/uploads/sellers/${req.file.filename}`;
    } else if (req.body.featured_image) {
      product.featured_image = req.body.featured_image;
    }

    await product.save();

    const populated = await Product.findById(product._id).populate('category_id', 'name slug');

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      data: populated,
    });
  } catch (err) {
    console.error('Seller product update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// ─── DELETE /api/v1/sellers/products/:id ─────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller_id: req.seller._id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.featured_image && product.featured_image.startsWith('/uploads/sellers/')) {
      const oldPath = path.join(__dirname, '..', '..', product.featured_image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Seller product destroy error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};
