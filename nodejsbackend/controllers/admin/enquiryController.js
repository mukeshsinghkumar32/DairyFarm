const Enquiry = require('../../models/Enquiry');

const PER_PAGE = 20;

// ─── GET /api/v1/admin/enquiries ────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const page  = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.per_page, 10) || PER_PAGE;
    const skip  = (page - 1) * limit;

    const [enquiries, total] = await Promise.all([
      Enquiry.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Enquiry.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        data:         enquiries,
        total,
        per_page:     limit,
        current_page: page,
        last_page:    Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/v1/contact (public) ──────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const { name, phone, email, city, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(422).json({ success: false, message: 'Name, phone and message are required.' });
    }
    const enquiry = await Enquiry.create({ name, phone, email, city, message });
    return res.status(201).json({ success: true, data: enquiry, message: 'Enquiry submitted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/v1/admin/enquiries/:id ──────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['new', 'contacted', 'closed'];
    if (!valid.includes(status)) {
      return res.status(422).json({ success: false, message: 'Invalid status value.' });
    }
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    return res.json({ success: true, data: enquiry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
