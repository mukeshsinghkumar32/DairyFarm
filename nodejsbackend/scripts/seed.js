require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── Models ──────────────────────────────────────────────────────────────────
const Admin = require("../models/Admin");
const Category = require("../models/Category");
const Product = require("../models/Product");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // ─── Admin ───────────────────────────────────────────────────────────────
    const existing = await Admin.findOne({ email: "admin@sohanidairy.in" });
    if (!existing) {
      await Admin.create({
        name: "Sohani Admin",
        email: "admin@sohanidairy.in",
        password: "Admin@123",
        role: "admin",
      });
      console.log("✅ Admin user created  →  admin@sohanidairy.in / Admin@123");
    } else {
      console.log("ℹ️  Admin already exists — skipping");
    }

    // ─── Categories ──────────────────────────────────────────────────────────
    const catData = [
      {
        name: "HF Cow",
        slug: "hf-cow",
        description: "Holstein Friesian high-yield dairy cows",
        sort_order: 1,
      },
      {
        name: "Jersey Cow",
        slug: "jersey-cow",
        description: "Jersey breed known for rich milk quality",
        sort_order: 2,
      },
      {
        name: "Sahiwal Cow",
        slug: "sahiwal-cow",
        description: "Indigenous Indian high-milk breed",
        sort_order: 3,
      },
      {
        name: "Murrah Buffalo",
        slug: "murrah-buffalo",
        description: "Premium Murrah breed buffaloes",
        sort_order: 4,
      },
      {
        name: "Crossbred Cow",
        slug: "crossbred-cow",
        description: "Crossbred dairy cattle for Indian climate",
        sort_order: 5,
      },
    ];

    const categories = [];
    for (const cat of catData) {
      let category = await Category.findOne({ slug: cat.slug });
      if (!category) {
        category = await Category.create({ ...cat, status: true });
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        console.log(`ℹ️  Category exists: ${cat.name}`);
      }
      categories.push(category);
    }

    // ─── Sample Products ─────────────────────────────────────────────────────
    const productData = [
      {
        name: "Lakshmi HF Cow",
        slug: "lakshmi-hf-cow",
        category: "hf-cow",
        price: 85000,
        milk_capacity_min: 18,
        milk_capacity_max: 22,
        age: 4,
        lactation: "2nd",
        pregnancy_status: "Not pregnant",
        description:
          "Healthy HF cow with excellent milk yield. Vaccinated and dewormed.",
        featured: true,
        availability: "available",
      },
      {
        name: "Gauri Jersey Cow",
        slug: "gauri-jersey-cow",
        category: "jersey-cow",
        price: 72000,
        milk_capacity_min: 14,
        milk_capacity_max: 18,
        age: 3.5,
        lactation: "1st",
        pregnancy_status: "Pregnant (7 months)",
        description:
          "Beautiful Jersey cow with high fat content milk ideal for ghee and paneer.",
        featured: true,
        availability: "available",
      },
      {
        name: "Kamdhenu Sahiwal",
        slug: "kamdhenu-sahiwal",
        category: "sahiwal-cow",
        price: 65000,
        milk_capacity_min: 12,
        milk_capacity_max: 16,
        age: 5,
        lactation: "3rd",
        pregnancy_status: "Not pregnant",
        description:
          "Pure Sahiwal breed from UP. Hardy and adaptable to Indian climate.",
        featured: false,
        availability: "available",
      },
      {
        name: "Nandini Murrah Buffalo",
        slug: "nandini-murrah-buffalo",
        category: "murrah-buffalo",
        price: 95000,
        milk_capacity_min: 10,
        milk_capacity_max: 14,
        age: 4,
        lactation: "2nd",
        pregnancy_status: "Pregnant (5 months)",
        description:
          "Top-quality Murrah buffalo. High fat percentage milk, 7–8%.",
        featured: true,
        availability: "available",
      },
    ];

    for (const pd of productData) {
      const exists = await Product.findOne({ slug: pd.slug });
      if (!exists) {
        const cat = categories.find((c) => c.slug === pd.category);
        if (!cat) continue;
        const { category, ...rest } = pd;
        await Product.create({
          ...rest,
          category_id: cat._id,
          status: true,
          location: "Sohani, Jaunpur",
        });
        console.log(`✅ Product created: ${pd.name}`);
      } else {
        console.log(`ℹ️  Product exists: ${pd.name}`);
      }
    }

    console.log("\n🎉 Seed complete!");
    console.log("   Admin login: admin@sohanidairy.in / Admin@123");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
