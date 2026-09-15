const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    phone:   { type: String, required: true, trim: true },
    email:   { type: String, default: '', trim: true },
    city:    { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    status:  { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

enquirySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Enquiry', enquirySchema);
