const SellerAbout = require('../../models/SellerAbout');
const fs = require('fs');
const path = require('path');

// ─── GET /api/v1/sellers/about ───────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const aboutList = await SellerAbout.find({ seller_id: req.seller._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: aboutList,
    });
  } catch (err) {
    console.error('Seller about index error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch about entries.' });
  }
};

// ─── POST /api/v1/sellers/about ──────────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !title.trim()) {
      return res.status(422).json({ success: false, message: 'Title is required.' });
    }

    let image = '';
    if (req.file) {
      image = `/uploads/sellers/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const aboutEntry = await SellerAbout.create({
      seller_id: req.seller._id,
      title: title.trim(),
      content: content || '',
      image,
    });

    return res.status(201).json({
      success: true,
      message: 'About entry created successfully.',
      data: aboutEntry,
    });
  } catch (err) {
    console.error('Seller about store error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create about entry.' });
  }
};

// ─── GET /api/v1/sellers/about/:id ───────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const aboutEntry = await SellerAbout.findOne({ _id: req.params.id, seller_id: req.seller._id });
    if (!aboutEntry) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }
    return res.json({ success: true, data: aboutEntry });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch about entry.' });
  }
};

// ─── PUT /api/v1/sellers/about/:id ───────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const aboutEntry = await SellerAbout.findOne({ _id: req.params.id, seller_id: req.seller._id });
    if (!aboutEntry) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    const { title, content } = req.body;
    if (title) aboutEntry.title = title.trim();
    if (content !== undefined) aboutEntry.content = content;

    if (req.file) {
      if (aboutEntry.image && aboutEntry.image.startsWith('/uploads/sellers/')) {
        const oldPath = path.join(__dirname, '..', '..', aboutEntry.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      aboutEntry.image = `/uploads/sellers/${req.file.filename}`;
    } else if (req.body.image) {
      aboutEntry.image = req.body.image;
    }

    await aboutEntry.save();

    return res.json({
      success: true,
      message: 'Entry updated successfully.',
      data: aboutEntry,
    });
  } catch (err) {
    console.error('Seller about update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update entry.' });
  }
};

// ─── DELETE /api/v1/sellers/about/:id ────────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    const aboutEntry = await SellerAbout.findOneAndDelete({ _id: req.params.id, seller_id: req.seller._id });
    if (!aboutEntry) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    if (aboutEntry.image && aboutEntry.image.startsWith('/uploads/sellers/')) {
      const oldPath = path.join(__dirname, '..', '..', aboutEntry.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return res.json({ success: true, message: 'Entry deleted successfully.' });
  } catch (err) {
    console.error('Seller about destroy error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete entry.' });
  }
};
