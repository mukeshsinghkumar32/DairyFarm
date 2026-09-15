const express = require('express');
const router  = express.Router();

// ─── Controllers ─────────────────────────────────────────────────────────────
const authController      = require('../controllers/admin/authController');
const dashboardController = require('../controllers/admin/dashboardController');
const adminCategoryCtrl   = require('../controllers/admin/categoryController');
const adminProductCtrl    = require('../controllers/admin/productController');
const enquiryController   = require('../controllers/admin/enquiryController');
const pubCategoryCtrl     = require('../controllers/api/categoryController');
const pubProductCtrl      = require('../controllers/api/productController');

// ─── Middleware ───────────────────────────────────────────────────────────────
const auth   = require('../middleware/auth');
const upload = require('../config/multer');

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Categories (public)
router.get('/categories',                pubCategoryCtrl.index);
router.get('/categories/:slug/products', pubCategoryCtrl.products);

// Products (public)
router.get('/products',       pubProductCtrl.index);
router.get('/products/:slug', pubProductCtrl.show);

// Contact / Enquiry (public)
router.post('/contact', enquiryController.store);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN AUTH
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/admin/login',  authController.login);
router.post('/admin/logout', auth, authController.logout);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PROTECTED ROUTES  (all require Bearer JWT)
// ═══════════════════════════════════════════════════════════════════════════════

// Dashboard  →  GET /api/v1/admin/dashboard
router.get('/admin/dashboard', auth, dashboardController.index);

// Categories CRUD  →  /api/v1/admin/categories
const categoryRouter = express.Router();
categoryRouter.use(auth);
categoryRouter.get('/',      adminCategoryCtrl.index);
categoryRouter.post('/',     adminCategoryCtrl.store);
categoryRouter.get('/:id',   adminCategoryCtrl.show);
categoryRouter.put('/:id',   adminCategoryCtrl.update);
categoryRouter.patch('/:id', adminCategoryCtrl.update);
categoryRouter.delete('/:id',adminCategoryCtrl.destroy);

router.use('/admin/categories', categoryRouter);

// Products CRUD  →  /api/v1/admin/products
const productRouter = express.Router();
productRouter.use(auth);
productRouter.get('/',       adminProductCtrl.index);
productRouter.post('/',      upload.single('featured_image'), adminProductCtrl.store);
productRouter.get('/:id',    adminProductCtrl.show);
// PUT for standard JSON update, POST for FormData update (frontend uses POST with _method=PUT)
productRouter.put('/:id',    upload.single('featured_image'), adminProductCtrl.update);
productRouter.post('/:id',   upload.single('featured_image'), adminProductCtrl.update);
productRouter.delete('/:id', adminProductCtrl.destroy);

router.use('/admin/products', productRouter);

// Enquiries  →  /api/v1/admin/enquiries
const enquiryRouter = express.Router();
enquiryRouter.use(auth);
enquiryRouter.get('/',      enquiryController.index);
enquiryRouter.patch('/:id', enquiryController.update);

router.use('/admin/enquiries', enquiryRouter);

module.exports = router;
