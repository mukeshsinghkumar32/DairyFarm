const SupplierInquiry = require("../../models/SupplierInquiry");

const PER_PAGE = 20;

// POST /api/v1/supplier-inquiries or /supplier-inquiry (public)
exports.store = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      state,
      city,
      message,
      supplier_id,
      supplier_name,
      supplier_phone,
      supplier_email,
      supplier_location,
      product_id,
      product_name,
    } = req.body;

    if (!name || !phone || !message) {
      return res.status(422).json({
        success: false,
        message: "Full Name, Mobile Number, and Message are required.",
      });
    }

    const inquiry = await SupplierInquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      state: state ? state.trim() : "",
      city: city ? city.trim() : "",
      message: message.trim(),
      supplier_id: supplier_id || null,
      supplier_name: supplier_name ? supplier_name.trim() : "",
      supplier_phone: supplier_phone ? supplier_phone.trim() : "",
      supplier_email: supplier_email ? supplier_email.trim() : "",
      supplier_location: supplier_location ? supplier_location.trim() : "",
      product_id: product_id || null,
      product_name: product_name ? product_name.trim() : "",
      page_url: req.headers.referer || req.body.page_url || "",
      ip_address: req.ip || req.connection?.remoteAddress || "",
    });

    return res.status(201).json({
      success: true,
      data: inquiry,
      message: "Your inquiry has been submitted successfully to the dairy farm supplier!",
    });
  } catch (err) {
    console.error("Supplier inquiry store error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/supplier-inquiries (admin)
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
        { supplier_name: { $regex: searchTerm, $options: "i" } },
        { supplier_phone: { $regex: searchTerm, $options: "i" } },
        { supplier_location: { $regex: searchTerm, $options: "i" } },
        { city: { $regex: searchTerm, $options: "i" } },
        { state: { $regex: searchTerm, $options: "i" } },
        { product_name: { $regex: searchTerm, $options: "i" } },
        { message: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const [inquiries, total] = await Promise.all([
      SupplierInquiry.find(query)
        .populate("supplier_id", "business_name name phone email city state")
        .populate("product_id", "name price slug featured_image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SupplierInquiry.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        data: inquiries,
        total,
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("Supplier inquiries index error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/supplier-inquiries/:id (admin)
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

    const item = await SupplierInquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Supplier inquiry not found.",
      });
    }

    return res.json({ success: true, data: item });
  } catch (err) {
    console.error("Supplier inquiry update error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/admin/supplier-inquiries/:id (admin)
exports.destroy = async (req, res) => {
  try {
    const item = await SupplierInquiry.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Supplier inquiry not found.",
      });
    }

    return res.json({
      success: true,
      message: "Supplier inquiry deleted successfully.",
    });
  } catch (err) {
    console.error("Supplier inquiry destroy error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
