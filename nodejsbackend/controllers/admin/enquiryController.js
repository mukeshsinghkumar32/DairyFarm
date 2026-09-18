const Enquiry = require("../../models/Enquiry");

const PER_PAGE = 20;

// ─── GET /api/v1/admin/enquiries ────────────────────────────────────────────
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
        { product_name: { $regex: searchTerm, $options: "i" } },
        { farm_name: { $regex: searchTerm, $options: "i" } },
        { seller_name: { $regex: searchTerm, $options: "i" } },
        { city: { $regex: searchTerm, $options: "i" } },
        { state: { $regex: searchTerm, $options: "i" } },
        { message: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query)
        .populate("product_id", "name price category slug featured_image")
        .populate("seller_id", "business_name name phone city state")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Enquiry.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        data: enquiries,
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

// ─── POST /api/v1/enquiries or /api/v1/inquiry (public) ─────────────────────
exports.store = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      state,
      city,
      message,
      product_id,
      product_name,
      product_price,
      seller_id,
      seller_name,
      farm_name,
      seller_phone,
      inquiry_type,
    } = req.body;

    if (!name || !phone) {
      return res.status(422).json({
        success: false,
        message: "Full Name and Phone Number are required.",
      });
    }

    const enquiry = await Enquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      state: state ? state.trim() : "",
      city: city ? city.trim() : "",
      message: message ? message.trim() : "",
      product_id: product_id || null,
      product_name: product_name ? product_name.trim() : "",
      product_price: product_price ? Number(product_price) : 0,
      seller_id: seller_id || null,
      seller_name: seller_name ? seller_name.trim() : "",
      farm_name: farm_name ? farm_name.trim() : "",
      seller_phone: seller_phone ? seller_phone.trim() : "",
      inquiry_type: inquiry_type || "product_price_inquiry",
      page_url: req.headers.referer || "",
      ip_address: req.ip || req.connection?.remoteAddress || "",
    });

    return res.status(201).json({
      success: true,
      data: enquiry,
      message: "Price inquiry submitted successfully!",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/v1/admin/enquiries/:id ──────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["new", "contacted", "closed"];
    if (!valid.includes(status)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid status value." });
    }
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found." });
    }
    return res.json({ success: true, data: enquiry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/v1/admin/enquiries/:id ──────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found." });
    }
    return res.json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
