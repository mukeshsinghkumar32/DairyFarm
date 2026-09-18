const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    slug:               { type: String, required: true, unique: true, lowercase: true, trim: true },
    category_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price:              { type: Number, default: null },
    show_price:         { type: Boolean, default: true },
    milk_capacity_min:  { type: Number, default: null },
    milk_capacity_max:  { type: Number, default: null },
    age:                { type: mongoose.Schema.Types.Mixed, default: null },
    lactation:          { type: String, default: '' },
    pregnancy_status:   { type: String, default: 'Not pregnant' },
    location:           { type: String, default: 'Sohani, Jaunpur' },
    availability:       { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' },
    featured:           { type: Boolean, default: false },
    status:             { type: Boolean, default: true },
    short_description:  { type: String, default: '' },
    description:        { type: String, default: '' },
    quantity:           { type: Number, default: 1 },
    featured_image:     { type: String, default: null },
    seller_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', default: null },
    weight:             { type: String, default: '' },
    gender:             { type: String, default: '' },
    breed:              { type: String, default: '' },
    delivery_time:      { type: String, default: '' },
    stock_quantity:     { type: Number, default: 1 },
    color:              { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual: populate category name inline
productSchema.virtual('category', {
  ref:         'Category',
  localField:  'category_id',
  foreignField: '_id',
  justOne:     true,
});

productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.category_id && typeof ret.category_id === 'object' && ret.category_id._id) {
      ret.category = {
        id: ret.category_id._id.toString(),
        _id: ret.category_id._id.toString(),
        name: ret.category_id.name,
        slug: ret.category_id.slug,
      };
      ret.category_id = ret.category_id._id.toString();
    } else if (ret.category_id) {
      ret.category_id = ret.category_id.toString();
    }
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);
