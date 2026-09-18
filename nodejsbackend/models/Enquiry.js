const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },

    // Product details
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    product_name: { type: String, default: "", trim: true },
    product_price: { type: Number, default: 0 },

    // Seller / Farm details
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      default: null,
    },
    seller_name: { type: String, default: "", trim: true },
    farm_name: { type: String, default: "", trim: true },
    seller_phone: { type: String, default: "", trim: true },

    inquiry_type: {
      type: String,
      default: "product_price_inquiry",
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
    ip_address: { type: String, default: "" },
    page_url: { type: String, default: "" },
  },
  { timestamps: true },
);

enquirySchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Enquiry", enquirySchema);
