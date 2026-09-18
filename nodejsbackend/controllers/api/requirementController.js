const Requirement = require("../../models/Requirement");

const PER_PAGE = 20;

// POST /api/v1/requirements (public)
exports.store = async (req, res) => {
  try {
    const { name, phone, email, requirement } = req.body;
    if (!name || !phone || !requirement) {
      return res.status(422).json({
        success: false,
        message: "Full Name, Mobile Number, and Requirement are required.",
      });
    }

    const newReq = await Requirement.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      requirement: requirement.trim(),
      page_url: req.headers.referer || "",
      ip_address: req.ip || req.connection?.remoteAddress || "",
    });

    return res.status(201).json({
      success: true,
      data: newReq,
      message: "Your requirement has been submitted successfully!",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/requirements (admin)
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
        { requirement: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const [requirements, total] = await Promise.all([
      Requirement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Requirement.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        data: requirements,
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

// PATCH /api/v1/admin/requirements/:id (admin)
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
    const reqItem = await Requirement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!reqItem) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found.",
      });
    }
    return res.json({ success: true, data: reqItem });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
