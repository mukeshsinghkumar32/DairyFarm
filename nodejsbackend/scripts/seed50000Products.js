/**
 * 50,000 Dummy Products Seeder
 * Connects to MongoDB 'sohani_dairy'
 * Generates and inserts 50,000 realistic cattle and buffalo products
 * linked with categories and distributed across all active sellers.
 */

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Seller = require("../models/Seller");

const TOTAL_PRODUCTS = 50000;
const BATCH_SIZE = 2500;

// Base Categories definition
const CATEGORIES_DEF = [
  {
    name: "HF Cow",
    slug: "hf-cow",
    breed: "Holstein Friesian",
    milk_min: 20,
    milk_max: 32,
    weight: "550-700 kg",
    color: "Black & White",
    price_min: 65000,
    price_max: 115000,
  },
  {
    name: "Gir Cow",
    slug: "gir-cow",
    breed: "Pure Gujarat Gir",
    milk_min: 14,
    milk_max: 22,
    weight: "380-480 kg",
    color: "Reddish Brown",
    price_min: 55000,
    price_max: 95000,
  },
  {
    name: "Murrah Buffalo",
    slug: "murrah-buffalo",
    breed: "Pure Murrah Breed",
    milk_min: 16,
    milk_max: 26,
    weight: "600-750 kg",
    color: "Jet Black",
    price_min: 75000,
    price_max: 135000,
  },
  {
    name: "Sahiwal Cow",
    slug: "sahiwal-cow",
    breed: "Pure Sahiwal Breed",
    milk_min: 14,
    milk_max: 20,
    weight: "350-450 kg",
    color: "Brownish Red",
    price_min: 50000,
    price_max: 88000,
  },
  {
    name: "Jersey Cow",
    slug: "jersey-cow",
    breed: "Jersey Cross",
    milk_min: 15,
    milk_max: 22,
    weight: "350-420 kg",
    color: "Fawn & White",
    price_min: 48000,
    price_max: 82000,
  },
  {
    name: "Tharparkar Cow",
    slug: "tharparkar-cow",
    breed: "Tharparkar Indigenous",
    milk_min: 12,
    milk_max: 18,
    weight: "380-460 kg",
    color: "White / Light Grey",
    price_min: 45000,
    price_max: 78000,
  },
  {
    name: "Crossbred Cow",
    slug: "crossbred-cow",
    breed: "HF Crossbred",
    milk_min: 18,
    milk_max: 28,
    weight: "450-550 kg",
    color: "Black / Brown Mix",
    price_min: 52000,
    price_max: 89000,
  },
  {
    name: "Jaffarabadi Buffalo",
    slug: "jaffarabadi-buffalo",
    breed: "Jaffarabadi Heavy Breed",
    milk_min: 18,
    milk_max: 28,
    weight: "650-850 kg",
    color: "Black",
    price_min: 80000,
    price_max: 145000,
  },
  {
    name: "Mehsana Buffalo",
    slug: "mehsana-buffalo",
    breed: "Mehsana Dairy Breed",
    milk_min: 14,
    milk_max: 22,
    weight: "500-650 kg",
    color: "Black",
    price_min: 70000,
    price_max: 110000,
  },
  {
    name: "Rathi Cow",
    slug: "rathi-cow",
    breed: "Rathi Cattle",
    milk_min: 12,
    milk_max: 17,
    weight: "340-420 kg",
    color: "Brown with White patches",
    price_min: 42000,
    price_max: 72000,
  },
];

const IMAGES = [
  "/uploads/products/1789559006862-890006302.jpeg",
  "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&q=80",
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80",
  "https://images.unsplash.com/photo-1501706362039-c06b2d715385?w=600&q=80",
  "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80",
  "https://images.unsplash.com/photo-1527153818091-1a9638521e2a?w=600&q=80",
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&q=80",
  "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80",
];

const PREGNANCY_STATUSES = [
  "Not pregnant",
  "Pregnant (2 months)",
  "Pregnant (3 months)",
  "Pregnant (5 months)",
  "Pregnant (7 months)",
  "Recently calved",
];

const LACTATIONS = ["1", "2", "3", "4", "1st Lactation", "2nd Lactation", "3rd Lactation"];
const DELIVERY_TIMES = ["2-3 Days", "3-5 Days", "Within 48 Hours", "Same Day Dispatch", "4-7 Days"];

const PREFIXES = [
  "Haryana", "Punjab", "Gujarat", "Karnal", "Anand", "Jaunpur", "Rohtak", "Hisar",
  "Desi", "Pure", "Royal", "Supreme", "High Yield", "Elite", "Organic", "Certified",
  "Champion", "Prime", "Top Quality", "Vansh", "Kamdhenu", "Gauri", "Nandini"
];

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDescription(cat, name, milkMin, milkMax, weight, sellerLocation) {
  return `We have marked a distinct position in the dairy domain by offering verified ${name}. This cattle can be easily and quickly recognized by its distinctive breed characteristics, healthy constitution and outstanding milk production. We source this animal directly from reputed dairy farms in ${sellerLocation}.\r\n\r\n` +
    `Other Detail:\r\n` +
    `Breed: ${cat.breed}\r\n` +
    `Milk Capacity : ${milkMin}-${milkMax} Liter Per day\r\n` +
    `Weight: ${weight}\r\n\r\n` +
    `Exceptional Dairy Productivity:\r\n` +
    `${cat.name} are globally recognized for their reliable milk yield and strong immunity, making them a preferred choice among commercial dairy operations and smallholder farmers across India. Their genetic potential supports consistent and high-volume milk production, helping farms enhance their daily output and profitability.\r\n\r\n` +
    `Adaptability and Ease of Management:\r\n` +
    `Thanks to robust constitution and climate adaptability, these animals thrive in diverse weather conditions across India. Their docile temperament and ease of management ensure smooth daily farm routines.\r\n\r\n` +
    `FAQs of ${cat.name}:\r\n` +
    `Q: How does this cattle benefit commercial dairy farms in India?\r\n` +
    `A: Prized for healthy fat content and high daily yield, translating directly into sustainable farm profits.\r\n` +
    `Q: What is the typical weight range?\r\n` +
    `A: Usually between ${weight}, indicating healthy growth and stamina.`;
}

async function seedProducts() {
  console.log("🚀 Starting 50,000 Products Seeder...");
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB:", mongoUri.split("@")[1] || "MongoDB Atlas");

  // 1. Ensure Categories
  console.log("📂 Checking / Initializing Categories...");
  const categoryDocs = [];
  for (const cDef of CATEGORIES_DEF) {
    let cat = await Category.findOne({ slug: cDef.slug });
    if (!cat) {
      cat = await Category.create({
        name: cDef.name,
        slug: cDef.slug,
        description: `${cDef.name} high-yield cattle for dairy farming`,
        image: sample(IMAGES),
        status: true,
      });
      console.log(`   + Created category: ${cDef.name}`);
    }
    categoryDocs.push({ doc: cat, def: cDef });
  }

  // 2. Fetch Active Sellers
  console.log("🏢 Fetching active sellers to distribute products across...");
  const sellers = await Seller.find({ status: "active" }).select("_id state city business_name");
  console.log(`   Found ${sellers.length} active sellers.`);

  if (sellers.length === 0) {
    console.warn("⚠️ No active sellers found. Please run seller seeder first!");
    process.exit(1);
  }

  const initialCount = await Product.countDocuments();
  console.log(`📊 Current Product count before seeding: ${initialCount.toLocaleString()}`);

  const totalBatches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);
  console.log(`📦 Will insert ${TOTAL_PRODUCTS.toLocaleString()} products in ${totalBatches} batches of ${BATCH_SIZE}...`);

  const startTime = Date.now();
  let insertedCount = 0;

  for (let b = 0; b < totalBatches; b++) {
    const batch = [];
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - insertedCount);

    for (let i = 0; i < currentBatchSize; i++) {
      const globalIndex = insertedCount + i + 1;
      const catObj = sample(categoryDocs);
      const cat = catObj.doc;
      const cDef = catObj.def;
      const seller = sample(sellers);

      const prefix = sample(PREFIXES);
      const productName = `${prefix} ${cDef.name}`;
      // Unique slug with index and random hex suffix
      const uniqueSuffix = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
      const slug = `${cDef.slug}-${globalIndex}-${uniqueSuffix}`.toLowerCase();

      const milkMin = cDef.milk_min + randInt(-2, 2);
      const milkMax = milkMin + randInt(3, 7);
      const price = Math.round((cDef.price_min + randInt(0, cDef.price_max - cDef.price_min)) / 500) * 500;
      const sellerLocation = seller.city && seller.state ? `${seller.city}, ${seller.state}` : "Sohani, Jaunpur";

      // Some featured are true and some are false (~14% featured)
      const isFeatured = Math.random() < 0.14;
      const ageVal = sample([3, 3.5, 4, 4.5, 5, null]);
      const qty = randInt(1, 4);

      const description = generateDescription(cDef, productName, milkMin, milkMax, cDef.weight, sellerLocation);

      batch.push({
        name: productName,
        slug,
        category_id: cat._id,
        price,
        show_price: true,
        milk_capacity_min: Math.max(10, milkMin),
        milk_capacity_max: milkMax,
        age: ageVal,
        lactation: sample(LACTATIONS),
        pregnancy_status: sample(PREGNANCY_STATUSES),
        location: sellerLocation,
        availability: "available",
        featured: isFeatured,
        status: true,
        short_description: `Healthy ${productName} with ${milkMin}-${milkMax} L/day milk yield.`,
        description,
        quantity: qty,
        featured_image: sample(IMAGES),
        seller_id: seller._id,
        weight: cDef.weight,
        gender: "Female",
        breed: cDef.breed,
        delivery_time: sample(DELIVERY_TIMES),
        stock_quantity: qty,
        color: cDef.color,
        createdAt: new Date(Date.now() - randInt(0, 90 * 24 * 3600 * 1000)),
        updatedAt: new Date(),
      });
    }

    try {
      await Product.insertMany(batch, { ordered: false });
      insertedCount += currentBatchSize;
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = ((insertedCount / TOTAL_PRODUCTS) * 100).toFixed(1);
      console.log(`   [Batch ${b + 1}/${totalBatches}] Inserted ${insertedCount.toLocaleString()} / ${TOTAL_PRODUCTS.toLocaleString()} products (${pct}%) in ${elapsedSec}s`);
    } catch (err) {
      console.error(`   ⚠️ Batch ${b + 1} insert error:`, err.message);
      // If some inserted, track count
      insertedCount += currentBatchSize;
    }
  }

  const finalCount = await Product.countDocuments();
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Successfully completed 50,000 Products Seeder!`);
  console.log(`   Final Total Products in Database: ${finalCount.toLocaleString()}`);
  console.log(`   Total time taken: ${durationSec} seconds`);
  console.log(`   Distributed evenly across ${sellers.length} sellers with featured=true & featured=false.\n`);

  process.exit(0);
}

seedProducts().catch((err) => {
  console.error("❌ Fatal Seeder Error:", err);
  process.exit(1);
});
