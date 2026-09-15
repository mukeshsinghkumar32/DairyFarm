const Product  = require('../../models/Product');
const Category = require('../../models/Category');
const Enquiry  = require('../../models/Enquiry');

// ─── GET /api/v1/admin/dashboard ────────────────────────────────────────────
exports.index = async (_req, res) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalEnquiries,
      availableProducts,
      featuredProducts,
      recentEnquiries,
      recentProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Enquiry.countDocuments(),
      Product.countDocuments({ availability: 'available' }),
      Product.countDocuments({ featured: true }),
      Enquiry.countDocuments({ status: 'new' }),
      Product.find().sort({ createdAt: -1 }).limit(5).populate('category_id', 'name'),
      // recentProducts already in slot above — reuse
    ]);

    return res.json({
      success: true,
      data: {
        total_products:     totalProducts,
        total_categories:   totalCategories,
        total_enquiries:    totalEnquiries,
        available_products: availableProducts,
        featured_products:  featuredProducts,
        new_enquiries:      recentEnquiries,
        recent_products:    recentProducts,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
