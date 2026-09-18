const express = require('express');
const router = express.Router();

const sellerAuth = require('../middleware/sellerAuth');
const upload = require('../config/multer');

const authCtrl    = require('../controllers/seller/sellerAuthController');
const bannerCtrl  = require('../controllers/seller/sellerBannerController');
const aboutCtrl   = require('../controllers/seller/sellerAboutController');
const productCtrl = require('../controllers/seller/sellerProductController');
const Category    = require('../models/Category');

// ─── PUBLIC SELLER AUTH ───────────────────────────────────────────────────────
router.post('/auth/login',               authCtrl.login);
router.post('/auth/send-register-otp',   authCtrl.sendRegisterOtp);
router.post('/auth/verify-register-otp', authCtrl.verifyRegisterOtp);
router.post('/auth/resend-otp',          authCtrl.resendOtp);
router.post('/auth/logout',              authCtrl.logout);

// ─── PROTECTED SELLER ROUTES (Require sellerAuth) ─────────────────────────────
router.use(sellerAuth);

const profileUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'business_image', maxCount: 1 },
  { name: 'banner_image', maxCount: 1 },
]);

// Profile
router.get('/profile',              authCtrl.profile);
router.put('/profile',              profileUpload, authCtrl.updateProfile);
router.post('/profile',             profileUpload, authCtrl.updateProfile);

// Banners
router.get('/banners',              bannerCtrl.index);
router.post('/banners',             upload.single('image'), bannerCtrl.store);
router.get('/banners/:id',          bannerCtrl.show);
router.put('/banners/:id',          upload.single('image'), bannerCtrl.update);
router.post('/banners/:id',         upload.single('image'), bannerCtrl.update);
router.delete('/banners/:id',       bannerCtrl.destroy);

// About Us / Company Details
router.get('/about',                aboutCtrl.index);
router.post('/about',               upload.single('image'), aboutCtrl.store);
router.get('/about/:id',            aboutCtrl.show);
router.put('/about/:id',            upload.single('image'), aboutCtrl.update);
router.post('/about/:id',           upload.single('image'), aboutCtrl.update);
router.delete('/about/:id',         aboutCtrl.destroy);

// Categories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await Category.find({ status: { $ne: false } }).sort({ sort_order: 1, name: 1 });
    return res.json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Products
router.get('/products',             productCtrl.index);
router.post('/products',            upload.single('featured_image'), productCtrl.store);
router.get('/products/:id',         productCtrl.show);
router.put('/products/:id',         upload.single('featured_image'), productCtrl.update);
router.post('/products/:id',        upload.single('featured_image'), productCtrl.update);
router.delete('/products/:id',      productCtrl.destroy);

module.exports = router;
