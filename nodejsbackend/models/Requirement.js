const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    phone:       { type: String, required: true, trim: true },
    email:       { type: String, default: '', trim: true },
    requirement: { type: String, required: true, trim: true },
    status:      { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
    ip_address:  { type: String, default: '' },
    page_url:    { type: String, default: '' },
  },
  { timestamps: true }
);

requirementSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Requirement', requirementSchema);
