const express = require("express");
const router = express.Router();

// ─── Controllers ─────────────────────────────────────────────────────────────
const authController = require("../controllers/admin/authController");
const dashboardController = require("../controllers/admin/dashboardController");
const adminCategoryCtrl = require("../controllers/admin/categoryController");
const adminProductCtrl = require("../controllers/admin/productController");
const enquiryController = require("../controllers/admin/enquiryController");
const adminSellerCtrl = require("../controllers/admin/sellerController");
const pubCategoryCtrl = require("../controllers/api/categoryController");
const pubProductCtrl = require("../controllers/api/productController");
const locationController = require("../controllers/api/locationController");
const searchController = require("../controllers/api/searchController");
const requirementController = require("../controllers/api/requirementController");
const contactController = require("../controllers/api/contactController");
const supplierInquiryController = require("../controllers/api/supplierInquiryController");

// ─── Middleware ───────────────────────────────────────────────────────────────
const auth = require("../middleware/auth");
const upload = require("../config/multer");

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// AI Search & Suggestions
router.get("/search", searchController.search);
router.get("/search/suggestions", searchController.suggestions);
router.get("/ai-search", searchController.search);

// Categories (public)
router.get("/categories", pubCategoryCtrl.index);
router.get("/categories/:slug/products", pubCategoryCtrl.products);

// Products (public)
router.get("/products", pubProductCtrl.index);
router.get("/products/:slug", pubProductCtrl.show);
router.get("/pashu", pubProductCtrl.index);
router.get("/pashu/:slug", pubProductCtrl.show);

// Public Sellers & Suppliers
router.get("/sellers", pubProductCtrl.seller);
router.get("/seller", pubProductCtrl.seller);
router.get("/seller/:id", pubProductCtrl.sellerDetails);
router.get("/suppliers", pubProductCtrl.seller);
router.get("/suppliers/:id", pubProductCtrl.sellerDetails);
router.get("/supplier/:id", pubProductCtrl.sellerDetails);

// Locations & State-Cities (public)
router.get("/locations/state-cities", locationController.getStateCities);
router.get("/locations/states", locationController.getStates);
router.get("/locations/cities", locationController.getCities);

// Contact Us Submissions (public)
router.post("/contact", contactController.store);
router.post("/contacts", contactController.store);

// Price / Product Inquiries (public)
router.post("/enquiries", enquiryController.store);
router.post("/enquiry", enquiryController.store);
router.post("/inquiries", enquiryController.store);
router.post("/inquiry", enquiryController.store);

// Dairy Requirements (public)
router.post("/requirements", requirementController.store);
router.post("/requirement", requirementController.store);

// Supplier Inquiries (public)
router.post("/supplier-inquiries", supplierInquiryController.store);
router.post("/supplier-inquiry", supplierInquiryController.store);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN AUTH
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/admin/login", authController.login);
router.post("/admin/logout", auth, authController.logout);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PROTECTED ROUTES  (all require Bearer JWT)
// ═══════════════════════════════════════════════════════════════════════════════

// Dashboard  →  GET /api/v1/admin/dashboard
router.get("/admin/dashboard", auth, dashboardController.index);

// Categories CRUD  →  /api/v1/admin/categories
const categoryRouter = express.Router();
categoryRouter.use(auth);
categoryRouter.get("/", adminCategoryCtrl.index);
categoryRouter.post("/", upload.single("image"), adminCategoryCtrl.store);
categoryRouter.get("/:id", adminCategoryCtrl.show);
categoryRouter.put("/:id", upload.single("image"), adminCategoryCtrl.update);
categoryRouter.post("/:id", upload.single("image"), adminCategoryCtrl.update);
categoryRouter.patch("/:id", upload.single("image"), adminCategoryCtrl.update);
categoryRouter.delete("/:id", adminCategoryCtrl.destroy);

router.use("/admin/categories", categoryRouter);

// Products CRUD  →  /api/v1/admin/products
const productRouter = express.Router();
productRouter.use(auth);
productRouter.get("/", adminProductCtrl.index);
productRouter.post(
  "/",
  upload.single("featured_image"),
  adminProductCtrl.store,
);
productRouter.get("/:id", adminProductCtrl.show);
productRouter.put(
  "/:id",
  upload.single("featured_image"),
  adminProductCtrl.update,
);
productRouter.post(
  "/:id",
  upload.single("featured_image"),
  adminProductCtrl.update,
);
productRouter.delete("/:id", adminProductCtrl.destroy);

router.use("/admin/products", productRouter);

// Sellers CRUD  →  /api/v1/admin/sellers
const sellerAdminRouter = express.Router();
sellerAdminRouter.use(auth);
sellerAdminRouter.get("/", adminSellerCtrl.index);
sellerAdminRouter.post("/", upload.single("avatar"), adminSellerCtrl.store);
sellerAdminRouter.get("/:id", adminSellerCtrl.show);
sellerAdminRouter.put("/:id", upload.single("avatar"), adminSellerCtrl.update);
sellerAdminRouter.post("/:id", upload.single("avatar"), adminSellerCtrl.update);
sellerAdminRouter.delete("/:id", adminSellerCtrl.destroy);

router.use("/admin/sellers", sellerAdminRouter);

// Enquiries / Price Inquiries  →  /api/v1/admin/enquiries
const enquiryRouter = express.Router();
enquiryRouter.use(auth);
enquiryRouter.get("/", enquiryController.index);
enquiryRouter.patch("/:id", enquiryController.update);
enquiryRouter.delete("/:id", enquiryController.destroy);

router.use("/admin/enquiries", enquiryRouter);

// Contact Us Inquiries  →  /api/v1/admin/contacts
const contactAdminRouter = express.Router();
contactAdminRouter.use(auth);
contactAdminRouter.get("/", contactController.index);
contactAdminRouter.patch("/:id", contactController.update);
contactAdminRouter.delete("/:id", contactController.destroy);

router.use("/admin/contacts", contactAdminRouter);

// Dairy Requirements  →  /api/v1/admin/requirements
const requirementRouter = express.Router();
requirementRouter.use(auth);
requirementRouter.get("/", requirementController.index);
requirementRouter.patch("/:id", requirementController.update);

router.use("/admin/requirements", requirementRouter);

// Supplier Inquiries  →  /api/v1/admin/supplier-inquiries
const supplierInquiryAdminRouter = express.Router();
supplierInquiryAdminRouter.use(auth);
supplierInquiryAdminRouter.get("/", supplierInquiryController.index);
supplierInquiryAdminRouter.patch("/:id", supplierInquiryController.update);
supplierInquiryAdminRouter.delete("/:id", supplierInquiryController.destroy);

router.use("/admin/supplier-inquiries", supplierInquiryAdminRouter);

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER ROUTES  →  /api/v1/sellers
// ═══════════════════════════════════════════════════════════════════════════════
const sellerRoutes = require("./sellerRoutes");
router.use("/sellers", sellerRoutes);

module.exports = router;
