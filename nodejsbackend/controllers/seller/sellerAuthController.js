const jwt = require("jsonwebtoken");
const Seller = require("../../models/Seller");
const Product = require("../../models/Product");
const SellerBanner = require("../../models/SellerBanner");
const SellerAbout = require("../../models/SellerAbout");
const SellerOtp = require("../../models/SellerOtp");
const { sendOtpEmail } = require("../../utils/mailer");

// ─── POST /api/v1/sellers/auth/login ─────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const rawIdentifier = (username || email || "").trim();

    if (!rawIdentifier || !password) {
      return res.status(422).json({
        success: false,
        message: "Username/email and password are required.",
      });
    }

    const cleanIdentifier = rawIdentifier.toLowerCase();

    // Query seller by username, email, phone (if digits), or exact name
    const queryConditions = [
      { username: cleanIdentifier },
      { email: cleanIdentifier },
      {
        name: {
          $regex: new RegExp(
            `^${rawIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i",
          ),
        },
      },
    ];

    // Only search phone if input resembles a phone number (prevent matching blank phones)
    if (/^\+?[0-9]{7,15}$/.test(rawIdentifier.replace(/[\s-]/g, ""))) {
      queryConditions.push({ phone: rawIdentifier.replace(/[\s-]/g, "") });
    }

    const seller = await Seller.findOne({ $or: queryConditions });

    if (!seller || !(await seller.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    if (seller.status === "inactive") {
      return res.status(403).json({
        success: false,
        message:
          "Your seller account has been deactivated. Please contact support.",
      });
    }

    // Clear old JWT
    res.clearCookie("token");

    // Create new JWT
    const token = jwt.sign(
      {
        id: seller._id.toString(),
        username: seller.username,
        email: seller.email,
        role: "seller",
      },
      process.env.JWT_SECRET || "sohani_secret",
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      },
    );

    // Set new JWT
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: seller.toJSON(),
    });
  } catch (err) {
    console.error("Seller login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
};

// ─── POST /api/v1/sellers/auth/send-register-otp ─────────────────────────────
exports.sendRegisterOtp = async (req, res) => {
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
    } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(422).json({
        success: false,
        message: "Full name, username, email, and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check if email already registered
    const existingEmail = await Seller.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(422).json({
        success: false,
        message: "An account with this email already exists. Please sign in.",
      });
    }

    // Check if username already taken
    const existingUsername = await Seller.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(422).json({
        success: false,
        message:
          "This username is already taken. Please choose another username.",
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any previous pending OTP for this email
    await SellerOtp.deleteMany({ email: cleanEmail });

    // Store in SellerOtp
    await SellerOtp.create({
      email: cleanEmail,
      otp,
      registrationData: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        phone: (phone || "").trim(),
        password,
        business_name: (business_name || "Sohani Dairy Farm").trim(),
        business_address: (business_address || "").trim(),
        gst_number: (gst_number || "").trim(),
        state: (state || "").trim(),
        city: (city || "").trim(),
        pincode: (pincode || "").trim(),
      },
      expiresAt,
    });

    // Send email via mailer
    await sendOtpEmail(cleanEmail, otp, name.trim());

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}`,
      email: cleanEmail,
      debugOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send verification code." });
  }
};

// ─── POST /api/v1/sellers/auth/verify-register-otp ───────────────────────────
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(422).json({
        success: false,
        message: "Email and verification code (OTP) are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const record = await SellerOtp.findOne({
      email: cleanEmail,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message:
          "Verification code has expired or was not found. Please request a new code.",
      });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid verification code. Please check and enter the correct code.",
      });
    }

    // OTP matched! Create Seller
    const regData = record.registrationData;

    let seller = await Seller.findOne({
      $or: [{ email: cleanEmail }, { username: regData.username }],
    });

    if (!seller) {
      seller = await Seller.create({
        name: regData.name,
        username: regData.username,
        email: regData.email,
        phone: regData.phone,
        password: regData.password,
        business_name: regData.business_name || "Sohani Dairy Farm",
        business_address: regData.business_address || "",
        gst_number: regData.gst_number || "",
        state: regData.state || "",
        city: regData.city || "",
        pincode: regData.pincode || "",
        status: "active",
      });
    }

    // Clean up OTP record
    await SellerOtp.deleteMany({ email: cleanEmail });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: seller._id,
        username: seller.username,
        email: seller.email,
        role: "seller",
      },
      process.env.JWT_SECRET || "sohani_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return res.status(201).json({
      success: true,
      message: "Email verified successfully! Welcome to SellerKit.",
      token,
      user: seller.toJSON(),
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed." });
  }
};

// ─── POST /api/v1/sellers/auth/resend-otp ────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(422)
        .json({ success: false, message: "Email is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = await SellerOtp.findOne({ email: cleanEmail });

    if (!record) {
      return res.status(404).json({
        success: false,
        message:
          "No pending registration found for this email. Please start over.",
      });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    record.otp = newOtp;
    record.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await record.save();

    await sendOtpEmail(
      cleanEmail,
      newOtp,
      record.registrationData?.name || "Seller",
    );

    return res.json({
      success: true,
      message: `A new verification code has been sent to ${cleanEmail}`,
      debugOtp: process.env.NODE_ENV !== "production" ? newOtp : undefined,
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to resend code." });
  }
};

// ─── GET /api/v1/sellers/profile ─────────────────────────────────────────────
exports.profile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).select("-password");
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found." });
    }

    const productCount = await Product.countDocuments({
      seller_id: seller._id,
    });
    const bannerCount = await SellerBanner.countDocuments({
      seller_id: seller._id,
    });
    const aboutCount = await SellerAbout.countDocuments({
      seller_id: seller._id,
    });

    return res.json({
      success: true,
      data: {
        ...seller.toJSON(),
        stats: {
          products: productCount,
          banners: bannerCount,
          aboutSections: aboutCount,
        },
      },
    });
  } catch (err) {
    console.error("Seller profile error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching profile." });
  }
};

// ─── PUT /api/v1/sellers/profile ─────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found." });
    }

    const {
      name,
      phone,
      email,
      business_name,
      business_address,
      gst_number,
      state,
      city,
      pincode,
      password,
    } = req.body;

    if (name) seller.name = name.trim();
    if (phone !== undefined) seller.phone = phone.trim();
    if (email) seller.email = email.toLowerCase().trim();
    if (business_name) seller.business_name = business_name.trim();
    if (business_address !== undefined)
      seller.business_address = business_address.trim();
    if (gst_number !== undefined) seller.gst_number = gst_number.trim();
    if (state !== undefined) seller.state = state.trim();
    if (city !== undefined) seller.city = city.trim();
    if (pincode !== undefined) seller.pincode = pincode.trim();

    if (password && password.trim().length >= 6) {
      seller.password = password;
    }

    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        const avatarPath = `/uploads/sellers/${req.files.avatar[0].filename}`;
        seller.avatar = avatarPath;
        seller.business_image = avatarPath;
      }
      if (req.files.business_image && req.files.business_image[0]) {
        const bImgPath = `/uploads/sellers/${req.files.business_image[0].filename}`;
        seller.avatar = bImgPath;
        seller.business_image = bImgPath;
      }
      if (req.files.banner_image && req.files.banner_image[0]) {
        seller.banner_image = `/uploads/sellers/${req.files.banner_image[0].filename}`;
      }
    } else if (req.file) {
      const filePath = `/uploads/sellers/${req.file.filename}`;
      if (req.file.fieldname === "banner_image") {
        seller.banner_image = filePath;
      } else {
        seller.avatar = filePath;
        seller.business_image = filePath;
      }
    }

    if (req.body.avatar) {
      seller.avatar = req.body.avatar;
      seller.business_image = req.body.avatar;
    }
    if (req.body.business_image) {
      seller.avatar = req.body.business_image;
      seller.business_image = req.body.business_image;
    }
    if (req.body.banner_image !== undefined) {
      seller.banner_image = req.body.banner_image;
    }

    await seller.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: seller.toJSON(),
    });
  } catch (err) {
    console.error("Seller profile update error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error updating profile." });
  }
};

// ─── POST /api/v1/sellers/auth/logout ────────────────────────────────────────
exports.logout = async (_req, res) => {
  return res.json({
    success: true,
    message: "Seller logged out successfully.",
  });
};
