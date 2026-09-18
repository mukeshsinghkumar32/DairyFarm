const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: "", trim: true },
    password: { type: String, required: true },
    business_name: { type: String, default: "Sohani Dairy Farm", trim: true },
    business_address: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    gst_number: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    pincode: { type: String, default: "", trim: true },
    banner_image: { type: String, default: "" },
    avatar: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
    },
    business_image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
    },
    role: { type: String, default: "seller" },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual Populate for SellerAbout & SellerBanner
sellerSchema.virtual("sellerAbout", {
  ref: "SellerAbout",
  localField: "_id",
  foreignField: "seller_id",
});

sellerSchema.virtual("banners", {
  ref: "SellerBanner",
  localField: "_id",
  foreignField: "seller_id",
});

sellerSchema.virtual("sellerBanners", {
  ref: "SellerBanner",
  localField: "_id",
  foreignField: "seller_id",
});

// Hash password before saving
sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
sellerSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Strip password from JSON output
sellerSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

sellerSchema.set("toObject", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

// Ensure referenced models are registered for populate
require("./SellerAbout");
require("./SellerBanner");

module.exports = mongoose.model("Seller", sellerSchema);
