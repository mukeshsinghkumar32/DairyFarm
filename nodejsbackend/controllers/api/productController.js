const Product = require("../../models/Product");
const Seller = require("../../models/Seller");
const mongoose = require("mongoose");
const PER_PAGE = 10;

// ─── GET /api/v1/sellers (Public sellers list, e.g. ?featured=1) ─────────────
exports.seller = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.per_page || req.query.limit, 10) || PER_PAGE;
    const skip = (page - 1) * perPage;

    const query = {};
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    } else {
      query.status = "active";
    }

    if (req.query.featured === "1" || req.query.featured === "true") {
      query.featured = true;
    } else if (req.query.featured === "0" || req.query.featured === "false") {
      query.featured = { $ne: true };
    }

    if (req.params && req.params.slug) {
      query.$or = [{ username: req.params.slug }, { _id: req.params.slug }];
    }

    const searchTerm = (req.query.search || req.query.q || "").trim();
    if (searchTerm) {
      const sRegex = new RegExp(searchTerm, "i");
      query.$or = [
        { name: sRegex },
        { business_name: sRegex },
        { city: sRegex },
        { state: sRegex },
        { business_address: sRegex },
      ];
    }

    if (req.query.state && req.query.state !== "all" && req.query.state.trim() !== "") {
      query.state = { $regex: new RegExp(req.query.state.trim(), "i") };
    }
    if (req.query.city && req.query.city !== "all" && req.query.city.trim() !== "") {
      query.city = { $regex: new RegExp(req.query.city.trim(), "i") };
    }
    if (req.query.location && req.query.location !== "all" && req.query.location.toLowerCase() !== "all india") {
      const locRegex = new RegExp(req.query.location.trim(), "i");
      query.$or = [
        { state: locRegex },
        { city: locRegex },
        { business_address: locRegex },
        { business_name: locRegex },
      ];
    }

    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .select("-password")
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(perPage),
      Seller.countDocuments(query),
    ]);

    // Attach product count for each seller
    const sellersWithCount = await Promise.all(
      sellers.map(async (s) => {
        const product_count = await Product.countDocuments({
          seller_id: s._id,
        });
        const json = s.toJSON();
        json.product_count = product_count;
        return json;
      }),
    );

    return res.json({
      success: true,
      data: {
        data: sellersWithCount,
        total,
        per_page: perPage,
        current_page: page,
        last_page: Math.ceil(total / perPage) || 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/v1/supplier/:id (Public supplier details + dynamic products) ───
exports.sellerDetails = async (req, res) => {
  try {
    const id = (req.params.id || req.params.slug || "").replace(/-/g, " ");
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Supplier identifier is required." });
    }

    let seller = null;

    const populateOptions = [
      { path: "sellerAbout", select: "title content image" },
      { path: "banners", select: "title image status" },
    ];

    if (mongoose.Types.ObjectId.isValid(id)) {
      seller = await Seller.findById(id)
        .select("-password")
        .populate(populateOptions);
    }

    if (!seller) {
      seller = await Seller.findOne({ username: id.toLowerCase() })
        .select("-password")
        .populate(populateOptions);
    }
    const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!seller) {
      const normalizedName = id.replace(/[-_]/g, " ");
      seller = await Seller.findOne({
        business_name: {
          $regex: `^${escapeRegex(normalizedName)}$`,
          $options: "i",
        },
      })
        .select("-password")
        .populate(populateOptions);
    }

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found." });
    }

    // Products of this seller
    const products = await Product.find({
      seller_id: seller._id,
      status: true,
    })
      .populate("category_id", "name slug")
      .sort({ featured: -1, createdAt: -1 });

    const latestProducts = products.slice(0, 2);
    const moreProducts = products.length > 2 ? products.slice(2) : [];

    const sellerObj = seller.toJSON ? seller.toJSON() : seller;

    // Structured about field from populated sellerAbout
    const firstAbout = Array.isArray(sellerObj.sellerAbout)
      ? sellerObj.sellerAbout[0]
      : sellerObj.sellerAbout;

    if (firstAbout) {
      sellerObj.about = {
        title: firstAbout.title || "",
        description: firstAbout.content || "",
        content: firstAbout.content || "",
        image: firstAbout.image || "",
      };
    } else {
      sellerObj.about = {
        title: "",
        description: sellerObj.description || "",
        content: sellerObj.description || "",
        image: "",
      };
    }

    sellerObj.product_count = products.length;

    return res.json({
      success: true,
      data: {
        seller: sellerObj,
        products,
        latest_products: latestProducts,
        more_products: moreProducts,
        total_products: products.length,
      },
    });
  } catch (err) {
    console.error("Supplier details error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ─── GET /api/v1/products ────────────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page || req.query.limit, 10) || PER_PAGE));
    const skip = (page - 1) * perPage;

    const query = { status: true };
    if (req.query.featured === "1" || req.query.featured === "true") query.featured = true;
    if (req.query.availability) query.availability = req.query.availability;

    // Category filter (support ObjectId or slug)
    if (req.query.category && req.query.category !== "all" && req.query.category !== "") {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        query.category_id = req.query.category;
      } else {
        const Category = require("../../models/Category");
        const cat = await Category.findOne({ slug: req.query.category });
        if (cat) query.category_id = cat._id;
      }
    }

    // Search query
    if (req.query.search || req.query.q) {
      const s = (req.query.search || req.query.q).trim();
      const sRegex = new RegExp(s, "i");
      query.$or = [
        { name: sRegex },
        { description: sRegex },
        { breed: sRegex },
        { location: sRegex },
      ];
    }

    // State & City filters
    const andConds = [];
    if (req.query.state && req.query.state.trim() && req.query.state !== "All" && req.query.state !== "all") {
      andConds.push({
        location: { $regex: new RegExp(req.query.state.trim(), "i") },
      });
    }
    if (req.query.city && req.query.city.trim() && req.query.city !== "All" && req.query.city !== "all") {
      andConds.push({
        location: { $regex: new RegExp(req.query.city.trim(), "i") },
      });
    }
    if (andConds.length > 0) {
      if (query.$and) {
        query.$and.push(...andConds);
      } else {
        query.$and = andConds;
      }
    }

    // Sorting: newly added (newest/latest) or oldest, or price
    let sortObj = { featured: -1, createdAt: -1 };
    const sortParam = (req.query.sort || "newest").toLowerCase();
    if (sortParam === "oldest" || sortParam === "old") {
      sortObj = { featured: -1, createdAt: 1 };
    } else if (sortParam === "newest" || sortParam === "new" || sortParam === "latest") {
      sortObj = { featured: -1, createdAt: -1 };
    } else if (sortParam === "price-low" || sortParam === "price_asc") {
      sortObj = { price: 1, createdAt: -1 };
    } else if (sortParam === "price-high" || sortParam === "price_desc") {
      sortObj = { price: -1, createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category_id", "name slug")
        .sort(sortObj)
        .skip(skip)
        .limit(perPage),
      Product.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        data: products,
        total,
        per_page: perPage,
        current_page: page,
        last_page: Math.ceil(total / perPage) || 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/v1/products/:slug ──────────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const param = req.params.slug;
    const isId = mongoose.Types.ObjectId.isValid(param);
    const query = isId
      ? { $or: [{ slug: param }, { _id: param }], status: true }
      : { slug: param, status: true };

    const product = await Product.findOne(query)
      .populate("category_id", "name slug")
      .populate(
        "seller_id",
        "name username business_name business_address phone email avatar business_image city state",
      );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Fetch related products for recommendations
    const catId = product.category_id?._id || product.category_id;
    let related = [];
    if (catId) {
      related = await Product.find({
        _id: { $ne: product._id },
        category_id: catId,
        status: true,
      })
        .populate("category_id", "name slug")
        .limit(4);
    }

    if (related.length < 4) {
      const more = await Product.find({
        _id: { $nin: [product._id, ...related.map((r) => r._id)] },
        status: true,
      })
        .populate("category_id", "name slug")
        .limit(4 - related.length);
      related = [...related, ...more];
    }

    const json = product.toJSON();
    json.related_products = related;

    return res.json({ success: true, data: json });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
