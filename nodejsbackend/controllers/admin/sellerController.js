const Seller = require('../../models/Seller');
const Product = require('../../models/Product');

// ─── GET /api/v1/admin/sellers ───────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || parseInt(req.query.per_page, 10) || 10;
    const { search, q, status, state, city } = req.query;
    const searchTerm = (search || q || '').trim();

    const filter = {};

    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { business_name: { $regex: searchTerm, $options: 'i' } },
        { city: { $regex: searchTerm, $options: 'i' } },
        { state: { $regex: searchTerm, $options: 'i' } },
        { gst_number: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (state && state !== 'all' && state.trim() !== '') {
      filter.state = { $regex: state.trim(), $options: 'i' };
    }

    if (city && city !== 'all' && city.trim() !== '') {
      filter.city = { $regex: city.trim(), $options: 'i' };
    }

    if (status === 'featured') {
      filter.featured = true;
    } else if (status && status !== 'all') {
      filter.status = status;
    }

    const total = await Seller.countDocuments(filter);
    const sellers = await Seller.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Attach product counts
    const sellersWithCounts = await Promise.all(
      sellers.map(async (s) => {
        const pCount = await Product.countDocuments({ seller_id: s._id });
        const json = s.toJSON();
        json.product_count = pCount;
        return json;
      })
    );

    return res.json({
      success: true,
      data: {
        data: sellersWithCounts,
        total,
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Admin sellers index error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sellers.' });
  }
};

// ─── POST /api/v1/admin/sellers ──────────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      password,
      business_name,
      business_address,
      gst_number,
      state,
      city,
      pincode,
      status = 'active',
      featured = false,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(422).json({ success: false, message: 'Seller Full Name is required.' });
    }
    if (!username || !username.trim()) {
      return res.status(422).json({ success: false, message: 'Username is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(422).json({ success: false, message: 'Email Address is required.' });
    }
    if (!password || password.trim().length < 6) {
      return res.status(422).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    const existing = await Seller.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          existing.email === cleanEmail
            ? 'A seller with this email address already exists.'
            : 'A seller with this username already exists.',
      });
    }

    let avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
    if (req.file) {
      avatar = `/uploads/sellers/${req.file.filename}`;
    } else if (req.body.avatar) {
      avatar = req.body.avatar;
    }

    const isFeatured = featured === true || featured === 'true' || featured === '1' || featured === 1;

    const seller = await Seller.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      password: password.trim(), // Mongoose pre-save hook handles bcrypt hashing
      business_name: business_name ? business_name.trim() : 'Sohani Dairy Farm',
      business_address: business_address ? business_address.trim() : '',
      gst_number: gst_number ? gst_number.trim() : '',
      state: state ? state.trim() : '',
      city: city ? city.trim() : '',
      pincode: pincode ? pincode.trim() : '',
      avatar,
      business_image: avatar,
      role: 'seller',
      status: status || 'active',
      featured: isFeatured,
    });

    return res.status(201).json({
      success: true,
      message: 'Seller created successfully.',
      data: seller.toJSON(),
    });
  } catch (err) {
    console.error('Admin create seller error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create seller.' });
  }
};

// ─── GET /api/v1/admin/sellers/:id ───────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select('-password');
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    const products = await Product.find({ seller_id: seller._id }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: {
        ...seller.toJSON(),
        products,
        product_count: products.length,
      },
    });
  } catch (err) {
    console.error('Admin get seller error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch seller.' });
  }
};

// ─── PUT /api/v1/admin/sellers/:id ───────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    const {
      name,
      username,
      email,
      phone,
      password,
      business_name,
      business_address,
      gst_number,
      state,
      city,
      pincode,
      status,
      featured,
    } = req.body;

    if (email && email.toLowerCase().trim() !== seller.email) {
      const emailConflict = await Seller.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: seller._id },
      });
      if (emailConflict) {
        return res.status(409).json({ success: false, message: 'Email address already in use by another seller.' });
      }
      seller.email = email.toLowerCase().trim();
    }

    if (username && username.toLowerCase().trim() !== seller.username) {
      const cleanU = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
      const userConflict = await Seller.findOne({
        username: cleanU,
        _id: { $ne: seller._id },
      });
      if (userConflict) {
        return res.status(409).json({ success: false, message: 'Username already in use by another seller.' });
      }
      seller.username = cleanU;
    }

    if (name) seller.name = name.trim();
    if (phone !== undefined) seller.phone = phone.trim();
    if (business_name !== undefined) seller.business_name = business_name.trim();
    if (business_address !== undefined) seller.business_address = business_address.trim();
    if (gst_number !== undefined) seller.gst_number = gst_number.trim();
    if (state !== undefined) seller.state = state.trim();
    if (city !== undefined) seller.city = city.trim();
    if (pincode !== undefined) seller.pincode = pincode.trim();
    if (status !== undefined) seller.status = status;
    if (featured !== undefined) {
      seller.featured = featured === true || featured === 'true' || featured === '1' || featured === 1;
    }

    if (password && password.trim().length >= 6) {
      seller.password = password.trim();
    }

    if (req.file) {
      const avatarPath = `/uploads/sellers/${req.file.filename}`;
      seller.avatar = avatarPath;
      seller.business_image = avatarPath;
    } else if (req.body.avatar) {
      seller.avatar = req.body.avatar;
      seller.business_image = req.body.avatar;
    }

    await seller.save();

    return res.json({
      success: true,
      message: 'Seller updated successfully.',
      data: seller.toJSON(),
    });
  } catch (err) {
    console.error('Admin update seller error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update seller.' });
  }
};

// ─── DELETE /api/v1/admin/sellers/:id ────────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    return res.json({ success: true, message: 'Seller deleted successfully.' });
  } catch (err) {
    console.error('Admin delete seller error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete seller.' });
  }
};
