const ContactUs = require("../../models/ContactUs");

const PER_PAGE = 20;

// POST /api/v1/contact (public)
exports.store = async (req, res) => {
  try {
    const { name, phone, email, state, city, breed, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(422).json({
        success: false,
        message: "Full Name, Phone Number, and Message / Requirements are required.",
      });
    }

    const contact = await ContactUs.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      state: state ? state.trim() : "",
      city: city ? city.trim() : "",
      breed: breed ? breed.trim() : "",
      message: message.trim(),
      page_url: req.headers.referer || "",
      ip_address: req.ip || req.connection?.remoteAddress || "",
    });

    return res.status(201).json({
      success: true,
      data: contact,
      message: "Your message has been received! Our team will contact you within 24 hours.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/contacts (admin)
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || parseInt(req.query.per_page, 10) || 10;
    const skip = (page - 1) * limit;
    const { search, q, status } = req.query;
    const searchTerm = (search || q || "").trim();

    const query = {};

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { city: { $regex: searchTerm, $options: "i" } },
        { state: { $regex: searchTerm, $options: "i" } },
        { breed: { $regex: searchTerm, $options: "i" } },
        { message: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const [contacts, total] = await Promise.all([
      ContactUs.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactUs.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        data: contacts,
        total,
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/contacts/:id (admin)
exports.update = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["new", "contacted", "closed"];
    if (!valid.includes(status)) {
      return res.status(422).json({
        success: false,
        message: "Invalid status value.",
      });
    }
    const contact = await ContactUs.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact enquiry not found.",
      });
    }
    return res.json({ success: true, data: contact });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/admin/contacts/:id (admin)
exports.destroy = async (req, res) => {
  try {
    const contact = await ContactUs.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact enquiry not found.",
      });
    }
    return res.json({
      success: true,
      message: "Contact enquiry deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
