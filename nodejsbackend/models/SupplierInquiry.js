const mongoose = require("mongoose");

const supplierInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },

    // Supplier / Seller / Farm details
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      default: null,
    },
    supplier_name: { type: String, default: "", trim: true },
    supplier_phone: { type: String, default: "", trim: true },
    supplier_email: { type: String, default: "", trim: true },
    supplier_location: { type: String, default: "", trim: true },

    // Optional product details if inquiry originated from a specific cow listing on seller page
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    product_name: { type: String, default: "", trim: true },

    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
    ip_address: { type: String, default: "" },
    page_url: { type: String, default: "" },
  },
  { timestamps: true }
);

supplierInquirySchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("SupplierInquiry", supplierInquirySchema);
