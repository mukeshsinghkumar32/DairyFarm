const mongoose = require("mongoose");
const Product = require("../../models/Product");
const Seller = require("../../models/Seller");
const { parseWithOpenAI, generateOpenAISummary } = require("../../services/openaiService");

/**
 * Intelligent AI Search Query Parser
 * Extracts structured entities and intent from natural language or direct queries.
 */
function parseAISearchQuery(queryStr = "") {
  const original = (queryStr || "").trim();
  if (!original) {
    return {
      raw: "",
      cleanedQuery: "",
      tokens: [],
      price: null,
      milk_capacity: null,
      weight: null,
      delivery_time: null,
      breed: null,
      pincode: null,
      gst_number: null,
      location: null,
      isNumericOnly: false,
      detectedTags: [],
    };
  }

  let text = original;
  const detectedTags = [];

  // 1. Detect GST Number (15 chars format e.g. 07AABCS1429B1Z1 or 10-15 alphanumeric matching GST pattern)
  let gst_number = null;
  const gstRegex = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/i;
  const gstMatch = text.match(gstRegex);
  if (gstMatch) {
    gst_number = gstMatch[0].toUpperCase();
    text = text.replace(gstMatch[0], " ");
    detectedTags.push({ type: "gst", label: `GST: ${gst_number}`, value: gst_number });
  }

  // 2. Detect 6-digit Indian Pincode
  let pincode = null;
  const pincodeRegex = /\b[1-9][0-9]{5}\b/;
  const pinMatch = text.match(pincodeRegex);
  if (pinMatch) {
    pincode = pinMatch[0];
    text = text.replace(pinMatch[0], " ");
    detectedTags.push({ type: "pincode", label: `PIN: ${pincode}`, value: pincode });
  }

  // Helper to parse 'k' multiplier (e.g. 60k -> 60000, 1.5k -> 1500)
  const parseNumWithK = (val) => {
    if (!val) return null;
    const str = String(val).toLowerCase().trim().replace(/,/g, "");
    if (str.endsWith("k")) {
      return parseFloat(str.slice(0, -1)) * 1000;
    }
    return parseFloat(str);
  };

  // 3. Price Intent
  let price = null;
  // Between / Range: "50000 to 80000", "50k - 80k", "between 50000 and 80000"
  const priceRangeRegex = /(?:between\s+)?(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?k?|\d{4,7})\s*(?:to|-|and)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?k?|\d{4,7})\s*(?:rs|inr|rupees)?/i;
  const rangeMatch = text.match(priceRangeRegex);
  if (rangeMatch) {
    const minP = parseNumWithK(rangeMatch[1]);
    const maxP = parseNumWithK(rangeMatch[2]);
    if (!isNaN(minP) && !isNaN(maxP)) {
      price = { min: Math.min(minP, maxP), max: Math.max(minP, maxP) };
      text = text.replace(rangeMatch[0], " ");
      detectedTags.push({
        type: "price",
        label: `Price: ₹${price.min.toLocaleString()} - ₹${price.max.toLocaleString()}`,
        value: price,
      });
    }
  }

  // Max price: "under 60000", "below 70k", "upto 80000", "<= 50000", "< 60000", "less than 60k"
  if (!price) {
    const priceMaxRegex = /(?:under|below|upto|up\s+to|less\s+than|<=\s*|<\s*|max\s*)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?k?|\d{4,7})/i;
    const maxMatch = text.match(priceMaxRegex);
    if (maxMatch) {
      const maxVal = parseNumWithK(maxMatch[1]);
      if (!isNaN(maxVal)) {
        price = { max: maxVal };
        text = text.replace(maxMatch[0], " ");
        detectedTags.push({
          type: "price",
          label: `Max Price: ₹${maxVal.toLocaleString()}`,
          value: price,
        });
      }
    }
  }

  // Min price: "above 40000", "more than 50k", ">= 40000", "> 40000", "min 40000"
  if (!price) {
    const priceMinRegex = /(?:above|more\s+than|>=\s*|>\s*|min\s*)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?k?|\d{4,7})/i;
    const minMatch = text.match(priceMinRegex);
    if (minMatch) {
      const minVal = parseNumWithK(minMatch[1]);
      if (!isNaN(minVal)) {
        price = { min: minVal };
        text = text.replace(minMatch[0], " ");
        detectedTags.push({
          type: "price",
          label: `Min Price: ₹${minVal.toLocaleString()}`,
          value: price,
        });
      }
    }
  }

  // Standalone price with currency/k indicator: "85000 rs", "rs 85000", "₹85000", "75k"
  if (!price) {
    const standalonePriceRegex = /(?:(?:rs\.?|inr|₹)\s*(\d+(?:\.\d+)?k?|\d{4,7}))|(?:(\d+(?:\.\d+)?k?|\d{4,7})\s*(?:rs|inr|rupees))/i;
    const standMatch = text.match(standalonePriceRegex);
    if (standMatch) {
      const numStr = standMatch[1] || standMatch[2];
      const pVal = parseNumWithK(numStr);
      if (!isNaN(pVal) && pVal >= 1000) {
        // approximate exact price with 20% margin for flexible AI search
        price = { min: Math.round(pVal * 0.8), max: Math.round(pVal * 1.2), target: pVal };
        text = text.replace(standMatch[0], " ");
        detectedTags.push({
          type: "price",
          label: `Around ₹${pVal.toLocaleString()}`,
          value: price,
        });
      }
    }
  }

  // 4. Milk Capacity Intent: "20 liter", "18-22 ltr", "25 L", "capacity 20", "milk 15 liter"
  let milk_capacity = null;
  const capacityRangeRegex = /(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:liter|liters|litre|litres|ltr|ltrs|l\b)/i;
  const capRangeMatch = text.match(capacityRangeRegex);
  if (capRangeMatch) {
    const minC = parseFloat(capRangeMatch[1]);
    const maxC = parseFloat(capRangeMatch[2]);
    milk_capacity = { min: Math.min(minC, maxC), max: Math.max(minC, maxC) };
    text = text.replace(capRangeMatch[0], " ");
    detectedTags.push({
      type: "capacity",
      label: `Milk: ${milk_capacity.min}-${milk_capacity.max} L/day`,
      value: milk_capacity,
    });
  } else {
    const capacitySingleRegex = /(?:capacity|milk\s*(?:yield|capacity)?)?\s*(\d+(?:\.\d+)?)\s*(?:liter|liters|litre|litres|ltr|ltrs|l\b)/i;
    const capSingleMatch = text.match(capacitySingleRegex);
    if (capSingleMatch && capSingleMatch[1]) {
      const cVal = parseFloat(capSingleMatch[1]);
      if (!isNaN(cVal) && cVal > 0 && cVal <= 100) {
        milk_capacity = { min: Math.max(1, cVal - 3), max: cVal + 3, target: cVal };
        text = text.replace(capSingleMatch[0], " ");
        detectedTags.push({
          type: "capacity",
          label: `Milk: ~${cVal} L/day`,
          value: milk_capacity,
        });
      }
    }
  }

  // 5. Weight Intent: "450 kg", "500kg", "400 kilo"
  let weight = null;
  const weightRegex = /(\d{2,4})\s*(?:kg|kgs|kilo|kilos)/i;
  const weightMatch = text.match(weightRegex);
  if (weightMatch) {
    weight = weightMatch[1];
    text = text.replace(weightMatch[0], " ");
    detectedTags.push({ type: "weight", label: `Weight: ~${weight} kg`, value: weight });
  }

  // 6. Delivery Time Intent: "within 3 days", "3 days delivery", "same day", "48 hours"
  let delivery_time = null;
  const deliveryRegex = /(?:delivery(?:\s+time)?\s*(?:within)?\s*(\d+\s*(?:days?|hours?|weeks?)|same\s+day))|(?:(\d+\s*(?:days?|hours?|weeks?))\s*delivery)/i;
  const deliveryMatch = text.match(deliveryRegex);
  if (deliveryMatch) {
    delivery_time = (deliveryMatch[1] || deliveryMatch[2]).trim();
    text = text.replace(deliveryMatch[0], " ");
    detectedTags.push({
      type: "delivery",
      label: `Delivery: ${delivery_time}`,
      value: delivery_time,
    });
  }

  // 7. Known Cattle Breeds Detection
  const KNOWN_BREEDS = [
    "Murrah",
    "Gir",
    "HF",
    "Holstein",
    "Holstein Friesian",
    "Sahiwal",
    "Jersey",
    "Tharparkar",
    "Red Sindhi",
    "Rathi",
    "Kankrej",
    "Jaffarabadi",
    "Mehsana",
    "Banni",
    "Nili Ravi",
    "Nagpuri",
    "Crossbred",
    "Khillari",
    "Hallikar",
  ];
  let breed = null;
  for (const b of KNOWN_BREEDS) {
    const bRegex = new RegExp(`\\b${b}\\b`, "i");
    if (bRegex.test(text)) {
      breed = b;
      text = text.replace(bRegex, " ");
      detectedTags.push({ type: "breed", label: `Breed: ${breed}`, value: breed });
      break;
    }
  }

  // 8. Clean up remaining tokens
  // Remove filler words
  const stopWords = new Set([
    "a", "an", "the", "in", "at", "for", "with", "and", "or", "of", "to", "from",
    "on", "by", "is", "are", "cow", "cows", "buffalo", "buffaloes", "cattle",
    "sell", "seller", "sellers", "buy", "product", "products", "dairy", "farm"
  ]);

  const rawTokens = text
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const tokens = [];
  for (const tok of rawTokens) {
    if (!stopWords.has(tok.toLowerCase()) && tok.length > 1) {
      tokens.push(tok);
    }
  }

  // If tokens contains single numeric term and no price was set, it might be raw price or yield
  if (tokens.length === 1 && /^\d+$/.test(tokens[0])) {
    const num = parseInt(tokens[0], 10);
    if (num >= 5000) {
      if (!price) price = { max: num };
    } else if (num >= 5 && num <= 60 && !milk_capacity) {
      milk_capacity = { min: num - 2, max: num + 2 };
    }
  }

  const cleanedQuery = tokens.join(" ").trim();
  const isNumericOnly = /^\d+$/.test(original.trim());

  return {
    raw: original,
    cleanedQuery,
    tokens,
    price,
    milk_capacity,
    weight,
    delivery_time,
    breed,
    pincode,
    gst_number,
    detectedTags,
    isNumericOnly,
  };
}

/**
 * Build Product Search Query
 * Covers: name, description, price, milk_capacity_min, milk_capacity_max, location, weight, breed, delivery_time
 */
function buildProductQuery(aiParsed) {
  const query = { status: true };
  const andConditions = [];

  // Price criteria
  if (aiParsed.price) {
    const priceCond = {};
    if (typeof aiParsed.price.min === "number") priceCond.$gte = aiParsed.price.min;
    if (typeof aiParsed.price.max === "number") priceCond.$lte = aiParsed.price.max;
    andConditions.push({ price: priceCond });
  }

  // Milk capacity criteria
  if (aiParsed.milk_capacity) {
    const { min, max } = aiParsed.milk_capacity;
    if (typeof min === "number" && typeof max === "number") {
      andConditions.push({
        $or: [
          { milk_capacity_max: { $gte: min } },
          { milk_capacity_min: { $lte: max } },
        ],
      });
    } else if (typeof min === "number") {
      andConditions.push({ milk_capacity_max: { $gte: min } });
    } else if (typeof max === "number") {
      andConditions.push({ milk_capacity_min: { $lte: max } });
    }
  }

  // Weight criteria
  if (aiParsed.weight) {
    const wRegex = new RegExp(aiParsed.weight, "i");
    andConditions.push({ weight: wRegex });
  }

  // Delivery time criteria
  if (aiParsed.delivery_time) {
    const dRegex = new RegExp(aiParsed.delivery_time, "i");
    andConditions.push({ delivery_time: dRegex });
  }

  // Breed criteria
  if (aiParsed.breed) {
    const bRegex = new RegExp(aiParsed.breed, "i");
    andConditions.push({
      $or: [
        { breed: bRegex },
        { name: bRegex },
        { description: bRegex },
      ],
    });
  }

  // Location criteria
  if (aiParsed.location) {
    const locRegex = new RegExp(aiParsed.location, "i");
    andConditions.push({
      $or: [
        { location: locRegex },
        { description: locRegex },
      ],
    });
  }

  // Text tokens across: name, description, location, weight, breed, delivery_time
  const tokensToMatch = [...aiParsed.tokens];
  // If no specific fields were extracted but user entered a query, match tokens
  if (tokensToMatch.length > 0) {
    const tokenConditions = tokensToMatch.map((t) => {
      const reg = new RegExp(t, "i");
      return {
        $or: [
          { name: reg },
          { description: reg },
          { short_description: reg },
          { location: reg },
          { breed: reg },
          { weight: reg },
          { delivery_time: reg },
        ],
      };
    });
    // AND together tokens for precision
    andConditions.push({ $and: tokenConditions });
  } else if (!aiParsed.price && !aiParsed.milk_capacity && !aiParsed.breed && !aiParsed.weight && !aiParsed.location && aiParsed.raw) {
    // Fallback: match raw string
    const fallbackReg = new RegExp(aiParsed.raw.trim(), "i");
    andConditions.push({
      $or: [
        { name: fallbackReg },
        { description: fallbackReg },
        { location: fallbackReg },
        { breed: fallbackReg },
        { weight: fallbackReg },
        { delivery_time: fallbackReg },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return query;
}

/**
 * Build Seller Search Query
 * Covers: name, business_name, business_address, state, city, pincode, gst_number
 */
function buildSellerQuery(aiParsed) {
  const query = { status: "active" };
  const andConditions = [];

  // GST Number match
  if (aiParsed.gst_number) {
    andConditions.push({
      gst_number: { $regex: new RegExp(aiParsed.gst_number, "i") },
    });
  }

  // Pincode match
  if (aiParsed.pincode) {
    andConditions.push({
      $or: [
        { pincode: aiParsed.pincode },
        { business_address: { $regex: new RegExp(aiParsed.pincode, "i") } },
      ],
    });
  }

  // Location / State / City match
  const locTarget = aiParsed.city || aiParsed.state || aiParsed.location;
  if (locTarget) {
    const locRegex = new RegExp(locTarget, "i");
    andConditions.push({
      $or: [
        { state: locRegex },
        { city: locRegex },
        { business_address: locRegex },
        { business_name: locRegex },
      ],
    });
  }

  // Seller Owner name
  if (aiParsed.seller_name) {
    andConditions.push({
      name: { $regex: new RegExp(aiParsed.seller_name, "i") },
    });
  }

  // Farm / Business name
  if (aiParsed.business_name) {
    andConditions.push({
      business_name: { $regex: new RegExp(aiParsed.business_name, "i") },
    });
  }

  // If user entered raw numeric query (e.g. 132001 or GST), also search pincode/gst directly
  if (aiParsed.isNumericOnly && !aiParsed.pincode) {
    const numStr = aiParsed.raw.trim();
    andConditions.push({
      $or: [
        { pincode: { $regex: new RegExp(numStr, "i") } },
        { phone: { $regex: new RegExp(numStr, "i") } },
      ],
    });
  }

  // Keyword tokens across: name, business_name, business_address, state, city, pincode, gst_number
  const tokensToMatch = [...aiParsed.tokens];
  if (tokensToMatch.length > 0) {
    const tokenConditions = tokensToMatch.map((t) => {
      const reg = new RegExp(t, "i");
      return {
        $or: [
          { name: reg },
          { business_name: reg },
          { business_address: reg },
          { state: reg },
          { city: reg },
          { pincode: reg },
          { gst_number: reg },
        ],
      };
    });
    andConditions.push({ $and: tokenConditions });
  } else if (!aiParsed.gst_number && !aiParsed.pincode && !locTarget && !aiParsed.seller_name && !aiParsed.business_name && aiParsed.raw && !aiParsed.price && !aiParsed.milk_capacity) {
    // If raw query without special intent
    const fallbackReg = new RegExp(aiParsed.raw.trim(), "i");
    andConditions.push({
      $or: [
        { name: fallbackReg },
        { business_name: fallbackReg },
        { business_address: fallbackReg },
        { state: fallbackReg },
        { city: fallbackReg },
        { pincode: fallbackReg },
        { gst_number: fallbackReg },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return query;
}

/**
 * GET /api/v1/search
 * Comprehensive AI-powered search across Products and Sellers
 */
exports.search = async (req, res) => {
  try {
    const rawQuery = (req.query.q || req.query.query || "").trim();
    const type = (req.query.type || "all").toLowerCase(); // "all" | "products" | "sellers"
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || req.query.per_page, 10) || 20));
    const skip = (page - 1) * limit;

    let aiParsed = parseAISearchQuery(rawQuery);
    let aiProvider = "Sohani AI Engine";

    // Attempt OpenAI (ChatGPT) parsing if configured
    let openAiDebug = null;
    try {
      const openAiResult = await parseWithOpenAI(rawQuery);
      if (openAiResult && openAiResult.success && openAiResult.data) {
        const openAiParsed = openAiResult.data;
        aiProvider = "OpenAI (ChatGPT)";
        aiParsed.is_openai = true;
        if (openAiParsed.ai_intent_summary) {
          aiParsed.ai_intent_summary = openAiParsed.ai_intent_summary;
        }
        if (openAiParsed.price) aiParsed.price = openAiParsed.price;
        if (openAiParsed.milk_capacity) aiParsed.milk_capacity = openAiParsed.milk_capacity;
        if (openAiParsed.weight) aiParsed.weight = openAiParsed.weight;
        if (openAiParsed.breed) aiParsed.breed = openAiParsed.breed;
        if (openAiParsed.delivery_time) aiParsed.delivery_time = openAiParsed.delivery_time;
        if (openAiParsed.location) aiParsed.location = openAiParsed.location;
        if (openAiParsed.city) aiParsed.city = openAiParsed.city;
        if (openAiParsed.state) aiParsed.state = openAiParsed.state;
        if (openAiParsed.pincode) aiParsed.pincode = openAiParsed.pincode;
        if (openAiParsed.gst_number) aiParsed.gst_number = openAiParsed.gst_number;
        if (openAiParsed.seller_name) aiParsed.seller_name = openAiParsed.seller_name;
        if (openAiParsed.business_name) aiParsed.business_name = openAiParsed.business_name;
        if (openAiParsed.keywords && openAiParsed.keywords.length > 0) {
          aiParsed.tokens = openAiParsed.keywords;
        }

        // Rebuild clean tags from OpenAI results
        const openAiTags = [];
        if (openAiParsed.breed) {
          openAiTags.push({ type: "breed", label: `Breed: ${openAiParsed.breed}` });
        }
        if (openAiParsed.price) {
          if (openAiParsed.price.min && openAiParsed.price.max) {
            openAiTags.push({
              type: "price",
              label: `Price: ₹${Number(openAiParsed.price.min).toLocaleString("en-IN")} - ₹${Number(openAiParsed.price.max).toLocaleString("en-IN")}`,
            });
          } else if (openAiParsed.price.max) {
            openAiTags.push({
              type: "price",
              label: `Max Price: ₹${Number(openAiParsed.price.max).toLocaleString("en-IN")}`,
            });
          } else if (openAiParsed.price.min) {
            openAiTags.push({
              type: "price",
              label: `Min Price: ₹${Number(openAiParsed.price.min).toLocaleString("en-IN")}`,
            });
          }
        }
        if (openAiParsed.milk_capacity) {
          if (openAiParsed.milk_capacity.min && openAiParsed.milk_capacity.max) {
            openAiTags.push({
              type: "capacity",
              label: `Milk: ${openAiParsed.milk_capacity.min}-${openAiParsed.milk_capacity.max} L/day`,
            });
          } else if (openAiParsed.milk_capacity.min) {
            openAiTags.push({
              type: "capacity",
              label: `Milk: ${openAiParsed.milk_capacity.min}+ L/day`,
            });
          } else if (openAiParsed.milk_capacity.max) {
            openAiTags.push({
              type: "capacity",
              label: `Milk: Up to ${openAiParsed.milk_capacity.max} L/day`,
            });
          }
        }
        const loc = openAiParsed.city || openAiParsed.state || openAiParsed.location;
        if (loc) {
          openAiTags.push({ type: "location", label: `Location: ${loc}` });
        }
        if (openAiParsed.pincode) {
          openAiTags.push({ type: "pincode", label: `PIN: ${openAiParsed.pincode}` });
        }
        if (openAiParsed.gst_number) {
          openAiTags.push({ type: "gst", label: `GST: ${openAiParsed.gst_number}` });
        }
        if (openAiParsed.weight) {
          openAiTags.push({ type: "weight", label: `Weight: ${openAiParsed.weight}` });
        }
        if (openAiParsed.delivery_time) {
          openAiTags.push({ type: "delivery", label: `Delivery: ${openAiParsed.delivery_time}` });
        }
        if (openAiParsed.seller_name) {
          openAiTags.push({ type: "seller", label: `Seller: ${openAiParsed.seller_name}` });
        }
        if (openAiParsed.business_name) {
          openAiTags.push({ type: "farm", label: `Farm: ${openAiParsed.business_name}` });
        }
        if (openAiTags.length > 0) {
          aiParsed.detectedTags = openAiTags;
        }
      } else if (openAiResult && !openAiResult.success) {
        openAiDebug = openAiResult;
        console.warn("[OpenAI Debug] Request failed:", openAiResult);
      }
    } catch (openAiErr) {
      openAiDebug = { error: openAiErr.message };
      console.warn("OpenAI parsing fallback:", openAiErr.message);
    }

    let products = [];
    let productTotal = 0;
    let sellers = [];
    let sellerTotal = 0;

    const searchProducts = type === "all" || type === "products";
    const searchSellers = type === "all" || type === "sellers";

    const productQuery = buildProductQuery(aiParsed);
    const sellerQuery = buildSellerQuery(aiParsed);

    // Fetch total matching counts for both collections (so tabs always show total counts)
    const [pTotal, sTotal] = await Promise.all([
      Product.countDocuments(productQuery),
      Seller.countDocuments(sellerQuery),
    ]);
    productTotal = pTotal;
    sellerTotal = sTotal;

    const promises = [];

    if (searchProducts) {
      promises.push(
        Product.find(productQuery)
          .populate("category_id", "name slug")
          .populate("seller_id", "name business_name phone city state avatar")
          .sort({ featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then((docs) => {
            products = docs;
          })
      );
    }

    if (searchSellers) {
      promises.push(
        Seller.find(sellerQuery)
          .select("-password")
          .sort({ featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then(async (docs) => {
            // Attach product count for sellers
            const withCount = await Promise.all(
              docs.map(async (s) => {
                const count = await Product.countDocuments({ seller_id: s._id, status: true });
                return { ...s, product_count: count };
              })
            );
            sellers = withCount;
          })
      );
    }

    await Promise.all(promises);

    // Optional OpenAI Advisor Note
    let aiAdvisorNote = null;
    try {
      if (process.env.OPENAI_API_KEY && (products.length > 0 || sellers.length > 0)) {
        aiAdvisorNote = await generateOpenAISummary(rawQuery, products, sellers);
      }
    } catch (summaryErr) {
      console.warn("Advisor summary error:", summaryErr.message);
    }

    const productPages = Math.ceil(productTotal / limit) || 1;
    const sellerPages = Math.ceil(sellerTotal / limit) || 1;
    const totalPages =
      type === "products"
        ? productPages
        : type === "sellers"
          ? sellerPages
          : Math.max(productPages, sellerPages);

    return res.json({
      success: true,
      query: rawQuery,
      ai_provider: aiProvider,
      ai_advisor_note: aiAdvisorNote,
      openai_debug: openAiDebug,
      ai_parsed: {
        raw: aiParsed.raw,
        cleaned: aiParsed.cleanedQuery,
        ai_intent_summary: aiParsed.ai_intent_summary || null,
        breed: aiParsed.breed,
        price: aiParsed.price,
        milk_capacity: aiParsed.milk_capacity,
        weight: aiParsed.weight,
        delivery_time: aiParsed.delivery_time,
        pincode: aiParsed.pincode,
        gst_number: aiParsed.gst_number,
        tags: aiParsed.detectedTags,
      },
      counts: {
        products: productTotal,
        sellers: sellerTotal,
        total: productTotal + sellerTotal,
      },
      pagination: {
        page,
        limit,
        product_pages: productPages,
        seller_pages: sellerPages,
        total_pages: totalPages,
      },
      data: {
        products,
        sellers,
      },
    });
  } catch (err) {
    console.error("AI Search Error:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing AI search.",
      error: err.message,
    });
  }
};

/**
 * GET /api/v1/search/suggestions
 * Fast live autocomplete popup suggestions for header search bar
 */
exports.suggestions = async (req, res) => {
  try {
    const rawQuery = (req.query.q || req.query.query || "").trim();
    if (!rawQuery || rawQuery.length < 2) {
      return res.json({
        success: true,
        data: { products: [], sellers: [], tags: [] },
      });
    }

    const aiParsed = parseAISearchQuery(rawQuery);
    const productQuery = buildProductQuery(aiParsed);
    const sellerQuery = buildSellerQuery(aiParsed);

    const [products, sellers] = await Promise.all([
      Product.find(productQuery)
        .select("name slug price featured_image breed milk_capacity_min milk_capacity_max location weight delivery_time")
        .limit(4)
        .lean(),
      Seller.find(sellerQuery)
        .select("name business_name city state pincode gst_number avatar business_image username")
        .limit(4)
        .lean(),
    ]);

    return res.json({
      success: true,
      data: {
        products,
        sellers,
        tags: aiParsed.detectedTags,
        counts: {
          products: products.length,
          sellers: sellers.length,
        },
      },
    });
  } catch (err) {
    console.error("Suggestions Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
