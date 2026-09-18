const mongoose = require('mongoose');

const sellerOtpSchema = new mongoose.Schema(
  {
    email:            { type: String, required: true, lowercase: true, trim: true, index: true },
    otp:              { type: String, required: true },
    registrationData: { type: Object, required: true },
    expiresAt:        { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerOtp', sellerOtpSchema);
