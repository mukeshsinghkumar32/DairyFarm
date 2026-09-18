const SellerBanner = require('../../models/SellerBanner');
const fs = require('fs');
const path = require('path');

// ─── GET /api/v1/sellers/banners ─────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const banners = await SellerBanner.find({ seller_id: req.seller._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: banners,
    });
  } catch (err) {
    console.error('Seller banner index error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
  }
};

// ─── POST /api/v1/sellers/banners ────────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(422).json({ success: false, message: 'Banner title is required.' });
    }

    let image = '';
    if (req.file) {
      image = `/uploads/sellers/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const banner = await SellerBanner.create({
      seller_id: req.seller._id,
      title: title.trim(),
      image,
    });

    return res.status(201).json({
      success: true,
      message: 'Banner created successfully.',
      data: banner,
    });
  } catch (err) {
    console.error('Seller banner store error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create banner.' });
  }
};

// ─── GET /api/v1/sellers/banners/:id ─────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const banner = await SellerBanner.findOne({ _id: req.params.id, seller_id: req.seller._id });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }
    return res.json({ success: true, data: banner });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch banner.' });
  }
};

// ─── PUT /api/v1/sellers/banners/:id ─────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const banner = await SellerBanner.findOne({ _id: req.params.id, seller_id: req.seller._id });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    const { title, status } = req.body;
    if (title) banner.title = title.trim();
    if (status !== undefined) banner.status = status;

    if (req.file) {
      // Remove old uploaded file if local
      if (banner.image && banner.image.startsWith('/uploads/sellers/')) {
        const oldPath = path.join(__dirname, '..', '..', banner.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      banner.image = `/uploads/sellers/${req.file.filename}`;
    } else if (req.body.image) {
      banner.image = req.body.image;
    }

    await banner.save();

    return res.json({
      success: true,
      message: 'Banner updated successfully.',
      data: banner,
    });
  } catch (err) {
    console.error('Seller banner update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update banner.' });
  }
};

// ─── DELETE /api/v1/sellers/banners/:id ──────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    const banner = await SellerBanner.findOneAndDelete({ _id: req.params.id, seller_id: req.seller._id });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    // Clean up file if present
    if (banner.image && banner.image.startsWith('/uploads/sellers/')) {
      const oldPath = path.join(__dirname, '..', '..', banner.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return res.json({ success: true, message: 'Banner deleted successfully.' });
  } catch (err) {
    console.error('Seller banner destroy error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete banner.' });
  }
};
