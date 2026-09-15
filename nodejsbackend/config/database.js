const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sohani_dairy';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected:', MONGODB_URI))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = mongoose;
