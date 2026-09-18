const mongoose = require('mongoose');

const sellerAboutSchema = new mongoose.Schema(
  {
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    title:     { type: String, required: true, trim: true },
    image:     { type: String, default: '' },
    content:   { type: String, default: '' },
  },
  { timestamps: true }
);

sellerAboutSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    if (ret.seller_id) ret.seller_id = ret.seller_id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('SellerAbout', sellerAboutSchema);
