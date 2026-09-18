const Product         = require('../../models/Product');
const Category        = require('../../models/Category');
const Enquiry         = require('../../models/Enquiry');
const Requirement     = require('../../models/Requirement');
const ContactUs       = require('../../models/ContactUs');
const SupplierInquiry = require('../../models/SupplierInquiry');
const Seller          = require('../../models/Seller');

// ─── GET /api/v1/admin/dashboard ────────────────────────────────────────────
exports.index = async (_req, res) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalEnquiries,
      totalSupplierInquiries,
      totalRequirements,
      totalContacts,
      totalSellers,
      availableProducts,
      featuredProducts,
      recentEnquiries,
      recentSupplierInquiries,
      recentRequirements,
      recentContacts,
      recentProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Enquiry.countDocuments(),
      SupplierInquiry.countDocuments(),
      Requirement.countDocuments(),
      ContactUs.countDocuments(),
      Seller.countDocuments(),
      Product.countDocuments({ availability: 'available' }),
      Product.countDocuments({ featured: true }),
      Enquiry.countDocuments({ status: 'new' }),
      SupplierInquiry.countDocuments({ status: 'new' }),
      Requirement.countDocuments({ status: 'new' }),
      ContactUs.countDocuments({ status: 'new' }),
      Product.find().sort({ createdAt: -1 }).limit(5).populate('category_id', 'name'),
    ]);

    return res.json({
      success: true,
      data: {
        total_products:           totalProducts,
        total_categories:         totalCategories,
        total_enquiries:          totalEnquiries,
        total_supplier_inquiries: totalSupplierInquiries,
        total_requirements:       totalRequirements,
        total_contacts:           totalContacts,
        total_sellers:            totalSellers,
        available_products:       availableProducts,
        featured_products:        featuredProducts,
        new_enquiries:            recentEnquiries,
        new_supplier_inquiries:   recentSupplierInquiries,
        new_requirements:         recentRequirements,
        new_contacts:             recentContacts,
        recent_products:          recentProducts,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
