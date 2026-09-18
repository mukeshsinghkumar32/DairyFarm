const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

const seedDefaultSeller = require("../scripts/sellerSeed");

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected:", MONGODB_URI);
    await seedDefaultSeller();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = mongoose;
