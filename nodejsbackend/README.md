# Sohani Dairy Farm — Node.js Backend

A complete **Express.js + MongoDB** backend that **replaces** the Laravel backend with the **exact same API** the React frontend already uses.

## 📁 Folder Structure

```
nodejsbackend/
├── server.js                     ← Entry point
├── .env                          ← Environment variables
├── config/
│   ├── database.js               ← MongoDB connection
│   └── multer.js                 ← Image upload config
├── middleware/
│   └── auth.js                   ← JWT Bearer token guard
├── models/
│   ├── Admin.js                  ← Admin user model (bcrypt)
│   ├── Category.js               ← Category model
│   ├── Product.js                ← Product model
│   └── Enquiry.js                ← Enquiry / contact model
├── controllers/
│   ├── admin/
│   │   ├── authController.js     ← Login / logout
│   │   ├── dashboardController.js← Stats
│   │   ├── categoryController.js ← CRUD
│   │   ├── productController.js  ← CRUD + image upload
│   │   └── enquiryController.js  ← List + status patch
│   └── api/
│       ├── categoryController.js ← Public listing
│       └── productController.js  ← Public listing + single
├── routes/
│   └── api.js                    ← All routes (mirrors Laravel api.php)
└── scripts/
    └── seed.js                   ← Create admin + sample data
```

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd nodejsbackend
npm install
```

### 2. Configure environment
Edit `.env` — defaults work for local MongoDB:
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/sohani_dairy
JWT_SECRET=sohani_dairy_secret_key_change_in_production
FRONTEND_URL=http://localhost:5173
```

### 3. Seed the database
```bash
npm run seed
```
Creates: **admin@sohanidairy.in / Admin@123** + 5 categories + 4 sample products.

### 4. Start the server
```bash
npm run dev      # development (nodemon, auto-restart)
npm start        # production
```

API runs at **http://localhost:8000**

## 🔗 API Endpoints (same as Laravel)

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET    | `/api/v1/categories` | — | Public category list |
| GET    | `/api/v1/categories/:slug/products` | — | Products by category |
| GET    | `/api/v1/products` | — | Public product list (`?featured=1`) |
| GET    | `/api/v1/products/:slug` | — | Single product detail |
| POST   | `/api/v1/contact` | — | Submit enquiry |
| POST   | `/api/v1/admin/login` | — | Get JWT token |
| POST   | `/api/v1/admin/logout` | ✅ | Logout (stateless) |
| GET    | `/api/v1/admin/dashboard` | ✅ | Stats |
| GET/POST/PUT/DELETE | `/api/v1/admin/categories` | ✅ | Category CRUD |
| GET/POST/PUT/DELETE | `/api/v1/admin/products` | ✅ | Product CRUD + image |
| GET    | `/api/v1/admin/enquiries` | ✅ | Enquiry list |
| PATCH  | `/api/v1/admin/enquiries/:id` | ✅ | Update enquiry status |

## ⚛️ React Frontend — Zero Changes Needed

The React frontend's `vite.config.js` proxies `/api` → `http://127.0.0.1:8000`.  
Since this Node.js server also runs on port **8000**, the frontend works without any configuration change.

Start both together:
```bash
# Terminal 1 — Backend
cd nodejsbackend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```
