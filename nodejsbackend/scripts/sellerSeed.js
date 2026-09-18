const Seller = require('../models/Seller');
const SellerBanner = require('../models/SellerBanner');
const SellerAbout = require('../models/SellerAbout');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function seedDefaultSeller() {
  try {
    let seller = await Seller.findOne({ email: 'mukeshsinghkumar32@gmail.com' });
    if (!seller) {
      seller = await Seller.create({
        name: 'Mukesh singh',
        username: 'mukesh',
        email: 'mukeshsinghkumar32@gmail.com',
        phone: '8853317611',
        business_name: 'Sohani Dary Farm',
        business_address: 'Madurai, Maduranthakam, Chengalpattu, Tamil Nadu, India',
        banner_image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&q=80',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
        password: 'password',
        role: 'seller',
        status: 'active',
      });
      console.log('✅ Default seller created: mukeshsinghkumar32@gmail.com / password');
    }

    // Seed sample banner if none exists
    const bannerCount = await SellerBanner.countDocuments({ seller_id: seller._id });
    if (bannerCount === 0) {
      await SellerBanner.create({
        seller_id: seller._id,
        title: 'banner',
        image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&q=80',
        status: true,
      });
      console.log('✅ Sample seller banner seeded');
    }

    // Seed sample About Us if none exists
    const aboutCount = await SellerAbout.countDocuments({ seller_id: seller._id });
    if (aboutCount === 0) {
      await SellerAbout.create({
        seller_id: seller._id,
        title: 'Haryana',
        image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&q=80',
        content: '<p>High quality healthy dairy cattle from Haryana breeds. Specialized in Murrah Buffalo and HF Cows.</p>',
      });
      console.log('✅ Sample seller About Us seeded');
    }

    // Ensure sample product for this seller
    const productCount = await Product.countDocuments({ seller_id: seller._id });
    if (productCount === 0) {
      const cat = await Category.findOne({});
      if (cat) {
        await Product.create({
          name: 'Haryana Gir Cow',
          slug: 'haryana-gir-cow-seller',
          category_id: cat._id,
          price: 65000,
          weight: '450',
          gender: 'Female',
          breed: 'Gir Cow',
          delivery_time: '2-4 Days',
          stock_quantity: 5,
          quantity: 5,
          color: 'Brown',
          description: '<p>Pure Gir cow with high milk yield capability and verified vaccination records.</p>',
          featured_image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80',
          seller_id: seller._id,
          status: true,
          availability: 'available',
        });
        console.log('✅ Sample seller product seeded');
      }
    }
  } catch (err) {
    console.error('Error seeding default seller:', err.message);
  }
}

module.exports = seedDefaultSeller;
